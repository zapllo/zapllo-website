import mongoose from 'mongoose';
import Task from '../../../models/taskModal';
import User, { IUser } from '../../../models/userModel';
import connectDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/categoryModel';
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail";

connectDB();

const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-GB', optionsTime).format(date);
    const timeParts = formattedTime.match(/(\d{1,2}:\d{2})\s*(AM|PM)/);
    const formattedTimeUppercase = timeParts ? `${timeParts[1]} ${timeParts[2].toUpperCase()}` : formattedTime;

    return `${formattedDate} ${formattedTimeUppercase}`;
};

const sendReminderNotification = async (task: any, reminder: any, assignedUser: any) => {
    console.log(`Sending ${reminder.notificationType} reminder for task: ${task.title} to user: ${assignedUser.email}`);

    const reminderTime = `${reminder.value ?? 'N/A'}`;
    const formattedDueDate = formatDate(task.dueDate);

    // Email Reminder
    if (reminder.notificationType === 'email' && !reminder.sent && assignedUser.notifications.email) {
        console.log('Preparing to send email reminder');
        if (reminder.value > 0) {
            console.log('Sending email reminder to', assignedUser.email);
            const emailOptions: SendEmailOptions = {
                to: `${assignedUser.email}`,
                subject: "Task Reminder",
                text: `Zapllo`,
                html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; padding: 20px;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
            <div style="background-color: #74517A; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Task Reminder</h1>
            </div>
            <div style="padding: 20px;">
                <p><strong>Dear ${assignedUser.firstName},</strong></p>
                <p>A task assigned to you is due in <strong>${reminderTime}</strong> minutes ⏰</p>
                <p>Here are the task details:</p>
                <p><strong>Category:</strong> ${task.category.name}</p>
                <p><strong>Task:</strong> ${task.title}</p>
                <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                <p><strong>Priority:</strong> ${task.priority}</p>  
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://zapllo.com/dashboard/tasks" style="background-color: #74517A; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Task App</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an <span style="color: #d9534f;"><strong>automated</strong></span> notification. Please do not reply</p>
            </div>
        </div>
    </div>
</body>`,
            };
            try {
                console.log('sending email')
                await sendEmail(emailOptions);
                console.log('Email sent successfully to', assignedUser.email);
                reminder.sent = true; // Mark this specific reminder as sent
            } catch (error) {
                console.error('Error sending email:', error);
                throw new Error('Failed to send email notification');
            }
        } else {
            console.log('Email reminder value is zero or less; skipping email reminder');
        }
    } else {
        console.log('Email reminder already sent or user has disabled email notifications');
    }

    // Save task to update reminder sent status
    try {
        await task.save();
        console.log('Task updated with sent reminders');
    } catch (error) {
        console.error('Error saving task:', error);
        throw new Error('Failed to save task after sending reminders');
    }
};

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        const nowUTC = new Date(now.toISOString());

        console.log('Current UTC time:', nowUTC.toISOString());

        const tasks = await Task.find()
            .populate<{ assignedUser: IUser }>('assignedUser')
            .populate('category')
            .exec();
        console.log(`Found ${tasks.length} tasks`);

        for (const task of tasks) {
            console.log(`Processing task: ${task.title}, dueDate: ${task.dueDate}`);
            
            for (const reminder of task.reminders) {
                let reminderDate = new Date(task.dueDate);

                // Adjust reminderDate based on the reminder type
                if (reminder.type === 'minutes' && reminder.value) {
                    reminderDate.setMinutes(reminderDate.getMinutes() - reminder.value);
                } else if (reminder.type === 'hours' && reminder.value) {
                    reminderDate.setHours(reminderDate.getHours() - reminder.value);
                } else if (reminder.type === 'days' && reminder.value) {
                    reminderDate.setDate(reminderDate.getDate() - reminder.value);
                } else if (reminder.type === 'specific' && reminder.date) {
                    reminderDate = new Date(reminder.date);
                }

                console.log(`Calculated reminderDate for ${reminder.notificationType}: ${reminderDate.toISOString()}`);

                // Check if the reminder is due
                if (reminderDate <= nowUTC && !reminder.sent) {
                    console.log(`${reminder.notificationType} reminder is due now or overdue`);
                    const assignedUser = task.assignedUser;
                    if (!assignedUser) {
                        console.error('Assigned user is missing');
                        continue;
                    }
                    console.log('sending email')
                    await sendReminderNotification(task, reminder, assignedUser);
                } else {
                    console.log(`No due reminders for this task: ${task.title}`);
                }
            }
        }

        return new Response(JSON.stringify({ message: 'Reminders processed successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error processing reminders:', error);
        return new Response(JSON.stringify({ error: 'Failed to process reminders.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
