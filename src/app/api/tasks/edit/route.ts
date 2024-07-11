// Import necessary modules and models
import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const { id, title, description, priority } = await request.json();

        // Find the task by ID
        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Update task properties
        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;

        await task.save();

        return NextResponse.json({ message: 'Task updated successfully', task }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
    }
}
