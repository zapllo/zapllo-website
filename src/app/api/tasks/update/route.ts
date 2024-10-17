// Import necessary modules and models
import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail"; // Assuming you have this function
import Category from "@/models/categoryModel";

connectDB();

const sendWebhookNotification = async (taskData: any, taskCreator: any, assignedUser: any, status: any, userName: any, comment: any, taskCategory: any) => {
    const payload = {
        phoneNumber: assignedUser.whatsappNo,
        templateName: 'taskupdate',
        bodyVariables: [
            taskCreator.firstName,
            userName,
            status, // Use the category name instead of "Marketing"
            comment,
            taskCategory.name,
            taskData.title,
            taskData.dueDate,
            taskData.priority,
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


export async function PATCH(request: NextRequest) {
    try {
        const { id, status, comment, userName, fileUrl } = await request.json();

        // Find the task by ID
        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Update task status
        let newStatus = status;
        if (status === 'Reopen') {
            newStatus = 'Pending'; // Set status to Pending when reopened
        } else if (task.repeat) {
            newStatus = 'Pending';
        } else {
            newStatus = status;
            if (status === 'Completed') {
                task.completionDate = new Date();
            }
        }

        task.status = newStatus;

        // Add a comment to the task with a status tag
        task.comments.push({
            userName,
            comment,
            fileUrl,
            tag: status, // Add the tag here
            createdAt: new Date()
        });

        await task.save();

        // Find the user who created the task
        const taskCreator = await User.findById(task.user);
        if (!taskCreator) {
            return NextResponse.json({ error: 'Task creator not found' }, { status: 404 });
        }

        // Find the assigned user and task category
        const assignedUser = await User.findById(task.assignedUser);
        if (!assignedUser) {
            return NextResponse.json({ error: 'assigned user not found' }, { status: 404 });
        }
        const taskCategory = await Category.findById(task.category);
        if (!taskCategory) {
            return NextResponse.json({ error: 'category  not found' }, { status: 404 });
        }
        // Send Email to the task creator
        if (assignedUser.notifications.email) { // Check if email notifications are enabled
            const emailOptions: SendEmailOptions = {
                to: assignedUser.email,
                subject: "Task Status Updates",
                text: `Task '${task.title}' has been updated.`,
                html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
                        <div style="background-color: #f0f4f8; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                 <div style="text-align: center; padding: 20px;">
                                     <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                                </div>
                            <div style="background-color: #74517A; color: #ffffff; padding: 10px; font-size:12px; text-align: center;">
                             <h1 style="margin: 0;">Task Status Updated to - ${task.status}</h1>
                            </div>
                            <div style="padding: 20px;">
                                <p><strong>Dear ${taskCreator.firstName},</strong></p>
                                <p>${userName} has updated the task status to ${task.status} for a task assigned by you.</p>
                                <p>Update Remarks - ${comment}</p>
                                <p>Task Details:</p>
                                <p><strong>Title:</strong> ${task.title}</p>
                                <p><strong>Description:</strong> ${task.description}</p>
                                <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                                <p><strong>Assigned To:</strong> ${assignedUser.firstName}</p>
                                <p><strong>Category:</strong> ${taskCategory.name}</p>
                                <p><strong>Priority:</strong> ${task.priority}</p>
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="https://zapllo.com/dashboard/tasks" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Task App</a>
                            </div>
                                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                         </div>
                    </div>
                </div>
            </body>
                `,
            };

            await sendEmail(emailOptions);

        }
        await sendWebhookNotification(task, taskCreator, assignedUser, status, userName, comment, taskCategory);
        return NextResponse.json({ message: 'Task updated successfully', task }, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Error updating task' }, { status: 500 });
    }
}

// Helper function to format date
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
