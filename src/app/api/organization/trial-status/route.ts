// pages/api/organizations/trial-status.ts
import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);

        // Fetch user and populate organization
        const user = await User.findOne({ _id: userId }).populate('organization');

        if (!user || !user.organization) {
            throw new Error('User or organization not found');
        }

        const trialExpires = user.organization.trialExpires;
        const currentDate = new Date();

        return NextResponse.json({
            isExpired: new Date(trialExpires) < currentDate
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
