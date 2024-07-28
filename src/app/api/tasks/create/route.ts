import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import Category from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/models/userModel";
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail";

connectDB();

const sendWebhookNotification = async (taskData: any, phoneNumber: any, assignedUserFirstName: any, userFirstName: any, categoryName: any) => {
    const payload = {
        phoneNumber: phoneNumber,
        templateName: 'task_notification_nu',
        bodyVariables: [
            assignedUserFirstName,
            userFirstName,
            categoryName, // Use the category name instead of "Marketing"
            taskData.title,
            taskData.description,
            taskData.priority,
            taskData.dueDate,
            "zapllo.com"
        ]
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
        const userId = await getDataFromToken(request);
        const authenticatedUser = await User.findById(userId);
        if (!authenticatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const data = await request.json();

        const newTask = new Task({
            ...data,
            user: userId,
            organization: authenticatedUser.organization,
        });

        const savedTask = await newTask.save();
        const taskUser = await User.findById(savedTask.user);
        if (!taskUser) {
            throw new Error("Task user not found");
        }

        const assignedUser = await User.findById(savedTask.assignedUser);
        if (!assignedUser) {
            throw new Error("Assigned user not found");
        }

        // Fetch the category details using the category ID from the task
        const category = await Category.findById(savedTask.category);
        if (!category) {
            throw new Error("Category not found");
        }
        if (assignedUser.notifications.email) {
            const emailOptions: SendEmailOptions = {
                to: `${assignedUser.email}`,
                subject: "New Task Assigned",
                text: `Zapllo`,
                html: `<div style="font-family: Arial, sans-serif; background-color: #13173F; color: #FFFFFF; padding: 20px; border-radius: 10px;">
                <img src='https://www.zapllo.com/logo.png'  style="height:40px; " />
                <p>Dear ${assignedUser.firstName},</p>
            <p>A new task has been assigned to you. Below are the task details:</p>
            <div>
                <h1><strong>Title:</strong> ${savedTask.title}</h1>
                <h1><strong>Description:</strong> ${savedTask.description}</h1>
                <h1><strong>Due Date:</strong> ${savedTask.dueDate}</h1>
                <h1><strong>Assigned By:</strong> ${authenticatedUser.firstName}</h1>
                <h1><strong>Category:</strong> ${category.name}</h1>
                <h1><strong>Priority:</strong> ${savedTask.priority}</h1>
            </div>
            <p><a href="https://zapllo.com/dashboard/tasks" style="display: inline-block; padding: 10px 20px; color: white; background: linear-gradient(to right, #815BF5, #FC8929); text-decoration: none; border-radius: 5px;">Open Task App</a></p>
            <p>This is an automated notification. Please do not reply.</p>
            </div>
        `,
            };
            await sendEmail(emailOptions);
        }
        if (assignedUser.notifications.whatsapp) {
            await sendWebhookNotification(savedTask, assignedUser.whatsappNo, assignedUser.firstName, taskUser.firstName, category.name);
        }

        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
