import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/models/userModel";

connectDB();

const sendWebhookNotification = async (taskData: any, phoneNumber: any, assignedUserFirstName: any, userFirstName: any) => {
    const payload = {
        phoneNumber: phoneNumber, // Assuming you have the phone number in the task data
        bodyVariables: [assignedUserFirstName, userFirstName, "Marketing", taskData.title, taskData.description, taskData.priority, taskData.dueDate, "zapllo.com"] // Adjust as per your needs
    };

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
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
        const taskUser = await User.findById(savedTask.user);
        if (!taskUser) {
            throw new Error("Task user not found");
        }
        // Fetch the assigned user's whatsappNo
        const assignedUser = await User.findById(savedTask.assignedUser);
        if (!assignedUser) {
            throw new Error("Assigned user not found");
        }

        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });
        // Send webhook notification with the assigned user's whatsappNo
        await sendWebhookNotification(savedTask, assignedUser.whatsappNo, assignedUser.firstName, taskUser.firstName);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
