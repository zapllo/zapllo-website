import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";

connectDB();

const sendWebhookNotification = async (taskData: any) => {
    const payload = {
        phoneNumber: taskData.phoneNumber, // Assuming you have the phone number in the task data
        bodyVariables: [taskData.title, taskData.description, taskData.dueDate, taskData.priority, taskData.repeatType, taskData.status, taskData.assignedUser] // Adjust as per your needs
    };

    try {
        const response = await fetch('/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Webhook API error: ${responseData.message}`);
        }

        console.log('Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
        throw new Error('Failed to send webhook notification');
    }
};

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

        // Send webhook notification
        await sendWebhookNotification(savedTask);

        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
