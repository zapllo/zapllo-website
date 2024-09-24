import mongoose from 'mongoose';
import Task from '../../../models/taskModal'; // Adjust the path based on your project structure
import User, { IUser } from '../../../models/userModel'; // Adjust the path based on your project structure
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

const sendReminderNotification = async (task: any, assignedUser: any) => {
    console.log('Sending reminder notification for task:', task.title, 'to user:', assignedUser.email);

    const reminderTime = `${task.reminder.email?.value ?? 'N/A'}`;
    const formattedDueDate = formatDate(task.dueDate);

    // Email Reminder
    if (task.reminder.email && !task.reminder.email.sent && assignedUser.notifications.email) {
        console.log('Preparing to send email reminder');
        if (task.reminder.email.value > 0) { // Check for non-zero value
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
                <p style="margin-top: 20px; font-size: 12px; color: #888888;">This is an <span style="color: #d9534f;"><strong>automated</strong></span> notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`,
            };
            try {
                await sendEmail(emailOptions);
                console.log('Email sent successfully to', assignedUser.email);
                task.reminder.email.sent = true;
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

    // WhatsApp Reminder
    if (task.reminder.whatsapp && !task.reminder.whatsapp.sent && assignedUser.whatsappNo) {
        console.log('Preparing to send WhatsApp reminder');
        if (task.reminder.whatsapp.value > 0) { // Check for non-zero value
            console.log('Sending WhatsApp reminder to', assignedUser.whatsappNo);
            const reminderTime = `${task.reminder.whatsapp.value ?? 'N/A'}`;
            const payload = {
                phoneNumber: assignedUser.whatsappNo,
                bodyVariables: [
                    assignedUser.firstName,
                    reminderTime,
                    task.category.name,
                    task.title,
                    formattedDueDate,
                    task.priority
                ],
                templateName: 'reminder_template',
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
                    console.error('WhatsApp Webhook API error:', responseData.message);
                    throw new Error(`WhatsApp Webhook API error: ${responseData.message}`);
                } else {
                    console.log('WhatsApp notification sent successfully');
                    task.reminder.whatsapp.sent = true;
                }
            } catch (error) {
                console.error('Error sending WhatsApp notification:', error);
                throw new Error('Failed to send WhatsApp notification');
            }
        } else {
            console.log('WhatsApp reminder value is zero or less; skipping WhatsApp reminder');
        }
    } else {
        console.log('WhatsApp reminder already sent or user has no WhatsApp number');
    }

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
        console.log('Registered Models:', mongoose.models);

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        const category = await Category.find({});
        console.log(`Found ${category.length} categories`);

        const tasks = await Task.find()
            .populate<{ assignedUser: IUser }>('assignedUser')
            .populate('category')
            .exec();
        console.log(`Found ${tasks.length} tasks`);

        for (const task of tasks) {
            console.log(`Processing task: ${task.title}, dueDate: ${task.dueDate}`);
            if (task.reminder) {
                let emailReminderDate = new Date(task.dueDate);
                let whatsappReminderDate = new Date(task.dueDate);

                // Adjust for email reminder
                if (task.reminder.email) {
                    console.log(`Email reminder settings: type=${task.reminder.email.type}, value=${task.reminder.email.value}`);
                    if (task.reminder.email.type === 'minutes' && task.reminder.email.value) {
                        emailReminderDate.setMinutes(emailReminderDate.getMinutes() - task.reminder.email.value);
                    } else if (task.reminder.email.type === 'hours' && task.reminder.email.value) {
                        emailReminderDate.setHours(emailReminderDate.getHours() - task.reminder.email.value);
                    } else if (task.reminder.email.type === 'days' && task.reminder.email.value) {
                        emailReminderDate.setDate(emailReminderDate.getDate() - task.reminder.email.value);
                    }
                    console.log(`Calculated emailReminderDate: ${emailReminderDate.toISOString()}`);
                }

                // Adjust for WhatsApp reminder
                if (task.reminder.whatsapp) {
                    console.log(`WhatsApp reminder settings: type=${task.reminder.whatsapp.type}, value=${task.reminder.whatsapp.value}`);
                    if (task.reminder.whatsapp.type === 'minutes' && task.reminder.whatsapp.value) {
                        whatsappReminderDate.setMinutes(whatsappReminderDate.getMinutes() - task.reminder.whatsapp.value);
                    } else if (task.reminder.whatsapp.type === 'hours' && task.reminder.whatsapp.value) {
                        whatsappReminderDate.setHours(whatsappReminderDate.getHours() - task.reminder.whatsapp.value);
                    } else if (task.reminder.whatsapp.type === 'days' && task.reminder.whatsapp.value) {
                        whatsappReminderDate.setDate(whatsappReminderDate.getDate() - task.reminder.whatsapp.value);
                    }
                    console.log(`Calculated whatsappReminderDate: ${whatsappReminderDate.toISOString()}`);
                }

                // Handle specific reminder dates for email
                if (task.reminder.email?.type === 'specific' && task.reminder.email.date) {
                    const specificEmailReminderDate = new Date(task.reminder.email.date);
                    console.log(`Specific email reminder date: ${specificEmailReminderDate.toISOString()}`);
                    if (specificEmailReminderDate <= nowUTC) {
                        console.log('Email reminder is due now or overdue');
                        const assignedUser = task.assignedUser;
                        if (!assignedUser || !assignedUser.notifications.email) {
                            console.error('User or email notification setting is missing');
                            continue;
                        }
                        await sendReminderNotification(task, assignedUser);
                    }
                }

                // Handle specific reminder dates for WhatsApp
                if (task.reminder.whatsapp?.type === 'specific' && task.reminder.whatsapp.date) {
                    const specificWhatsAppReminderDate = new Date(task.reminder.whatsapp.date);
                    console.log(`Specific WhatsApp reminder date: ${specificWhatsAppReminderDate.toISOString()}`);
                    if (specificWhatsAppReminderDate <= nowUTC) {
                        console.log('WhatsApp reminder is due now or overdue');
                        const assignedUser = task.assignedUser;
                        if (!assignedUser || !assignedUser.whatsappNo) {
                            console.error('User or WhatsApp number is missing');
                            continue;
                        }
                        await sendReminderNotification(task, assignedUser);
                    }
                }

                // Check if general reminder is due
                if (emailReminderDate <= nowUTC || whatsappReminderDate <= nowUTC) {
                    console.log('General reminder is due now or overdue');
                    const assignedUser = task.assignedUser;
                    if (!assignedUser) {
                        console.error('Assigned user is missing');
                        continue;
                    }
                    await sendReminderNotification(task, assignedUser);
                } else {
                    console.log('No reminders are due for this task');
                }
            } else {
                console.log('No reminders set for this task');
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
