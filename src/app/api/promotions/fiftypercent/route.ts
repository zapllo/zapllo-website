import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Your DB connection utility
import User, { IUser } from "@/models/userModel"; // Your User model
import fetch from "node-fetch";

connectDB();

const WEBHOOK_URL = "https://zapllo.com/api/webhook"; // Replace with your actual webhook URL
const TEMPLATE_NAME = "admin_success_login_after_1_hours"; // Webhook template name

// Function to send webhook notification
const sendWebhookNotification = async (admin: IUser) => {
    const payload = {
        phoneNumber: admin.whatsappNo,
        country: admin.country,
        bodyVariables: [admin.firstName],
        templateName: TEMPLATE_NAME,
    };
    console.log(payload, 'payload');

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        console.log(response, 'response');
        if (!response.ok) {
            const responseData = await response.json();
            console.log(responseData, 'ok')
            throw new Error(`Webhook API error: ${responseData}`);
        }
        console.log('Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
        throw new Error('Failed to send webhook notification');
    }
};


// Endpoint logic
export async function GET(request: NextRequest) {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find orgAdmins who haven't received the promotion notification
        const orgAdmins = await User.find({
            role: "orgAdmin",
            createdAt: { $lte: oneHourAgo }, // Created at least one hour ago
            promotionNotification: false, // Notification not sent yet
        });

        if (!orgAdmins.length) {
            return NextResponse.json({ message: "No pending notifications" });
        }

        const results = [];

        for (const admin of orgAdmins) {
            try {
                // Send the webhook notification
                await sendWebhookNotification(admin);

                // Update the promotionNotification flag to true
                admin.promotionNotification = true;
                await admin.save();

                results.push({ adminId: admin._id, success: true });
            } catch (error: any) {
                results.push({ adminId: admin._id, success: false, error: error.message });
            }
        }

        return NextResponse.json({
            message: "Notification process completed",
            results,
        });
    } catch (error: any) {
        console.error("Error in promotion notification process:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}