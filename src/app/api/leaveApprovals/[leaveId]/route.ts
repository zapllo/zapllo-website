import { NextRequest, NextResponse } from 'next/server';
import Leave from '@/models/leaveModel';
import User, { IUser } from '@/models/userModel';
import mongoose from 'mongoose';
import { isSameDay, isWeekend } from 'date-fns';
import Holiday from '@/models/holidayModel';
import { ILeaveType } from '@/models/leaveTypeModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

type LeaveUnit = 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';

const unitMapping: Record<LeaveUnit, number> = {
    'Full Day': 1,
    '1st Half': 0.5,
    '2nd Half': 0.5,
    '1st Quarter': 0.25,
    '2nd Quarter': 0.25,
    '3rd Quarter': 0.25,
    '4th Quarter': 0.25,
};

interface LeaveDay {
    date: Date; // Use Date instead of string
    unit: LeaveUnit;
    status: string;
}

interface LeaveApprovalBody {
    leaveDays: LeaveDay[];
    remarks?: string;
    action: 'approve' | 'reject';
}

async function getNonDeductibleDaysInRange(
    startDate: Date,
    endDate: Date,
    organization: mongoose.Types.ObjectId,
    includeHolidays: boolean,
    includeWeekOffs: boolean
): Promise<Date[]> {
    let nonDeductibleDays: Date[] = [];

    if (includeHolidays) {
        // Fetch holidays for the organization if includeHolidays is true
        const holidays = await Holiday.find({ organization, holidayDate: { $gte: startDate, $lte: endDate } });
        nonDeductibleDays = holidays.map(holiday => holiday.holidayDate); // Array of holidays
    }

    // If includeWeekOffs is true, add weekends (Saturday and Sunday)
    if (includeWeekOffs) {
        let current = new Date(startDate);
        while (current <= endDate) {
            if (isWeekend(current)) {
                nonDeductibleDays.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
    }

    return nonDeductibleDays;
}

export async function POST(request: NextRequest, { params }: { params: { leaveId: string } }) {
    try {
        const body: LeaveApprovalBody = await request.json();
        const { leaveDays, remarks, action } = body;
        const { leaveId } = params;
        const approvedBy = await getDataFromToken(request);

        console.log(`Processing Leave Approval for Leave ID: ${leaveId}`);
        console.log(`Action: ${action}`);

        // Fetch the leave request and populate the user and leaveType
        const leave = await Leave.findById(leaveId)
            .populate<{ user: IUser; leaveType: ILeaveType }>('user leaveType')
            .exec();

        if (!leave) {
            console.error('Leave not found.');
            return NextResponse.json({ success: false, error: 'Leave not found' });
        }

        const user = leave.user as any;

        // Ensure leaveType exists and is fully populated
        const leaveType = leave.leaveType as any;
        if (!leaveType) {
            console.error('Leave type not found.');
            return NextResponse.json({ success: false, error: 'Leave type not found' });
        }

        // Re-fetch the user's leave balances to ensure we have the most recent data
        await user.populate('leaveBalances.leaveType');

        if (!user.leaveBalances || user.leaveBalances.length === 0) {
            console.error('User leave balances not found.');
            return NextResponse.json({ success: false, error: 'User leave balances not found' });
        }

        // Fetch non-deductible days (holidays, weekends)
        const nonDeductibleDays = await getNonDeductibleDaysInRange(
            new Date(leave.fromDate),
            new Date(leave.toDate),
            user.organization,
            leaveType.includeHolidays,
            leaveType.includeWeekOffs
        );

        console.log(`Non-deductible Days: ${nonDeductibleDays.map(date => date.toISOString()).join(', ')}`);

        let totalApprovedDays = 0;

        // Counters for approved and rejected days
        let approvedDaysCount = 0;
        let rejectedDaysCount = 0;

        // Map and update leave days status
        leave.leaveDays = leave.leaveDays.map((day: any) => {
            const updatedDay = leaveDays.find((d: LeaveDay) =>
                isSameDay(new Date(d.date), new Date(day.date))
            );

            if (updatedDay) {
                day.status = updatedDay.status;

                // Count the approved and rejected days
                if (updatedDay.status === 'Approved') {
                    const isNonDeductible = nonDeductibleDays.some(nonDeductible =>
                        isSameDay(nonDeductible, day.date)
                    );
                    if (!isNonDeductible) {
                        const unit = day.unit as LeaveUnit;
                        totalApprovedDays += unitMapping[unit];
                    }

                    approvedDaysCount++;
                } else if (updatedDay.status === 'Rejected') {
                    rejectedDaysCount++;
                }
            }
            return day;
        });

        console.log(`Total Approved Days to Deduct: ${totalApprovedDays}`);
        console.log(`Approved Days Count: ${approvedDaysCount}`);
        console.log(`Rejected Days Count: ${rejectedDaysCount}`);

        // Find the specific leave type in the user's leaveBalances array
        const userLeaveBalance = user.leaveBalances.find(
            (balance: any) => balance.leaveType && balance.leaveType._id.toString() === leave.leaveType._id.toString()
        );

        if (!userLeaveBalance) {
            console.error('Leave type not found in user leave balances.');
            return NextResponse.json({ success: false, error: 'Leave type not found in user leave balance' });
        }

        console.log(`Current Leave Balance for Leave Type ${userLeaveBalance.leaveType}: ${userLeaveBalance.balance}`);

        // If the leave is being approved, update the user's leave balance for the correct leave type
        if (action === 'approve') {
            // Check if user has enough leave balance to deduct the approved days
            if (userLeaveBalance.balance < totalApprovedDays) {
                console.error('Insufficient leave balance.');
                return NextResponse.json({ success: false, error: 'Insufficient leave balance' });
            }

            // Deduct the approved days from the user's leave balance
            userLeaveBalance.balance -= totalApprovedDays;

            console.log(`New Leave Balance for Leave Type ${userLeaveBalance.leaveType}: ${userLeaveBalance.balance}`);

            // Save the updated user
            await user.save();

            console.log('User leave balance updated successfully.');
        }

        // Determine overall leave status
        const totalDays = leave.leaveDays.length;

        if (approvedDaysCount === totalDays) {
            leave.status = 'Approved'; // All days are approved
            leave.approvedBy = approvedBy;  // Store the approving manager's ID
        } else if (rejectedDaysCount === totalDays) {
            leave.status = 'Rejected'; // All days are rejected
            leave.rejectedBy = approvedBy;  // Store the rejecting manager's ID
        } else {
            leave.status = 'Partially Approved'; // Some days are approved, others are rejected
            leave.approvedBy = approvedBy;  // Store the approving manager's ID
            leave.rejectedBy = approvedBy;  // Store the rejecting manager's ID
        }

        // Store the manager's remarks
        if (remarks) {
            leave.remarks = remarks;
        }

        // Save the updated leave document
        await leave.save();

        console.log('Leave document updated successfully.');

        return NextResponse.json({ success: true, totalApprovedDays });
    } catch (error) {
        console.error('Error updating leave approval:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' });
    }
}
