import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const { userId, objectiveIndex, isCompleted } = await request.json();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.checklistProgress[objectiveIndex] = isCompleted;
        await user.save();

        return NextResponse.json({ message: 'Checklist progress updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating checklist progress:', error);
        return NextResponse.json({ error: 'Error updating checklist progress' }, { status: 500 });
    }
}
