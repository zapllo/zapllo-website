import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import Category from "@/models/categoryModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/models/userModel";
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail";

connectDB();

const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // Options for formatting
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-GB', optionsTime).format(date);
    // Convert AM/PM to uppercase
    const timeParts = formattedTime.match(/(\d{1,2}:\d{2})\s*(AM|PM)/);
    const formattedTimeUppercase = timeParts ? `${timeParts[1]} ${timeParts[2].toUpperCase()}` : formattedTime;

    return `${formattedDate} ${formattedTimeUppercase}`;
};

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
            formatDate(taskData.dueDate), // Use formatted date
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
        // Set default values for repeat and repeatType if not provided
        const taskData = {
            ...data,
            repeat: data.repeat ?? false,
            repeatType: data.repeat ? data.repeatType : undefined,
            user: userId,
            organization: authenticatedUser.organization,
        };

        const newTask = new Task(taskData);

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
                html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
           <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size: 12px; text-align: center;">
    <h1 style="margin: 0;">New Task Assigned</h1>
</div>

            <div style="padding: 20px;">
                <p><strong> Dear ${assignedUser.firstName} </strong></p>
                <p>A new task has been assigned to you, given below are the task details:</p>
                <p><strong>Title:</strong> ${savedTask.title}</p>
                <p><strong>Description:</strong> ${savedTask.description}</p>
                <p><strong>Due Date:</strong> ${formatDate(savedTask.dueDate)}</p>
                <p><strong>Assigned By:</strong> ${authenticatedUser.firstName}</p>
                <p><strong>Category:</strong> ${category.name}</p>
                <p><strong>Priority:</strong> ${savedTask.priority}</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://zapllo.com/dashboard/tasks" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Task App</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`,
            };
            await sendEmail(emailOptions);
        }
        if (assignedUser.notifications.whatsapp) {
            await sendWebhookNotification(savedTask, assignedUser.whatsappNo, assignedUser.firstName, taskUser.firstName, category.name);
        }
        return NextResponse.json({
            message: "Task created successfully",
            task: savedTask,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error creating task:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
