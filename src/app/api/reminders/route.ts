import mongoose from 'mongoose';
import Task from '../../../models/taskModal'; // Adjust the path based on your project structure
import User, { IUser } from '../../../models/userModel'; // Adjust the path based on your project structure
import connectDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';
import Category from '@/models/categoryModel';

connectDB();

const sendReminderNotification = async (task: any, user: any) => {
    const payload = {
        phoneNumber: user.whatsappNo,
        templateName: 'reminder_template',
        bodyVariables: [user.firstName, task.reminder?.value ?? 'N/A', task.category.name, task.title, task.dueDate, task.priority],
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


export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        console.log('Registered Models:', mongoose.models);
        const tasks = await Task.find().populate<{ user: IUser }>('user').populate('category').exec();

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

                // Send the reminder if the reminderDate is in the future or if the reminder hasn't been sent yet
                if ((reminderDate > now || reminderDate <= now) && !task.reminder.sent) {
                    const user = task.user;
                    if (!user || !user.whatsappNo) {
                        console.error('User or whatsappNo is missing');
                        continue;
                    }

                    await sendReminderNotification(task, user);

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