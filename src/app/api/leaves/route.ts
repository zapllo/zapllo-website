import { NextRequest, NextResponse } from 'next/server';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import LeaveType from '@/models/leaveTypeModel';
import Holiday from '@/models/holidayModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { isWeekend, isSameDay } from 'date-fns';
import mongoose from 'mongoose';
import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';

type LeaveUnit = 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';

// Define the mapping for leave units and their corresponding values
const unitMapping: Record<LeaveUnit, number> = {
    'Full Day': 1,
    '1st Half': 0.5,
    '2nd Half': 0.5,
    '1st Quarter': 0.25,
    '2nd Quarter': 0.25,
    '3rd Quarter': 0.25,
    '4th Quarter': 0.25,
};

// Helper function to format date
const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
    return formattedDate;
};

// Helper function to send WhatsApp notification
const sendLeaveWebhookNotification = async (
    leave: any,
    reportingManager: any,
    user: any,
    leaveType: any,
    phoneNumber: string
) => {
    const payload = {
        phoneNumber: phoneNumber,
        templateName: 'leaverequest', // Change this to the correct template name
        bodyVariables: [
            reportingManager.firstName,  // Reporting Manager's first name
            user.firstName,              // User's first name
            leaveType.leaveType,
            formatDate(leave.fromDate),   // Start date of the leave
            formatDate(leave.toDate),     // End date of the leave
            String(leave.appliedDays),           // Total applied days
            leave.leaveReason            // Reason for the leave
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

        console.log('Leave Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending leave webhook notification:', error);
    }
};

// Function to get holidays and weekends in the leave range if applicable
async function getNonDeductibleDaysInRange(startDate: Date, endDate: Date, organization: mongoose.Types.ObjectId, includeHolidays: boolean, includeWeekOffs: boolean) {
    let nonDeductibleDays: Date[] = [];

    if (includeHolidays) {
        console.log('Fetching holidays for the organization...');
        const holidays = await Holiday.find({ organization, holidayDate: { $gte: startDate, $lte: endDate } });
        nonDeductibleDays = holidays.map(holiday => holiday.holidayDate);
        console.log('Holidays:', nonDeductibleDays);
    }

    if (includeWeekOffs) {
        let current = new Date(startDate);
        while (current <= endDate) {
            if (isWeekend(current)) {
                nonDeductibleDays.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        console.log('Non-deductible weekends:', nonDeductibleDays);
    }

    return nonDeductibleDays;
}

export async function POST(request: NextRequest) {
    try {
        console.log('Processing leave creation...');
        const userId = await getDataFromToken(request);
        const body = await request.json();
        console.log('Request body:', body);

        // Fetch the user applying for the leave
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found');
            return NextResponse.json({ success: false, error: 'User not found' });
        }

        console.log('User found:', user.firstName, user.lastName);

        // Ensure that user.organization is a valid ObjectId
        if (!user.organization || !(user.organization instanceof mongoose.Types.ObjectId)) {
            console.error('Invalid or missing organization');
            return NextResponse.json({ success: false, error: 'Invalid or missing organization for the user.' });
        }

        // Re-fetch the user after initialization to ensure updated balances are available
        await user.populate({
            path: 'leaveBalances.leaveType',
            model: 'leaveTypes',
        });

        // Fetch the leave type to get the balance for that type
        const leaveType = await LeaveType.findById(body.leaveType);
        if (!leaveType) {
            console.error('Leave type not found');
            return NextResponse.json({ success: false, error: 'Leave type not found' });
        }

        // console.log('Leave type found:', leaveType.name);

        // Fetch non-deductible days (holidays, weekends)
        const nonDeductibleDays = await getNonDeductibleDaysInRange(
            new Date(body.fromDate),
            new Date(body.toDate),
            user.organization,
            leaveType.includeHolidays,
            leaveType.includeWeekOffs
        );

        let totalAppliedDays = 0;
        console.log('Calculating applied days...');

        // Calculate total applied days
        for (const leaveDay of body.leaveDays) {
            if (!nonDeductibleDays.some(day => isSameDay(day, new Date(leaveDay.date)))) {
                totalAppliedDays += unitMapping[leaveDay.unit as LeaveUnit];
            }
        }

        console.log('Total applied days:', totalAppliedDays);

        const userLeaveBalance = user.leaveBalances.find(
            (balance) => String(balance.leaveType?._id || balance.leaveType) === String(body.leaveType)
        );

        if (!userLeaveBalance || userLeaveBalance.balance < totalAppliedDays) {
            console.error('Insufficient leave balance');
            return NextResponse.json({ success: false, error: 'Insufficient leave balance' });
        }

        // Create new leave
        console.log('Creating leave...');
        const newLeave = new Leave({
            user: userId,
            leaveType: body.leaveType,
            fromDate: body.fromDate,
            toDate: body.toDate,
            leaveDays: body.leaveDays,
            appliedDays: totalAppliedDays,
            leaveReason: body.leaveReason,
            attachment: body.attachment,
            audioUrl: body.audioUrl || '',
            status: 'Pending',
        });

        // Save the leave
        const savedLeave = await newLeave.save();
        if (!savedLeave) {
            throw new Error('Leave creation failed');
        }

        console.log('Leave created successfully:', savedLeave._id);

        // Fetch reporting manager details
        console.log('Fetching reporting manager...');
        const reportingManager = await User.findById(user.reportingManager);
        if (!reportingManager || !reportingManager.whatsappNo) {
            console.error('Reporting manager not found or WhatsApp number missing');
            throw new Error('Reporting manager not found or WhatsApp number missing');
        }

        console.log('Reporting manager found:', reportingManager.firstName, reportingManager.whatsappNo);
        // **Populate the leaveType in savedLeave** before sending the notification
        await savedLeave.populate('leaveType');
        if (reportingManager && reportingManager.notifications.email) {
            const emailOptions: SendEmailOptions = {
                to: `${reportingManager.email}`,
                text: 'New Leave Application',
                subject: "New Leave Application",
                html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
                    <div style="background-color: #f0f4f8; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>     
                        <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size: 12px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff;">New Leave Application</h1>
                            </div>
                            <div style="padding: 20px;">
                                <p>Dear ${reportingManager.firstName},</p>
                                <p>A new leave application has been raised by ${user.firstName}, given below are the details:</p>
                                <p><strong>Leave Type:</strong> ${leaveType.leaveType}</p>
                                <p><strong>Reason:</strong> ${savedLeave.leaveReason}</p>
                                <p><strong>From:</strong> ${formatDate(savedLeave.fromDate)}</p>
                                <p><strong>To:</strong> ${formatDate(savedLeave.toDate)}</p>
                                <p><strong>Applied Duration:</strong> ${savedLeave.appliedDays} days</p>
                                <div style="text-align: center; margin-top: 20px;">
                                    <a href="https://zapllo.com/attendance/my-leaves" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open App</a>
                                </div>
                                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                            </div>
                        </div>
                    </div>
                </body>`,
            };
            await sendEmail(emailOptions);
        }
        // Send WhatsApp notification if enabled for reporting manager
        if (reportingManager.notifications.whatsapp) {
            console.log('Sending WhatsApp notification...');
            await sendLeaveWebhookNotification(
                savedLeave,
                reportingManager,
                user,
                savedLeave.leaveType,  // Use the populated leaveType
                reportingManager.whatsappNo
            );
        } else {
            console.log('WhatsApp notifications are disabled for the reporting manager.');
        }

        return NextResponse.json({ success: true, leave: savedLeave });
    } catch (error: any) {
        console.error('Error during leave creation:', error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);

        // Fetch all leaves for the logged-in user and populate leaveType
        const userLeaves = await Leave.find({ user: userId })
            .populate({ path: 'leaveType', model: 'leaveTypes' })
            .populate({ path: 'user', model: 'users', select: 'firstName lastName _id' })
            .populate({ path: 'approvedBy', model: 'users', select: 'firstName lastName _id' })
            .populate({ path: 'rejectedBy', model: 'users', select: 'firstName lastName _id' })
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order (latest entries first)

        if (!userLeaves || userLeaves.length === 0) {
            return NextResponse.json({ success: false, error: 'No leaves found for this user' });
        }

        return NextResponse.json({ success: true, leaves: userLeaves });
    } catch (error: any) {
        console.log('Error fetching user leaves:', error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}
