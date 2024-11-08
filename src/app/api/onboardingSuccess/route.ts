import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Onboarding from '@/models/onboardingModel'; // Adjust path as necessary
import connectDB from '@/lib/db';

export async function POST(request: NextRequest) {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        firstName,
        lastName,
        companyName,
        industry,
        email,
        whatsappNo,
        amount,
        planName,
        subscribedUserCount,
    } = await request.json();

    // Compute the expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    // Verify the signature
    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    try {
        await connectDB();

        // GST rate (18%)
        const gstRate = 0.18;
        const amountWithoutGST = amount / (1 + gstRate); // Amount before GST

        // Save the onboarding details in the database
        const onboardingData = {
            firstName,
            lastName,
            companyName,
            industry,
            email,
            whatsappNo,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount,
            planName,
            creditedAmount: amountWithoutGST,
            subscribedUserCount,
            createdAt: new Date(),
        };

        const newOnboarding = new Onboarding(onboardingData);
        await newOnboarding.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving onboarding data: ', error);
        return NextResponse.json({ error: 'Error saving onboarding data' }, { status: 500 });
    }
}
