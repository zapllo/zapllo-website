// Import necessary modules and models
import connectDB from "@/lib/db";
import Task, { ITask } from "@/models/taskModal"; // Assuming ITask interface is exported
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helper/getDataFromToken";


enum RepeatType {
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Daily = 'Daily',
}

connectDB();

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

        // Validate repeatType and set days or dates accordingly
        let days: string[] = [];
        let dates: number[] = [];

        if (data.repeatType === RepeatType.Weekly && data.days) {
            days = data.days;
        } else if (data.repeatType === RepeatType.Monthly && data.dates) {
            dates = data.dates;
        }

        // Create a new task with the provided data and the authenticated user's organization
        const newTaskData: ITask = {
            ...data,
            user: userId,
            organization: authenticatedUser.organization,
            comments: [],
            days,
            dates,
        };

        const newTask = new Task(newTaskData);

        // Save the new task to the database
        const savedTask = await newTask.save();

        // Example: Send email notification
        // const emailOptions: SendEmailOptions = {
        //     to: `${assignedUser.email}`,
        //     subject: "New Task Assigned",
        //     text: `Dear ${assignedUser.firstName},\n\nA new task has been assigned to you...`,
        //     html: `<p>Dear ${assignedUser.firstName},</p><p>A new task has been assigned to you...</p>`,
        // };
        // await sendEmail(emailOptions);

        // Example: Send webhook notification
        // await sendWebhookNotification(savedTask, assignedUser.whatsappNo, assignedUser.firstName, taskUser.firstName);


        return NextResponse.json({
            message: "Task created successfully",
            data: savedTask,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
