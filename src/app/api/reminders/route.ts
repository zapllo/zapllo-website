import mongoose from 'mongoose';
import Task from '../../../models/taskModal'; // Adjust the path based on your project structure
import User, { IUser } from '../../../models/userModel'; // Adjust the path based on your project structure
import connectDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/categoryModel';

connectDB();

const sendReminderNotification = async (task: any, assignedUser: any) => {
    const payload = {
        phoneNumber: assignedUser.whatsappNo,
        templateName: 'reminder_template',
        bodyVariables: [assignedUser.firstName, task.reminder?.value ?? 'N/A', task.category.name, task.title, task.dueDate, task.priority],
    };

    console.log('Sending webhook with payload:', payload);

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Webhook response status:', response.status);
        console.log('Webhook response data:', response);

        if (!response.ok) {
            const responseData = await response.json();
            console.error('Webhook API error:', responseData.message);
            throw new Error(`Webhook API error: ${responseData.message}`);
        }
        console.log('Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
        throw new Error('Failed to send webhook notification');
    }
};

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        // Convert current local time to UTC
        const nowUTC = new Date(now.toISOString());

        console.log('Registered Models:', mongoose.models);
        const users = User.find({});
        const category = Category.find({});
        const tasks = await Task.find().populate<{ assignedUser: IUser }>('assignedUser').populate('category').exec();

        for (const task of tasks) {
            // Check if task.reminder is not null before accessing its properties
            if (task.reminder) {
                let reminderDate = new Date(task.dueDate);
                
                if (task.reminder.type === 'minutes') {
                    reminderDate.setMinutes(reminderDate.getMinutes() - task.reminder.value);
                } else if (task.reminder.type === 'hours') {
                    reminderDate.setHours(reminderDate.getHours() - task.reminder.value);
                } else if (task.reminder.type === 'days') {
                    reminderDate.setDate(reminderDate.getDate() - task.reminder.value);
                }

                // Compare reminderDate with UTC now
                if (reminderDate <= nowUTC && !task.reminder.sent) {
                    const assignedUser = task.assignedUser;
                    if (!assignedUser || !assignedUser.whatsappNo) {
                        console.error('User or whatsappNo is missing');
                        continue;
                    }

                    await sendReminderNotification(task, assignedUser);

                    // Mark the reminder as sent
                    task.reminder.sent = true;
                    await task.save();
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
