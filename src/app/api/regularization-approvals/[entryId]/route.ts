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

// Helper function to format date
const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
};

// Helper function to send WhatsApp notification
const sendWhatsAppRegularizationNotification = async (
    user: any,
    phoneNumber: string,
    reportingManager: any,
    regularizationEntry: any,
    templateName: string
) => {
    const payload = {
        phoneNumber,
        templateName, // Use the dynamic template name for either approval or rejection
        bodyVariables: [
            user.firstName, // 1. User's first name
            reportingManager.firstName, // 2. Reporting Manager's first name
            formatDate(regularizationEntry.createdAt), // 3. Created at date (formatted)
            regularizationEntry.loginTime, // 4. Login time
            regularizationEntry.logoutTime, // 5. Logout time
            regularizationEntry.remarks || 'No remarks', // 6. Remarks
        ],
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

        console.log('WhatsApp notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
    }
};


export async function PATCH(request: NextRequest, { params }: { params: { entryId: string } }) {
    const { entryId } = params;

    try {
        const managerId = await getDataFromToken(request);

        if (!managerId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const loggedInUser = await User.findById(managerId);

        if (!loggedInUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const regularizationEntry = await LoginEntry.findById(entryId);
        if (!regularizationEntry) {
            return NextResponse.json({ success: false, message: 'Regularization entry not found' }, { status: 404 });
        }

        if (regularizationEntry.action !== 'regularization' || regularizationEntry.approvalStatus !== 'Pending') {
            return NextResponse.json({ success: false, message: 'Invalid regularization entry' }, { status: 400 });
        }
        const user = await User.findById(regularizationEntry.userId).populate('reportingManager', 'firstName lastName');
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const isManager = user.reportingManager?.toString() === managerId;
        const isOrgAdmin = loggedInUser.role === 'orgAdmin';

        if (!isManager && !isOrgAdmin) {
            return NextResponse.json({ success: false, message: 'You do not have permission to approve this regularization' }, { status: 403 });
        }

        const body: ApprovalRequestBody = await request.json();
        const { action, notes } = body;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, message: 'Invalid action. Must be approve or reject.' }, { status: 400 });
        }

        regularizationEntry.approvalStatus = action === 'approve' ? 'Approved' : 'Rejected';
        regularizationEntry.approvedBy = managerId;
        regularizationEntry.approvedAt = new Date();
        regularizationEntry.notes = notes || '';

        await regularizationEntry.save();

       // Send WhatsApp notification based on the action (approve or reject)
       if (user.whatsappNo) {
        const templateName = action === 'approve' ? 'regularizationapproval' : 'regularizationrejection';
        await sendWhatsAppRegularizationNotification(user, user.whatsappNo, user.reportingManager, regularizationEntry, templateName);
    }

        return NextResponse.json({ success: true, message: `Regularization has been ${action}d successfully.` }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating regularization approval:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest, { params }: { params: { entryId: string } }) {
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

        // Fetch the regularization entry
        const regularizationEntry = await LoginEntry.findById(entryId);

        if (!regularizationEntry) {
            return NextResponse.json(
                { success: false, message: 'Regularization entry not found' },
                { status: 404 }
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

        // Check if the logged-in user has the authority to delete this entry
        const isManager = user.reportingManager?.toString() === managerId;

        if (!isManager) {
            return NextResponse.json(
                { success: false, message: 'You do not have permission to delete this regularization' },
                { status: 403 }
            );
        }

        // Delete the regularization entry using findByIdAndDelete
        await LoginEntry.findByIdAndDelete(entryId);

        return NextResponse.json(
            { success: true, message: 'Regularization entry deleted successfully.' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error deleting regularization entry:', error);
        return NextResponse.json(
            { success: false, message: 'Server Error' },
            { status: 500 }
        );
    }
}
