// src/app/api/regularization-approvals/[entryId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import User from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken'; // Your custom token extraction function

interface ApprovalRequestBody {
    action: 'approve' | 'reject';
    remarks?: string;
    notes?: string;
}

export async function PATCH(request: NextRequest, { params }: { params: { entryId: string } }) {
    const { entryId } = params;

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

        // Fetch the logged-in user's data to get the role
        const loggedInUser = await User.findById(managerId);

        if (!loggedInUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch the regularization entry
        const regularizationEntry = await LoginEntry.findById(entryId);

        if (!regularizationEntry) {
            return NextResponse.json(
                { success: false, message: 'Regularization entry not found' },
                { status: 404 }
            );
        }

        // Ensure the entry is of type 'regularization' and is pending approval
        if (regularizationEntry.action !== 'regularization' || regularizationEntry.approvalStatus !== 'Pending') {
            return NextResponse.json(
                { success: false, message: 'Invalid regularization entry' },
                { status: 400 }
            );
        }

        // Fetch the user who submitted the regularization
        const user = await User.findById(regularizationEntry.userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if the logged-in user has the authority to approve/reject this entry
        const isManager = user.reportingManager?.toString() === managerId;
        const isOrgAdmin = loggedInUser.role === 'orgAdmin';

        if (!isManager && !isOrgAdmin) {
            return NextResponse.json(
                { success: false, message: 'You do not have permission to approve this regularization' },
                { status: 403 }
            );
        }

        // Parse the request body
        const body: ApprovalRequestBody = await request.json();
        const { action, notes } = body;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: 'Invalid action. Must be approve or reject.' },
                { status: 400 }
            );
        }

        // Update the regularization entry based on the action
        regularizationEntry.approvalStatus = action === 'approve' ? 'Approved' : 'Rejected';
        regularizationEntry.approvedBy = managerId;
        regularizationEntry.approvedAt = new Date();
        regularizationEntry.notes = notes || '';

        await regularizationEntry.save();

        // If approved, you might want to adjust any relevant data (e.g., updating balances)
        // For simplicity, this example assumes regularization doesn't affect balances
        // Modify as per your business logic

        return NextResponse.json(
            { success: true, message: `Regularization has been ${action}d successfully.` },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error updating regularization approval:', error);
        return NextResponse.json(
            { success: false, message: 'Server Error' },
            { status: 500 }
        );
    }
}
