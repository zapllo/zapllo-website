import { NextRequest, NextResponse } from 'next/server';
import Leave from '@/models/leaveModel';
import User from '@/models/userModel';
import LeaveType from '@/models/leaveTypeModel';
import Holiday from '@/models/holidayModel'; // Import the Holiday model
import { getDataFromToken } from '@/helper/getDataFromToken';
import { isWeekend, isSameDay } from 'date-fns';
import mongoose from 'mongoose';

type LeaveUnit = 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';

// Define the mapping for leave units and their corresponding values
const unitMapping: Record<LeaveUnit, number> = {
    'Full Day': 1,
    '1st Half': 0.5,
    '2nd Half': 0.5,
    '1st Quarter': 0.25,
    '2nd Quarter': 0.25,
    '3rd Quarter': 0.25,
    '4th Quarter': 0.25,
};

// Function to get holidays and weekends in the leave range if applicable
async function getNonDeductibleDaysInRange(startDate: Date, endDate: Date, organization: mongoose.Types.ObjectId, includeHolidays: boolean, includeWeekOffs: boolean) {
    let nonDeductibleDays: Date[] = [];

    if (includeHolidays) {
        // Fetch holidays for the organization if includeHolidays is true
        const holidays = await Holiday.find({ organization, holidayDate: { $gte: startDate, $lte: endDate } });
        nonDeductibleDays = holidays.map(holiday => holiday.holidayDate); // Array of holidays
    }

    // If includeWeekOffs is true, add weekends (Saturday and Sunday)
    if (includeWeekOffs) {
        let current = new Date(startDate);
        while (current <= endDate) {
            if (isWeekend(current)) {
                nonDeductibleDays.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
    }

    return nonDeductibleDays;
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const body = await request.json();

        // Fetch the user applying for the leave
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' });
        }

        // Ensure that user.organization is a valid ObjectId
        if (!user.organization || !(user.organization instanceof mongoose.Types.ObjectId)) {
            return NextResponse.json({ success: false, error: 'Invalid or missing organization for the user.' });
        }

        // Re-fetch the user after initialization to ensure updated balances are available
        await user.populate('leaveBalances.leaveType');  // Ensure correct population of leave balances

        // Fetch the leave type to get the balance for that type
        const leaveType = await LeaveType.findById(body.leaveType);

        if (!leaveType) {
            return NextResponse.json({ success: false, error: 'Leave type not found' });
        }

        // Fetch non-deductible days (holidays, weekends)
        const nonDeductibleDays = await getNonDeductibleDaysInRange(
            new Date(body.fromDate),
            new Date(body.toDate),
            user.organization,
            leaveType.includeHolidays,  // Check if holidays should be excluded
            leaveType.includeWeekOffs   // Check if weekends should be excluded
        );

        let totalAppliedDays = 0;

        // Calculate the total applied days based on leaveDays and unit
        for (const leaveDay of body.leaveDays) {
            const unitDeduction = unitMapping[leaveDay.unit as LeaveUnit];

            // Check if the leave day is a holiday or weekend, and only count it if it's not
            const isNonDeductible = nonDeductibleDays.some(nonDeductible =>
                isSameDay(nonDeductible, new Date(leaveDay.date))
            );

            if (!isNonDeductible) {
                totalAppliedDays += unitDeduction;  // Only count it if it's not a holiday or weekend
            }
        }

        // Check if the user has enough leave balance (optional for leave creation, can be done during approval)
        const userLeaveBalance = user.leaveBalances.find(
            (balance) => String(balance.leaveType._id || balance.leaveType) === String(body.leaveType)
        );

        if (!userLeaveBalance || userLeaveBalance.balance < totalAppliedDays) {
            return NextResponse.json({ success: false, error: 'Insufficient leave balance' });
        }




        // Create the new leave request with leaveDays
        const newLeave = new Leave({
            user: userId,
            leaveType: body.leaveType,
            fromDate: body.fromDate,
            toDate: body.toDate,
            leaveDays: body.leaveDays,
            appliedDays: totalAppliedDays, // Assign the calculated appliedDays
            leaveReason: body.leaveReason,
            attachment: body.attachment || '',
            audioUrl: body.audioUrl || '',
            status: 'Pending',
        });

        // Save the leave
        const savedLeave = await newLeave.save();

        if (!savedLeave) {
            console.error('Leave was not saved. Something went wrong during save.');
            return NextResponse.json({ success: false, error: 'Leave creation failed' });
        }

        return NextResponse.json({ success: true, leave: savedLeave });
    } catch (error: any) {
        console.log('Error during leave creation: ', error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}


export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);

        // Fetch all leaves for the logged-in user and populate leaveType
        const userLeaves = await Leave.find({ user: userId })
            .populate({ path: 'leaveType', model: 'leaveTypes' }) // Explicitly specify model

        console.log(userLeaves, 'user leaves!')

        if (!userLeaves || userLeaves.length === 0) {
            return NextResponse.json({ success: false, error: 'No leaves found for this user' });
        }

        return NextResponse.json({ success: true, leaves: userLeaves });
    } catch (error: any) {
        console.log('Error fetching user leaves: ', error.message);
        return NextResponse.json({ success: false, error: error.message });
    }
}
