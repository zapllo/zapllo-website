// /app/api/payment-success/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/userModel'; // Adjust the path as necessary
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, amount, planName } = await request.json();

    // Compute the expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    // Verify the signature
    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    try {
        await connectDB(); // Ensure that the database is connected

        // GST rate (18%)
        const gstRate = 0.18;
        // Razorpay fee rate (2%)
        const razorpayFeeRate = 0.02;

        // Calculate the amount before GST
        const amountWithoutGST = amount / (1 + gstRate);
        // Calculate the net credited amount after deducting Razorpay's fee
        const creditedAmount = amountWithoutGST * (1 + razorpayFeeRate);

        // Update the user document
        await User.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                $inc: { credits: creditedAmount },
                $set: { isPro: true, subscribedPlan: planName }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credits and subscription status: ', error);
        return NextResponse.json({ error: 'Error updating credits and subscription status' }, { status: 500 });
    }
}
