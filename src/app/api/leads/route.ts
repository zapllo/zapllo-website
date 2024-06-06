// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/leads';
import { SendEmailOptions, sendEmail } from '@/lib/sendEmail';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

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
            subject: 'Thank you for contacting us',
            text: 'Thank you for reaching out. We will get back to you soon.',
        };

        await sendEmail(emailOptions);

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
