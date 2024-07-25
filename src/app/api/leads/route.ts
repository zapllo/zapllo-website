import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/leads';
import { SendEmailOptions, sendEmail } from '@/lib/sendEmail';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

const sendWebhookNotification = async (phoneNumber: string, templateName: string, mediaUrl: string, firstName: string,) => {
    const payload = {
        phoneNumber,
        templateName,
        headerValues: [mediaUrl],
        bodyVariables: [firstName],
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
        await connectDB();

        const { email, firstName, lastName, message, mobNo } = await request.json();

        if (!email || !firstName || !lastName || !mobNo || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingLead = await Lead.findOne({ email });

        if (existingLead) {
            return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
        }

        const newLead = new Lead({ email, firstName, lastName, message, mobNo });
        await newLead.save();

        const emailOptions: SendEmailOptions = {
            to: email,
            subject: 'We have Received Your Inquiry!',
            text: `Dear ${firstName},\n\nThank you for reaching out to Zapllo! We are thrilled to hear from you and appreciate your interest in our services. Our team is already on it, and you can expect to hear back from us within the next 24 hours. Whether it is about our custom Notion systems, automation solutions, or business workflow consultation, we are here to help you achieve your goals with innovative and powerful solutions. In the meantime, feel free to explore our website to learn more about what we offer and how we can assist you.\n\nThanks & Regards\nTeam Zapllo`,
            html: `<h1>Thank You </h1>`,
        };
        await sendEmail(emailOptions);
        await sendWebhookNotification(mobNo, 'leadenquirycontactus', "https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/d262fa42-63b2-417e-83f2-87871d3474ff/message_template_media/DNLVjZYK4pvp/logo-02%204.png?se=2029-06-26T07%3A10%3A33Z&sp=rt&sv=2019-12-12&sr=b&sig=dAChtGOY3ztBj6Y0tvTPXTR5bibZVBx9MvQnUz/WiiA%3D", firstName);

        return NextResponse.json({ message: 'Lead Captured successfully!' }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const leads = await Lead.find({});
        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
