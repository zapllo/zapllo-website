// src/app/api/regularize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import { getDataFromToken } from '@/helper/getDataFromToken'; // Your custom token extraction function
import User from '@/models/userModel';

// Define the shape of the request body
interface RegularizationRequestBody {
    date: string; // ISO string or 'YYYY-MM-DD'
    loginTime: string; // 'HH:MM' format
    logoutTime: string; // 'HH:MM' format
    remarks: string;
}

export async function POST(request: NextRequest) {
    // Extract userId from the token
    const userId = await getDataFromToken(request);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Fetch the user to ensure they exist
    const user = await User.findById(userId); // Ensure User model is imported or accessible

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

    // Basic validation
    if (!date || !loginTime || !logoutTime || !remarks) {
        return NextResponse.json(
            { success: false, message: 'All fields are required' },
            { status: 400 }
        );
    }

    // Additional validation (e.g., date format, time format)
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

    // Convert date to Date object
    const timestamp = new Date(date);
    if (isNaN(timestamp.getTime())) {
        return NextResponse.json(
            { success: false, message: 'Invalid date.' },
            { status: 400 }
        );
    }

    try {
        await connectDB();

        const regularizationEntry = new LoginEntry({
            userId,
            action: 'regularization',
            timestamp,
            loginTime,
            logoutTime,
            remarks,
        });

        await regularizationEntry.save();

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
