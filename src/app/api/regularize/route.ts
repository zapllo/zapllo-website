// src/app/api/regularize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import User, { IUser } from '@/models/userModel';

// Define the shape of the request body
interface RegularizationRequestBody {
    date: string; // ISO string or 'YYYY-MM-DD'
    loginTime: string; // 'HH:MM' format
    logoutTime: string; // 'HH:MM' format
    remarks: string;
}

// Helper function to format date for WhatsApp body variables
const formatDate = (dateInput: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
    };
    return new Intl.DateTimeFormat('en-GB', options).format(dateInput);
};

// Helper function to send WhatsApp notification
const sendRegularizationWhatsAppNotification = async (
    user: any,
    reportingManagerFirstName: string,
    reportingManagerPhoneNumber: string,
    loginTime: string,
    logoutTime: string,
    remarks: string,
    createdAt: Date
) => {
    const payload = {
        phoneNumber: reportingManagerPhoneNumber,
        templateName: 'regularizationrequest',
        bodyVariables: [
            reportingManagerFirstName, // 1. Reporting Manager's first name
            user.firstName,            // 2. User's first name
            formatDate(createdAt),     // 3. Created at date (formatted as DDMMYYYY)
            loginTime,                 // 4. Login time
            logoutTime,                // 5. Logout time
            remarks,                   // 6. Remarks
        ],
    };
    console.log(payload, 'payload');
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
            throw new Error(`Webhook API error: ${JSON.stringify(responseData)}`);
        }

        console.log('Regularization WhatsApp notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending regularization WhatsApp notification:', error);
    }
};

export async function POST(request: NextRequest) {
    const userId = await getDataFromToken(request);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }

    await connectDB();

    const user = await User.findById(userId).populate<{ reportingManager: IUser }>({
        path: 'reportingManager',
        select: 'firstName lastName whatsappNo',
    });

    if (!user) {
        return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 404 }
        );
    }

    let body: RegularizationRequestBody;

    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Invalid JSON' },
            { status: 400 }
        );
    }

    const { date, loginTime, logoutTime, remarks } = body;

    if (!date || !loginTime || !logoutTime || !remarks) {
        return NextResponse.json(
            { success: false, message: 'All fields are required' },
            { status: 400 }
        );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

    if (!dateRegex.test(date)) {
        return NextResponse.json(
            { success: false, message: 'Invalid date format. Use YYYY-MM-DD.' },
            { status: 400 }
        );
    }

    if (!timeRegex.test(loginTime) || !timeRegex.test(logoutTime)) {
        return NextResponse.json(
            { success: false, message: 'Invalid time format. Use HH:MM.' },
            { status: 400 }
        );
    }

    const timestamp = new Date(date);
    if (isNaN(timestamp.getTime())) {
        return NextResponse.json(
            { success: false, message: 'Invalid date.' },
            { status: 400 }
        );
    }

    try {
        const regularizationEntry = new LoginEntry({
            userId,
            action: 'regularization',
            timestamp,
            loginTime,
            logoutTime,
            remarks,
        });

        await regularizationEntry.save();

        // Send WhatsApp message after successful save
        let reportingManagerFirstName = 'N/A';
        let reportingManagerPhoneNumber = '';

        if (user.reportingManager && 'firstName' in user.reportingManager) {
            const reportingManager = user.reportingManager as IUser;
            reportingManagerFirstName = reportingManager.firstName || 'N/A';
            reportingManagerPhoneNumber = reportingManager.whatsappNo || '';
        }

        await sendRegularizationWhatsAppNotification(
            user,
            reportingManagerFirstName,
            reportingManagerPhoneNumber,
            loginTime,
            logoutTime,
            remarks,
            new Date() // Use current date for createdAt field
        );

        return NextResponse.json(
            { success: true, message: 'Regularization request submitted successfully.' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in /api/regularize:', error);
        return NextResponse.json(
            { success: false, message: 'Server Error' },
            { status: 500 }
        );
    }
}
