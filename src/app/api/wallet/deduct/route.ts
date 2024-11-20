import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel'; // Update with the correct path to your User model
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        await connectDB(); // Ensure database connection

        const body = await req.json();
        const { userId, amount } = body;

        if (!userId || amount === undefined) {
            return NextResponse.json(
                { success: false, message: 'User ID and amount are required.' },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found.' },
                { status: 404 }
            );
        }

        if (user.credits < amount) {
            return NextResponse.json(
                { success: false, message: 'Insufficient credits.' },
                { status: 400 }
            );
        }

        // Deduct the credits
        user.credits -= amount;
        await user.save();

        return NextResponse.json({ success: true, message: 'Credits deducted successfully.' });
    } catch (error) {
        console.error('Error deducting credits:', error);
        return NextResponse.json(
            { success: false, message: 'Error processing request.' },
            { status: 500 }
        );
    }
}
