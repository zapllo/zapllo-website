import { NextRequest, NextResponse } from 'next/server';
import Leave, { ILeave } from '@/models/leaveModel';
import User, { IUser } from '@/models/userModel';
import mongoose from 'mongoose';
import { isSameDay, isWeekend } from 'date-fns';
import Holiday from '@/models/holidayModel';
import { ILeaveType } from '@/models/leaveTypeModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';

const sendLeaveApprovalEmail = async (leave: any, status: 'Approved' | 'Partially Approved' | 'Rejected', approvedFor: number) => {
    const reportingManager = leave.user.reportingManager;
    const user = leave.user;
    const emailSubjectMap = {
        Approved: "Leave Application - Approved",
        'Partially Approved': "Leave Application - Partially Approved",
        Rejected: "Leave Application - Rejected"
    };

    const emailOptions: SendEmailOptions = {
        to: `${user.email}`,
        text: emailSubjectMap[status],
        subject: emailSubjectMap[status],
        html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <div style="background-color: #f0f4f8; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>     
                        <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size: 12px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff;">Leave Application - ${status}</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Dear ${user.firstName},</p>
                        <p>Your leave application has been ${status} by ${reportingManager.firstName}, given below are the details:</p>
                        <p><strong>Leave Type:</strong> ${leave.leaveType.leaveType}</p>
                        <p><strong>From:</strong> ${formatDate(leave.fromDate)}</p>
                        <p><strong>To:</strong> ${formatDate(leave.toDate)}</p>
                        <p><strong>Applied Duration:</strong> ${leave.appliedDays} days</p>
                        ${status === 'Partially Approved' ? `<p><strong>Approved Duration:</strong> ${approvedFor} days</p>` : ''}
                        ${leave.remarks ? `<p><strong>Remarks:</strong> ${leave.remarks}</p>` : ''}
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://zapllo.com/attendance/my-leaves" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open App</a>
                        </div>
                        <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>`
    };

    await sendEmail(emailOptions);
};


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

        // Fetch the leave request and populate the user and leaveType and user's leave balances
        const leave = (await Leave.findById(leaveId)
            .populate('leaveType')
            .populate({
                path: 'user',
                populate: [
                    { path: 'reportingManager', select: 'firstName lastName' },
                    { path: 'leaveBalances.leaveType' }
                ]
            })
            .exec()) as ILeave & { leaveType: ILeaveType };

        if (!leave) {
            console.error('Leave not found for ID:', leaveId);
            return NextResponse.json({ success: false, error: 'Leave not found' });
        }

        console.log('Leave found:', leave);
        const user = leave.user as any;

        let approvedFor = 0;
        let approvedDaysCount = 0;
        let rejectedDaysCount = 0;
        // Add this line to ensure remarks are being set
        leave.remarks = remarks || 'Your Leave request has been approved.';  // Make sure remarks are updated

        if (leaveDays) {
            try {
                const nonDeductibleDays = await getNonDeductibleDaysInRange(
                    new Date(leave.fromDate),
                    new Date(leave.toDate),
                    user.organization,
                    leave.leaveType.includeHolidays,
                    leave.leaveType.includeWeekOffs
                );
                console.log('Non-deductible days:', nonDeductibleDays);

                // Update the leave days based on action
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
        } else {
            console.error('Leave days data is missing or undefined');
            return NextResponse.json({ success: false, error: 'Leave days data is missing or undefined' });
        }

        // Determine and set leave status based on counts
        if (approvedDaysCount === leave.leaveDays.length) {
            leave.status = 'Approved';
            leave.approvedBy = approvedBy;
            if (user.whatsappNo) {
                await sendLeaveApprovalWebhookNotification(
                    leave,
                    user.whatsappNo,
                    approvedFor,
                    'leaveapproval'
                );
            }
            await sendLeaveApprovalEmail(leave, 'Approved', approvedFor);
        } else if (rejectedDaysCount === leave.leaveDays.length) {
            leave.status = 'Rejected';
            leave.rejectedBy = approvedBy;
            await sendLeaveApprovalEmail(leave, 'Rejected', 0);
        } else if (approvedDaysCount > 0 && rejectedDaysCount > 0) {
            leave.status = 'Partially Approved';
            leave.approvedBy = approvedBy;
            leave.rejectedBy = approvedBy;
            if (user.whatsappNo) {
                await sendLeaveApprovalWebhookNotification(
                    leave,
                    user.whatsappNo,
                    approvedFor,
                    'partialapproval_v6'
                );
            }
            await sendLeaveApprovalEmail(leave, 'Partially Approved', approvedFor);
        }

        await leave.save();
        console.log('Leave saved after approval.');

        // **Balance Deduction Logic**
        if (leave.status === 'Approved' || leave.status === 'Partially Approved') {
            const leaveBalance = user.leaveBalances.find((b: { leaveType: { _id: { equals: (arg0: mongoose.Types.ObjectId) => any; }; }; }) => {
                // Ensure leaveType is populated
                if (b.leaveType && leave.leaveType && b.leaveType._id && leave.leaveType._id) {
                    return b.leaveType._id.equals(leave.leaveType._id);
                }
                return false;
            });

            if (leaveBalance) {
                leaveBalance.balance -= approvedFor;
                if (leaveBalance.balance < 0) {
                    leaveBalance.balance = 0;
                }
                await user.save();
                console.log('User leave balance updated.');
            } else {
                console.error('User does not have a leave balance entry for this leave type.');
            }
        }

        return NextResponse.json({ success: true, approvedFor });
    } catch (error) {
        console.error('Error in leave approval/rejection flow:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' });
    }
}