import { NextRequest, NextResponse } from 'next/server';
import LoginEntry from '@/models/loginEntryModel'; // Import LoginEntry model
import { getDataFromToken } from '@/helper/getDataFromToken'; // Extract userId from token

export async function GET(request: NextRequest) {
    try {
        // Extract userId from token
        const userId = await getDataFromToken(request);

        // Fetch the latest login entry for the user
        const lastEntry = await LoginEntry.findOne({ userId }).sort({ timestamp: -1 }).exec();

        if (!lastEntry) {
            return NextResponse.json({ success: true, isLoggedIn: false, message: 'No login history found' });
        }

        // Check if the last action was 'login'
        const isLoggedIn = lastEntry.action === 'login';

        return NextResponse.json({ success: true, isLoggedIn });
    } catch (error) {
        console.error('Error fetching login status:', error);
        return NextResponse.json({ success: false, error: 'Server error' });
    }
}
