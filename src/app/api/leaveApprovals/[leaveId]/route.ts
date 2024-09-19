import { NextResponse } from 'next/server';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import mongoose from 'mongoose';
import { isSameDay, isWeekend } from 'date-fns';
import Holiday from '@/models/holidayModel';


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

interface ILeaveDay {
    date: Date;
    unit: LeaveUnit;
    status: string;
}

interface LeaveApprovalBody {
    leaveDays: LeaveDay[];
    remarks?: string;
    action: 'approve' | 'reject';
}


async function getNonDeductibleDaysInRange(startDate: Date, endDate: Date, organization: mongoose.Types.ObjectId, includeHolidays: boolean, includeWeekOffs: boolean) {
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


export async function POST(request: Request, { params }: { params: { leaveId: string } }) {
    try {
        const body: LeaveApprovalBody = await request.json();
        const { leaveDays, remarks, action } = body;
        const { leaveId } = params;

        // Fetch the leave request and populate the user and leaveType
        const leave = await Leave.findById(leaveId).populate<{ user: mongoose.Document, leaveType: mongoose.Document }>('user leaveType');

        if (!leave) {
            return NextResponse.json({ success: false, error: 'Leave not found' });
        }

        const user = leave.user as any;

        // Ensure leaveType exists and is fully populated
        const leaveType = leave.leaveType as any;
        if (!leaveType) {
            return NextResponse.json({ success: false, error: 'Leave type not found' });
        }

        // Re-fetch the user's leave balances to ensure we have the most recent data
        await user.populate('leaveBalances.leaveType');

        if (!user.leaveBalances || user.leaveBalances.length === 0) {
            console.error('User leave balances not found');
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

        let totalApprovedDays = 0;

        // Counters for approved and rejected days
        let approvedDaysCount = 0;
        let rejectedDaysCount = 0;

        // Map and update leave days status
        leave.leaveDays = leave.leaveDays.map((day: ILeaveDay) => {
            const updatedDay = leaveDays.find((d: LeaveDay) =>
                new Date(d.date).toISOString() === day.date.toISOString() // Ensure both dates are compared as ISO strings
            );

            if (updatedDay) {
                day.status = updatedDay.status;

                // Count the approved and rejected days
                if (updatedDay.status === 'Approved') {
                    const isNonDeductible = nonDeductibleDays.some(nonDeductible =>
                        isSameDay(nonDeductible, day.date)
                    );
                    if (!isNonDeductible) {
                        totalApprovedDays += unitMapping[day.unit]; // Add the approved unit to totalApprovedDays
                    }
                    approvedDaysCount++;
                } else if (updatedDay.status === 'Rejected') {
                    rejectedDaysCount++;
                }
            }
            return day;
        });

        // Find the specific leave type in the user's leaveBalances array
        const userLeaveBalance = user.leaveBalances.find(
            (balance: any) => balance.leaveType.equals(leave.leaveType) // Use equals() for ObjectId comparison
        );

        if (!userLeaveBalance) {
            console.error('Leave type not found in user leave balances');
            return NextResponse.json({ success: false, error: 'Leave type not found in user leave balance' });
        }

        // If the leave is being approved, update the user's leave balance for the correct leave type
        if (action === 'approve') {
            // Check if user has enough leave balance to deduct the approved days
            if (userLeaveBalance.balance < totalApprovedDays) {
                return NextResponse.json({ success: false, error: 'Insufficient leave balance' });
            }

            
            // Directly update the balance in the database
            const updateResult = await User.updateOne(
                { _id: user._id, 'leaveBalances.leaveType': leave.leaveType },
                { $inc: { 'leaveBalances.$.balance': -totalApprovedDays } }
            );

            console.log('Update result:', updateResult);
            // Save the updated user leave balance
            // await user.save();
        }

        // Determine overall leave status
        const totalDays = leave.leaveDays.length;

        if (approvedDaysCount === totalDays) {
            leave.status = 'Approved';  // All days are approved
        } else if (rejectedDaysCount === totalDays) {
            leave.status = 'Rejected';  // All days are rejected
        } else {
            leave.status = 'Partially Approved';  // Some days are approved, others are rejected
        }

        // Store the manager's remarks
        if (remarks) {
            leave.remarks = remarks;
        }

        // Save the updated leave document
        await leave.save();

        return NextResponse.json({ success: true, totalApprovedDays });
    } catch (error) {
        console.error('Error updating leave approval:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' });
    }
}


