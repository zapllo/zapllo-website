import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import Holiday from '@/models/holidayModel';
import { NextRequest, NextResponse } from 'next/server';
import { eachDayOfInterval, isWeekend } from 'date-fns';
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
        const organizationUsers = await User.find(userFilter).select('_id reportingManager firstName lastName');
        const organizationUserIds = organizationUsers.map(user => user._id);

        const loginEntries = await LoginEntry.aggregate([
            {
                $match: {
                    timestamp: { $gte: parsedStartDate, $lte: parsedEndDate },
                    userId: { $in: organizationUserIds }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    present: { $sum: { $cond: [{ $eq: ['$action', 'login'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$action', 'logout'] }, 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user.reportingManager',
                    foreignField: '_id',
                    as: 'reportingManager'
                }
            },
            { $unwind: { path: '$reportingManager', preserveNullAndEmptyArrays: true } }
        ]);

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

        const holidays = await Holiday.find({
            holidayDate: { $gte: parsedStartDate, $lte: parsedEndDate },
            organization: loggedInUser.organization
        });

        const allDaysInPeriod = eachDayOfInterval({ start: parsedStartDate, end: parsedEndDate });
        const weekdaysInPeriod = allDaysInPeriod.filter(day => !isWeekend(day));
        const totalDays = weekdaysInPeriod.length;

        const workingDays = loginEntries.length + leaves.length;
        const weekOffs = allDaysInPeriod.filter(isWeekend).length;

        const report = loginEntries.map(entry => {
            const leave = leaves.find(l => l._id.equals(entry._id));
            return {
                user: `${entry.user.firstName} ${entry.user.lastName}`,
                present: entry.present,
                absent: entry.absent,
                leave: leave ? leave.leaveCount : 0,
                reportingManager: entry.reportingManager
                    ? `${entry.reportingManager.firstName} ${entry.reportingManager.lastName}`
                    : 'N/A'
            };
        });

        return NextResponse.json({
            report,
            totalDays,
            workingDays,
            holidays: holidays.map(holiday => holiday.holidayDate),
            weekOffs
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching cumulative report:', error);
        return NextResponse.json({ message: 'Error fetching cumulative report', error }, { status: 500 });
    }
}
