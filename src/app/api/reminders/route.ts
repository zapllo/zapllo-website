import mongoose from 'mongoose';
import Task from '../../../models/taskModal'; // Adjust the path based on your project structure
import User from '../../../models/userModel'; // Adjust the path based on your project structure
import connectDB from '@/lib/db';
import { NextRequest } from 'next/server';

connectDB();

export async function GET(req: NextRequest) {
    try {
        const now = new Date();

        // Fetch tasks with reminders
        const tasks = await Task.find({
            reminder: { $ne: null },
            dueDate: { $gte: now },
            'reminder.type': { $in: ['minutes', 'hours', 'days'] }
        }).exec();

        // Fetch users for the tasks
        const userIds = tasks.map(task => task.user);
        const users = await User.find({ _id: { $in: userIds } }).exec();
        const usersMap = new Map(users.map(user => [user._id.toString(), user]));

        for (const task of tasks) {
            const reminderDate = new Date(task.dueDate);
            if (task.reminder?.type === 'minutes') {
                reminderDate.setMinutes(reminderDate.getMinutes() - task.reminder.value);
            } else if (task.reminder?.type === 'hours') {
                reminderDate.setHours(reminderDate.getHours() - task.reminder.value);
            } else if (task.reminder?.type === 'days') {
                reminderDate.setDate(reminderDate.getDate() - task.reminder.value);
            }

            if (reminderDate <= now) {
                const user = usersMap.get(task.user.toString());

                if (!user || !user.whatsappNo) {
                    console.error('User or whatsappNo is missing');
                    continue;
                }

                const payload = {
                    phoneNumber: user.whatsappNo,
                    bodyVariables: [user.firstName, task.reminder?.value ?? 'N/A', 'category', task.title, task.dueDate, task.priority],
                    templateName: 'reminder_template',
                };

                try {
                    const response = await fetch('https://api.interakt.ai/v1/public/message/', {
                        method: 'POST',
                        headers: {
                            Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                    const responseData = await response.json();
                    if (!response.ok) {
                        console.error(`Interakt API error: ${responseData.message || 'Unknown error'}`);
                        throw new Error(`Interakt API error: ${responseData.message || 'Unknown error'}`);
                    } else {
                        console.log('WhatsApp message sent successfully:', responseData);
                    }
                } catch (error) {
                    console.error('Error sending WhatsApp message:', error);
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
