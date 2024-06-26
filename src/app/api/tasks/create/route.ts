import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

export async function POST(request: NextRequest) {
    try {
        // Extract user ID from the authentication token
        const userId = await getDataFromToken(request);

        // Parse the JSON body from the request
        const data = await request.json();

        // Create a new task with the provided data
        const newTask = new Task({
            ...data,
            user: userId,
        });

        // Save the new task to the database
        const savedTask = await newTask.save();

        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
