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

// Helper function to format date
const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
};

// Helper function to send WhatsApp notification
const sendLeaveApprovalWebhookNotification = async (
    leave: any,
    phoneNumber: string,
    approvedFor: number,
    templateName: string // Add this to make it dynamic
) => {
    const payload = {
        phoneNumber,
        templateName,  // Use the dynamic template name here
        bodyVariables: [
            leave.user.firstName,  // 1. User's first name
            leave.user.reportingManager?.firstName,  // 2. Reporting Manager's first name
            leave.leaveType.leaveType,  // 3. Leave type
            formatDate(leave.fromDate),  // 4. From date
            formatDate(leave.toDate),    // 5. To date
            String(leave.appliedDays),   // 6. Applied days
            String(approvedFor),         // 7. Number of days approved
            leave.remarks || 'No remarks'  // 8. Leave remarks
        ]
    };

    console.log('Sending WhatsApp payload:', payload);

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            console.error('Webhook API error:', responseData);
            throw new Error(`Webhook API error, response data: ${JSON.stringify(responseData)}`);
        }

        console.log('Leave approval Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending leave approval webhook notification:', error);
    }
};

async function getNonDeductibleDaysInRange(
    startDate: Date,
    endDate: Date,
    organization: mongoose.Types.ObjectId,
    includeHolidays: boolean,
    includeWeekOffs: boolean
): Promise<Date[]> {
    let nonDeductibleDays: Date[] = [];

    if (includeHolidays) {
        const holidays = await Holiday.find({ organization, holidayDate: { $gte: startDate, $lte: endDate } });
        nonDeductibleDays = holidays.map(holiday => holiday.holidayDate);
    }

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
    console.log('POST request received for leave approval/rejection');
    try {
        const body: LeaveApprovalBody = await request.json();
        console.log('POST request body:', body);

        const { leaveDays, remarks, action } = body;
        const { leaveId } = params;
        const approvedBy = await getDataFromToken(request);

        // Fetch the leave request and populate the user and leaveType
        const leave = await Leave.findById(leaveId)
            .populate<{ user: IUser; leaveType: ILeaveType }>('user leaveType')
            .populate({
                path: 'user',
                populate: { path: 'reportingManager', model: 'users', select: 'firstName lastName' }
            })
            .exec();

        if (!leave) {
            console.error('Leave not found for ID:', leaveId);
            return NextResponse.json({ success: false, error: 'Leave not found' });
        }

        console.log('Leave found:', leave);
        const user = leave.user as any;

        try {
            await user.populate('leaveBalances.leaveType');
            console.log('User leave balances populated:', user.leaveBalances);
        } catch (populateError) {
            console.error('Error populating leave balances:', populateError);
            return NextResponse.json({ success: false, error: 'Error populating leave balances' });
        }

        let approvedFor = 0;
        let approvedDaysCount = 0;
        let rejectedDaysCount = 0;

        try {
            const nonDeductibleDays = await getNonDeductibleDaysInRange(
                new Date(leave.fromDate),
                new Date(leave.toDate),
                user.organization,
                leave.leaveType.includeHolidays,
                leave.leaveType.includeWeekOffs
            );
            console.log('Non-deductible days:', nonDeductibleDays);

            // Update the leave days
            leave.leaveDays = leave.leaveDays.map(day => {
                const updatedDay = leaveDays.find(d => isSameDay(new Date(d.date), new Date(day.date)));
                if (updatedDay) {
                    day.status = updatedDay.status;
                    if (updatedDay.status === 'Approved') {
                        const isNonDeductible = nonDeductibleDays.some(nonDeductible =>
                            isSameDay(nonDeductible, day.date)
                        );
                        if (!isNonDeductible) {
                            const unit = day.unit as LeaveUnit;
                            approvedFor += unitMapping[unit];
                        }
                        approvedDaysCount++;
                    } else if (updatedDay.status === 'Rejected') {
                        rejectedDaysCount++;
                    }
                }
                return day;
            });
        } catch (approvalError) {
            console.error('Error updating leave days:', approvalError);
            return NextResponse.json({ success: false, error: 'Error updating leave days' });
        }

        if (approvedDaysCount === leave.leaveDays.length) {
            leave.status = 'Approved';
            leave.approvedBy = approvedBy;
            console.log('Leave fully approved.');

            if (user.whatsappNo) {
                console.log('WhatsApp number exists:', user.whatsappNo);
                await sendLeaveApprovalWebhookNotification(
                    leave,
                    user.whatsappNo,
                    approvedFor,
                    'leaveapproval' // Full approval template
                );
            } else {
                console.error('WhatsApp number is missing for user:', user._id);
            }
        } else if (rejectedDaysCount === leave.leaveDays.length) {
            leave.status = 'Rejected';
            leave.rejectedBy = approvedBy;
            console.log('Leave fully rejected.');
        } else if (approvedDaysCount > 0 && rejectedDaysCount > 0) {
            leave.status = 'Partially Approved';
            leave.approvedBy = approvedBy;
            leave.rejectedBy = approvedBy;
            console.log('Leave partially approved.');

            // Send WhatsApp notification for partial approval
            if (user.whatsappNo) {
                console.log('WhatsApp number exists:', user.whatsappNo);
                await sendLeaveApprovalWebhookNotification(
                    leave,
                    user.whatsappNo,
                    approvedFor,
                    'partialapproval_v6' // Partial approval template
                );
            } else {
                console.error('WhatsApp number is missing for user:', user._id);
            }
        }

        await leave.save();

        console.log('Leave saved after approval.');

        return NextResponse.json({ success: true, approvedFor });
    } catch (error) {
        console.error('Error in leave approval/rejection flow:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' });
    }
}
