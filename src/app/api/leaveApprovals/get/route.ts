import { getDataFromToken } from "@/helper/getDataFromToken";
import Leave from "@/models/leaveModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);

        // Find users who report to the current manager
        const teamMembers = await User.find({ reportingManager: userId });

        if (!teamMembers || teamMembers.length === 0) {
            return NextResponse.json({ success: false, error: 'No team members found for this manager' });
        }

        // Get the leave requests for the team members
        const leaves = await Leave.find({ user: { $in: teamMembers.map(member => member._id) } })
            .populate('leaveType')
            .populate('user');

        return NextResponse.json({ success: true, leaves });
    } catch (error: any) {
        console.log('Error during GET leaves: ', error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}