import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Database connection
import Leave from '@/models/leaveTypeModel'; // Import the Leave model
import { getDataFromToken } from '@/helper/getDataFromToken'; // Import your token helper
import User from '@/models/userModel'; // Import the User model

connectDB(); // Establish the database connection

// POST: Create a new leave type
export async function POST(request: NextRequest) {
    try {
        // Extract userId from the token using helper
        const userId = await getDataFromToken(request);
        const authenticatedUser = await User.findById(userId);
        if (!authenticatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Parse the request body
        const {
            leaveType,
            description,
            allotedLeaves,
            type,
            backdatedLeaveDays,
            advanceLeaveDays,
            includeHolidays,
            includeWeekOffs,
            unit,
        } = await request.json();

        // Create a new leave document with the organization assigned from the authenticated user
        const newLeave = new Leave({
            leaveType,
            description,
            allotedLeaves,
            type,
            backdatedLeaveDays,
            advanceLeaveDays,
            includeHolidays,
            includeWeekOffs,
            unit,
            organization: authenticatedUser.organization, // Automatically assign the organization from the authenticated user
        });

        // Save the leave document
        await newLeave.save();

        // Return a success response
        return NextResponse.json({ message: 'Leave type created successfully', leave: newLeave });
    } catch (error) {
        console.error('Error creating leave type:', error);
        return NextResponse.json({ error: 'Failed to create leave type' }, { status: 500 });
    }
}

// GET: Fetch all leave types for the authenticated user's organization
export async function GET(request: NextRequest) {
    try {
        // Extract userId from the token using helper
        const userId = await getDataFromToken(request);
        const authenticatedUser = await User.findById(userId);
        if (!authenticatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch all leave types for the authenticated user's organization
        const leaveTypes = await Leave.find({ organization: authenticatedUser.organization });

        // Return the leave types
        return NextResponse.json(leaveTypes);
    } catch (error) {
        console.error('Error fetching leave types:', error);
        return NextResponse.json({ error: 'Failed to fetch leave types' }, { status: 500 });
    }
}


