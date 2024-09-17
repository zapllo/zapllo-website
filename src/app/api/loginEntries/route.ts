import { NextRequest, NextResponse } from 'next/server';
import LoginEntry from '@/models/loginEntryModel';
import { getDataFromToken } from '@/helper/getDataFromToken'; // Assuming you have a token extraction function

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const entries = await LoginEntry.find({
            userId,
            timestamp: { $gte: today }, // Fetch today's entries
        });

        return NextResponse.json({ success: true, entries });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch entries' });
    }
}
