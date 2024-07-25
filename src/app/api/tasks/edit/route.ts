// Import necessary modules and models
import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const { id, title, description, priority, category, assignedUser, repeat, repeatType, dueDate, days, dates, attachment, links, status } = await request.json();

        // Find the task by ID
        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Update task properties
        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.category = category || task.category;
        task.assignedUser = assignedUser || task.assignedUser;
        task.repeat = repeat || task.repeat;
        task.repeatType = repeatType || task.repeatType;
        task.dueDate = dueDate || task.dueDate;
        task.days = days || task.days;
        task.dates = dates || task.dates;
        task.attachment = attachment || task.attachment;
        task.links = links || task.links;
        task.status = status || task.status;

        await task.save();
        console.log(task, 'wow')
        return NextResponse.json({ message: 'Task updated successfully', data: task }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
    }
}
