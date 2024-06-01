import { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '@/lib/db';
import Subscriber from '@/models/subscriber';
import { NextResponse } from 'next/server';

connectDb();

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { email } = req.body;
        console.log(email)
        // Validate email (you can add more validation logic here)

        // Check if the email already exists in the database
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return NextResponse.json({ error: "Email already Subscribed" }, { status: 400 });
        }

        // Create a new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        return NextResponse.json({ message: "Subscription successful" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error', message: error }, { status: 500 });

    }
}

