import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel'; // Import the Leave model
import Holiday from '@/models/holidayModel'; // Import the Holiday model
import User from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken';

export async function GET(req: NextRequest) {
    await connectDB();    // Get logged-in user
    const userId = await getDataFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the user details
    const loggedInUser = await User.findById(userId);
    if (!loggedInUser || !loggedInUser.organization) {
        return NextResponse.json({ message: 'User not found or no organization found' }, { status: 404 });
    }

    const { searchParams } = req.nextUrl; // Use req.nextUrl instead of new URL(req.url)
    const date = searchParams.get('date'); // Expecting format like "2024-09"

    if (!date || !/^\d{4}-\d{2}$/.test(date)) {
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }

    try {
        // Construct start and end of the month
        const startDate = new Date(`${date}-01T00:00:00Z`);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

        // 1. Fetch Attendance (Login/Logout) Data for all users in the organization
        const userIds = await User.find({ organization: loggedInUser.organization }).select('_id');
        const monthlyAttendance = await LoginEntry.find({
            userId: { $in: userIds },
            timestamp: {
                $gte: startDate,
                $lt: endDate,
            }
        }).populate('userId');


        // 2. Fetch Leave Data for the Same Month for all users in the organization
        const leaveEntries = await Leave.find({
            user: { $in: await User.find({ organization: loggedInUser.organization }).select('_id') }, // Filter by users in the same organization
            $or: [
                { fromDate: { $gte: startDate, $lt: endDate } },  // Leave starts within the month
                { toDate: { $gte: startDate, $lt: endDate } },    // Leave ends within the month
                { fromDate: { $lt: startDate }, toDate: { $gte: endDate } } // Leave spans the entire month
            ],
            status: 'Approved' // Only consider approved leaves
        }).populate('user');  // Populate the user field for leave data

        // 3. Fetch Holidays for the Same Month for the Organization
        const holidays = await Holiday.find({
            organization: loggedInUser.organization, // Filter by the logged-in user's organization
            holidayDate: {
                $gte: startDate,
                $lt: endDate,
            }
        });

        // Map leave data to include all days within the leave period
        const leaveDays = new Set<string>();
        leaveEntries.forEach(leave => {
            const fromDate = new Date(leave.fromDate);
            const toDate = new Date(leave.toDate);
            for (let d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
                leaveDays.add(d.toISOString().split('T')[0]);
            }
        });

        // Construct the organization-wide report
        const userwiseReport = monthlyAttendance.map(entry => ({
            employee: `${entry.userId.firstName} ${entry.userId.lastName}`, // Dynamically get user's name
            present: entry.action === 'login' ? 1 : 0,
            leave: leaveEntries.some(leave => leave.user._id.toString() === entry.userId._id.toString()) ? 1 : 0,
            absent: entry.action === 'logout' ? 1 : 0
        }));


        // console.log(leaves, 'leaves');

        return NextResponse.json({
            monthlyAttendance,
            userwiseReport,
            leaves: leaveEntries,   // Return leave entries as part of the response
            holidays   // Return holiday entries as part of the response
        });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching attendance data', error }, { status: 500 });
    }
}
