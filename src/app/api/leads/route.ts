// app/api/subscribers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/leads';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { email, firstName, lastName, message, mobNo } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        if (!firstName) {
            return NextResponse.json({ error: 'First Name is required' }, { status: 400 });
        }

        if (!lastName) {
            return NextResponse.json({ error: 'Last Name is required' }, { status: 400 });
        }

        if (!mobNo) {
            return NextResponse.json({ error: 'Mob No is required' }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const existingSubscriber = await Lead.findOne({ email });

        if (existingSubscriber) {
            return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
        }

        const newSubscriber = new Lead({ email, firstName, lastName, mobNo, message });

        await newSubscriber.save();

        return NextResponse.json({ message: 'Lead Captured successful!' }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const subscribers = await Lead.find({});
        return NextResponse.json(subscribers, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
