import { getDataFromToken } from "@/helper/getDataFromToken";
import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function GET(request: NextRequest) {
    const userId = await getDataFromToken(request);

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ progress: user.checklistProgress || [] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching checklist progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
