import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

export async function GET(request: NextRequest) {
    try {
        // Extract user ID from the authentication token
        const userId = await getDataFromToken(request);

        // Find the authenticated user in the database based on the user ID
        const authenticatedUser = await User.findById(userId).select("-password");
        if (!authenticatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch tasks that are specific to the authenticated user's organization
        const tasks = await Task.find({
            $or: [
                { user: authenticatedUser._id },
                { assignedUser: authenticatedUser._id }
            ]
        }).populate('user assignedUser');

        // Filter tasks by organization
        const organizationTasks = tasks.filter(task => {
            return (
                task.user.organization.equals(authenticatedUser.organization) ||
                task.assignedUser.organization.equals(authenticatedUser.organization)
            );
        });

        return NextResponse.json({
            message: "Tasks fetched successfully",
            data: organizationTasks,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
