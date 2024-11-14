import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel';
import User, { IUser } from '@/models/userModel';
import Holiday from '@/models/holidayModel';
import { NextRequest, NextResponse } from 'next/server';
import { eachDayOfInterval, isWeekend, format } from 'date-fns';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { getDataFromToken } from '@/helper/getDataFromToken';

export async function POST(request: NextRequest) {
    await connectDB();

    const userId = await getDataFromToken(request);
    if (!userId) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const loggedInUser = await User.findById(userId).select('organization');
    if (!loggedInUser || !loggedInUser.organization) {
        return NextResponse.json({ success: false, message: 'User organization not found' }, { status: 404 });
    }

    const { startDate, endDate, managerId, employeeId } = await request.json();
    if (!startDate || !endDate) {
        return NextResponse.json({ success: false, message: 'Missing date range' }, { status: 400 });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return NextResponse.json({ success: false, message: 'Invalid date range' }, { status: 400 });
    }

    const userFilter: { [key: string]: any } = { organization: loggedInUser.organization };
    if (employeeId) {
        userFilter._id = new mongoose.Types.ObjectId(employeeId);
    } else if (managerId) {
        userFilter.reportingManager = new mongoose.Types.ObjectId(managerId);
    }

    try {
        const organizationUsers = await User.find(userFilter)
            .select('_id reportingManager firstName lastName')
            .populate('reportingManager', 'firstName lastName');

        const organizationUserIds = organizationUsers.map(user => user._id);

        const loginEntries = await LoginEntry.find({
            timestamp: { $gte: parsedStartDate, $lte: parsedEndDate },
            userId: { $in: organizationUserIds }
        });

        const leaves = await Leave.aggregate([
            {
                $match: {
                    fromDate: { $gte: parsedStartDate },
                    toDate: { $lte: parsedEndDate },
                    user: { $in: organizationUserIds }
                }
            },
            {
                $group: {
                    _id: '$user',
                    leaveCount: { $sum: 1 }
                }
            }
        ]);

        const userLeaveData = new Map();
        leaves.forEach(leave => {
            userLeaveData.set(leave._id.toString(), leave.leaveCount);
        });

        const holidays = await Holiday.find({
            holidayDate: { $gte: parsedStartDate, $lte: parsedEndDate },
            organization: loggedInUser.organization
        });

        const allDaysInPeriod = eachDayOfInterval({ start: parsedStartDate, end: parsedEndDate });
        const weekdaysInPeriod = allDaysInPeriod.filter(day => !isWeekend(day));
        const totalDays = weekdaysInPeriod.length;
        const weekOffs = allDaysInPeriod.filter(isWeekend).length;

        const loginDataMap = new Map();
        loginEntries.forEach(entry => {
            const date = format(entry.timestamp, 'yyyy-MM-dd');
            const userId = entry.userId.toString();
            if (!loginDataMap.has(userId)) loginDataMap.set(userId, new Set());
            loginDataMap.get(userId).add(date);
        });

        const report = organizationUsers.map(user => {
            const userId = user._id.toString();
            const leaveCount = userLeaveData.get(userId) || 0;

            let presentDays = 0;
            let absentDays = 0;
            weekdaysInPeriod.forEach(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                if (loginDataMap.has(userId) && loginDataMap.get(userId).has(dayStr)) {
                    presentDays += 1;
                } else {
                    absentDays += 1;
                }
            });

            let reportingManagerName = 'Not Assigned';
            if (user.reportingManager && typeof user.reportingManager !== 'string') {
                const rm = user.reportingManager as unknown as IUser;
                reportingManagerName = `${rm.firstName} ${rm.lastName}`;
            }

            return {
                user: `${user.firstName} ${user.lastName}`,
                present: presentDays,
                absent: absentDays,
                leave: leaveCount,
                reportingManager: reportingManagerName
            };
        });

        return NextResponse.json({
            report,
            totalDays,
            workingDays: totalDays - weekOffs - holidays.length,
            holidays: holidays.map(holiday => holiday.holidayDate),
            weekOffs
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching cumulative report:', error);
        return NextResponse.json({ message: 'Error fetching cumulative report', error }, { status: 500 });
    }
}
