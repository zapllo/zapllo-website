import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/helper/getDataFromToken';

export async function POST(request: NextRequest) {
    await connectDB();

    // Extract user ID from token
    const userId = await getDataFromToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the logged-in user's organization
    const loggedInUser = await User.findById(userId).select('organization');
    if (!loggedInUser || !loggedInUser.organization) {
        return NextResponse.json({ success: false, message: 'User organization not found' }, { status: 404 });
    }

    const { date, employeeId } = await request.json();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Fetch users based on employeeId (or all users if not provided)
        const queryFilter = employeeId ? { _id: employeeId, organization: loggedInUser.organization } : { organization: loggedInUser.organization };
        const organizationUsers = await User.find(queryFilter).select('_id firstName lastName');

        const organizationUserIds = organizationUsers.map(user => user._id.toString());

        // Fetch login entries for the day
        const loginEntries = await LoginEntry.find({
            userId: { $in: organizationUserIds },
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        }).populate('userId', 'firstName lastName');

        // Fetch leave entries for the day
        const leaveEntries = await Leave.find({
            user: { $in: organizationUserIds },
            'leaveDays.date': { $gte: startOfDay, $lte: endOfDay },
            status: 'Approved'
        }).populate('user', 'firstName lastName');

        const usersOnLeave = new Set(leaveEntries.map(leave => leave.user._id.toString()));

        const usersWithLoginEntries = new Map();
        loginEntries.forEach(entry => {
            const status = entry.action === 'login' ? 'Present' : entry.action === 'logout' ? 'Absent' : 'Regularization';
            usersWithLoginEntries.set(entry.userId._id.toString(), {
                user: `${entry.userId.firstName} ${entry.userId.lastName}`,
                status,
                loginTime: entry.loginTime || 'N/A',
                logoutTime: entry.logoutTime || 'N/A',
                totalDuration: entry.logoutTime ? calculateDuration(entry.loginTime, entry.logoutTime) : 'N/A'
            });
        });

        const report = organizationUsers.map(user => {
            const userId = user._id.toString();
            if (usersOnLeave.has(userId)) {
                return {
                    user: `${user.firstName} ${user.lastName}`,
                    status: 'On Leave',
                    loginTime: 'N/A',
                    logoutTime: 'N/A',
                    totalDuration: 'N/A'
                };
            }
            if (usersWithLoginEntries.has(userId)) {
                return usersWithLoginEntries.get(userId);
            }
            return {
                user: `${user.firstName} ${user.lastName}`,
                status: 'Absent',
                loginTime: 'N/A',
                logoutTime: 'N/A',
                totalDuration: 'N/A'
            };
        });

        return NextResponse.json({ report }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching report', error }, { status: 500 });
    }
}

function calculateDuration(loginTime: string, logoutTime: string): string {
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffInMs = logout.getTime() - login.getTime();
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}
