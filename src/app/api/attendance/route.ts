import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import LoginEntry from '@/models/loginEntryModel';
import Leave from '@/models/leaveModel';
import Holiday from '@/models/holidayModel';
import User, { IUser } from '@/models/userModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { eachDayOfInterval, isWeekend, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {

    await connectDB();

    // Get logged-in user
    const userId = await getDataFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the user details
    const loggedInUser = await User.findById(userId);
    if (!loggedInUser || !loggedInUser.organization) {
        return NextResponse.json({ message: 'User not found or no organization found' }, { status: 404 });
    }

    // Use req.nextUrl to access search parameters
    const searchParams = req.nextUrl.searchParams;

    const date = searchParams.get('date'); // Expecting format like "2024-09"

    if (!date || !/^\d{4}-\d{2}$/.test(date)) {
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }

    try {
        // Construct start and end of the month
        const startDate = new Date(`${date}-01T00:00:00Z`);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

        // Get all users in the organization
        const orgUsers = await User.find({ organization: loggedInUser.organization }).select('_id');

        const orgUserIds = orgUsers.map(user => user._id);

        // Generate all days in the month
        const allDays = eachDayOfInterval({ start: startDate, end: new Date(endDate.getTime() - 1) });

        // Fetch login entries for the month
        const loginEntries = await LoginEntry.find({
            userId: { $in: orgUserIds },
            timestamp: {
                $gte: startDate,
                $lt: endDate,
            },
        }).lean();

        // Fetch leaves for the month
        const leaveEntries = await Leave.find({
            user: { $in: orgUserIds },
            status: 'Approved',
            $or: [
                { fromDate: { $gte: startDate, $lt: endDate } },  // Leave starts within the month
                { toDate: { $gte: startDate, $lt: endDate } },    // Leave ends within the month
                { fromDate: { $lt: startDate }, toDate: { $gte: endDate } }, // Leave spans the entire month
            ],
        }).lean();

        // Fetch holidays for the month
        const holidays = await Holiday.find({
            organization: loggedInUser.organization,
            holidayDate: {
                $gte: startDate,
                $lt: endDate,
            },
        }).lean();

        // Create a map of holidays for quick lookup
        const holidayDates = new Set(holidays.map(holiday => holiday.holidayDate.toISOString().split('T')[0]));

        // Initialize the report data structure
        const report = [];

        // For each day, calculate counts
        for (const day of allDays) {
            const dayString = day.toISOString().split('T')[0];

            // Skip weekends if necessary
            if (isWeekend(day)) continue; // Uncomment if you want to exclude weekends

            const isHoliday = holidayDates.has(dayString);

            let presentCount = 0;
            let leaveCount = 0;
            let absentCount = 0;
            let totalEmployees = orgUserIds.length;

            // If it's a holiday, all employees are on holiday
            if (isHoliday) {
                // You can choose to set counts accordingly or skip processing
                report.push({
                    date: dayString,
                    day: day.toLocaleDateString('en-US', { weekday: 'short' }),
                    present: 0,
                    leave: 0,
                    absent: 0,
                    holiday: totalEmployees,
                    total: totalEmployees,
                });
                continue;
            }

            // Create sets for quick lookup
            const usersPresent = new Set<string>();
            const usersOnLeave = new Set<string>();

            // Find users who have login entries on this day
            for (const entry of loginEntries) {
                const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
                if (entryDate === dayString) {
                    usersPresent.add(entry.userId.toString());
                }
            }

            // Find users who are on leave on this day
            for (const leave of leaveEntries) {
                const fromDate = new Date(leave.fromDate);
                const toDate = new Date(leave.toDate);
                if (day >= fromDate && day <= toDate) {
                    usersOnLeave.add(leave.user.toString());
                }
            }

            presentCount = usersPresent.size;
            leaveCount = usersOnLeave.size;

            absentCount = totalEmployees - presentCount - leaveCount;

            report.push({
                date: dayString,
                day: day.toLocaleDateString('en-US', { weekday: 'short' }),
                present: presentCount,
                leave: leaveCount,
                absent: absentCount,
                holiday: 0,
                total: totalEmployees,
            });
        }

        return NextResponse.json({
            monthlyReport: report,
            leaves: leaveEntries,
            holidays,
        });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return NextResponse.json({ message: 'Error fetching attendance data' }, { status: 500 });
    }
}
