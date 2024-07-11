import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/models/userModel";
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail";

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
        // Find the authenticated user in the database based on the user ID
        const authenticatedUser = await User.findById(userId);
        if (!authenticatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // Parse the JSON body from the request
        const data = await request.json();

        // Create a new task with the provided data and the authenticated user's organization
        const newTask = new Task({
            ...data,
            user: userId,
            organization: authenticatedUser.organization, // Set the organization field
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

        // Send webhook notification with the assigned user's whatsappNo
        const emailOptions: SendEmailOptions = {
            to: `${assignedUser.email}`,
            subject: "New Task Assigned",
            text: `Dear ${assignedUser.firstName},\n\nA new task has been assigned to you, given below are the task details:\n\nTitle: ${savedTask.title} \n\nDescription: ${savedTask.description} \n\nDue Date: ${savedTask.dueDate} \n\nAssigned By: ${authenticatedUser.firstName} \n\nCategory: ${savedTask.category} \n\nPriority: ${savedTask.priority} & Regards\nTeam Zapllo`,
            html: `<p>Dear ${assignedUser.firstName},</p>
            <p>A new task has been assigned to you. Below are the task details:</p>
            <ul>
                <li><strong>Title:</strong> ${savedTask.title}</li>
                <li><strong>Description:</strong> ${savedTask.description}</li>
                <li><strong>Due Date:</strong> ${savedTask.dueDate}</li>
                <li><strong>Assigned By:</strong> ${authenticatedUser.firstName}</li>
                <li><strong>Category:</strong> ${savedTask.category}</li>
                <li><strong>Priority:</strong> ${savedTask.priority}</li>
            </ul>
            <p><a href="https://zapllo.com/dashboard/tasks" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Open Task App</a></p>
            <p>This is an automated notification. Please do not reply.</p>
        `,
        };

        await sendEmail(emailOptions);
        // await sendWebhookNotification(savedTask, assignedUser.whatsappNo, assignedUser.firstName, taskUser.firstName);


        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
