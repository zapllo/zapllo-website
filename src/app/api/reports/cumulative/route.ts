import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import Holiday from '@/models/holidayModel'; // Assuming you have a Holiday model
import { NextRequest, NextResponse } from 'next/server';
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
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

    const { period, managerId, employeeId } = await request.json();

    let startDate, endDate;
    if (period === 'thisMonth') {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
    } else {
        startDate = new Date(period.start);
        endDate = new Date(period.end);
    }

    const userFilter: { [key: string]: any } = { organization: loggedInUser.organization };


    if (employeeId) {
        userFilter._id = new mongoose.Types.ObjectId(employeeId);
    } else if (managerId) {
        userFilter.reportingManager = new mongoose.Types.ObjectId(managerId);
    }

    try {
        // Fetch users based on filters
        const organizationUsers = await User.find(userFilter).select('_id reportingManager firstName lastName');
        const organizationUserIds = organizationUsers.map(user => user._id);

        // Fetch login entries
        const loginEntries = await LoginEntry.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate, $lte: endDate },
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
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user.reportingManager',
                    foreignField: '_id',
                    as: 'reportingManager'
                }
            },
            {
                $unwind: {
                    path: '$reportingManager',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        // Fetch leave entries
        const leaves = await Leave.aggregate([
            {
                $match: {
                    fromDate: { $gte: startDate },
                    toDate: { $lte: endDate },
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

        // Fetch holidays within the selected period
        const holidays = await Holiday.find({
            holidayDate: { $gte: startDate, $lte: endDate },
            organization: loggedInUser.organization
        });

        // Calculate total weekdays (excluding weekends)
        const allDaysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });
        const weekdaysInPeriod = allDaysInPeriod.filter(day => !isWeekend(day));
        const totalDays = weekdaysInPeriod.length;

        // Calculate working days and week offs
        const workingDays = loginEntries.length + leaves.length;
        const weekOffs = allDaysInPeriod.filter(isWeekend).length;

        // Combine login entries and leave entries into the report
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
