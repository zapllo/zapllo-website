// Import necessary modules and models
import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const { id, status, comment, userName } = await request.json();

        // Find the task by ID
        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Update task properties
        if (task.repeat === true) {
            task.status = 'In Progress'
        } else {
            task.status = status;

        }
        task.comments.push({ userName, comment, createdAt: new Date() }); // Assuming 'status' is already in task schema
        await task.save();

        return NextResponse.json({ message: 'Task updated successfully', task }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
    }
}
