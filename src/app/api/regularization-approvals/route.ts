// src/app/api/regularization-approvals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import User from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken'; // Your custom token extraction function

export async function GET(request: NextRequest) {
    try {
        // Extract manager's userId from the token
        const managerId = await getDataFromToken(request);

        if (!managerId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to the database
        await connectDB();

        // Find team members reporting to the manager
        const teamMembers = await User.find({ reportingManager: managerId });

        if (!teamMembers || teamMembers.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No team members found for this manager' },
                { status: 404 }
            );
        }

        const teamMemberIds = teamMembers.map(member => member._id);

        // Fetch regularization entries that are pending approval
        const pendingRegularizations = await LoginEntry.find({
            userId: { $in: teamMemberIds },
            action: 'regularization',
            approvalStatus: 'Pending',
        })
            .populate('userId', 'firstName lastName email'); // Populate user details if needed

        return NextResponse.json(
            { success: true, regularizations: pendingRegularizations },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching regularization approvals:', error);
        return NextResponse.json(
            { success: false, message: 'Server Error' },
            { status: 500 }
        );
    }
}
