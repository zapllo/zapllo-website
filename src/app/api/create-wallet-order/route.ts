import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Order from '@/models/orderModel'; // Ensure the Order model is correctly imported
import connectDB from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        // Connect to the database
        await connectDB();

        // Parse the request body
        const {
            userId,
            amount,
            planName,
            creditedAmount = 0, // Default to 0 if not provided
            subscribedUserCount,
            additionalUserCount = 0, // Default to 0 if not provided
            deduction,
        } = await req.json();

        // Log received data for debugging
        console.log('Received data:', {
            userId,
            amount,
            planName,
            creditedAmount,
            subscribedUserCount,
            additionalUserCount,
            deduction,
        });

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Missing userId.' },
                { status: 400 }
            );
        }

        if (!amount && amount !== 0) {
            return NextResponse.json(
                { success: false, message: 'Missing amount.' },
                { status: 400 }
            );
        }

        if (!planName) {
            return NextResponse.json(
                { success: false, message: 'Missing planName.' },
                { status: 400 }
            );
        }

        if (!subscribedUserCount) {
            return NextResponse.json(
                { success: false, message: 'Missing subscribedUserCount.' },
                { status: 400 }
            );
        }

        // Generate a unique order ID and payment ID if not using Razorpay
        const generatedOrderId = `order_${new mongoose.Types.ObjectId()}`;
        const generatedPaymentId = `payment_${new mongoose.Types.ObjectId()}`;

        // Create a new order document
        const newOrder = new Order({
            userId: new mongoose.Types.ObjectId(userId),
            orderId: generatedOrderId,
            paymentId: generatedPaymentId,
            amount,
            planName,
            creditedAmount, // Will be 0 unless plan is "Recharge"
            subscribedUserCount,
            additionalUserCount,
            deduction,
        });

        // Save the new order document to the database
        await newOrder.save();

        return NextResponse.json({
            success: true,
            message: 'Order created successfully.',
            order: newOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, message: 'Error creating order.' },
            { status: 500 }
        );
    }
}
