import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/userModel'; // Adjust the path as necessary
import Order from '@/models/orderModel'; // Adjust the path as necessary
import Organization from '@/models/organizationModel'; // Adjust the path as necessary
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, amount, planName, subscribedUserCount } = await request.json();
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
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { credits: creditedAmount },
                $set: { isPro: true, subscribedPlan: planName }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if the user is part of an organization and update the organization's isPro status
        if (user.organization) {
            const subscriptionExpires = new Date();
            subscriptionExpires.setDate(subscriptionExpires.getDate() + 365); // Set expiry date to 365 days from now

            await Organization.updateOne(
                { _id: user.organization },
                {
                    $set: {
                        isPro: true,
                        subscriptionExpires
                    }
                }
            );
        }

        // Create a new order document
        const newOrder = new Order({
            userId: new mongoose.Types.ObjectId(userId),
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: amount,
            planName: planName,
            creditedAmount: creditedAmount,
            subscribedUserCount,
        });

        await newOrder.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credits and subscription status: ', error);
        return NextResponse.json({ error: 'Error updating credits and subscription status' }, { status: 500 });
    }
}
