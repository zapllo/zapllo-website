import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/userModel'; // Adjust the path as necessary
import Order from '@/models/orderModel'; // Adjust the path as necessary
import Organization from '@/models/organizationModel'; // Adjust the path as necessary
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';


const sendWebhookNotification = async (user: any) => {
    const payload = {
        phoneNumber: user.whatsappNo, // Ensure this field exists on the user model
        templateName: 'purchase_success',
        bodyVariables: [
            user.firstName, // Only one body variable
        ],
    };

    console.log('Payload for WhatsApp notification:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.text();
            console.error('Webhook API error response:', responseData);
            throw new Error(`Webhook API error: ${response.status} ${response.statusText}`);
        }

        console.log('WhatsApp notification sent successfully.');
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        throw new Error('Failed to send WhatsApp notification');
    }
};


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
        const creditedAmount = amountWithoutGST

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
            subscriptionExpires.setDate(subscriptionExpires.getDate() + 365);

            await Organization.updateOne(
                { _id: user.organization },
                {
                    $set: {
                        isPro: true,
                        subscribedPlan: planName,
                        subscribedUserCount,
                        subscriptionExpires,
                    },
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

        // **Send Email Notification**
        const emailOptions: SendEmailOptions = {
            to: user.email,
            subject: 'Thank You for Your Purchase',
            text: `Hi ${user.firstName},

🎉 Thank you so much for your purchase.

We are excited to get you up and running soon.

One of our onboarding specialists will connect with you soon and get your workspace up and running.

Regards,
Zapllo Support Team`,
            html: ` <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px; ">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; text-align: center; ">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
          <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 10px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
    <h1 style="margin: 0; font-size: 20px;">Regularization Request - Approved</h1>
</div>
                     <div style="padding: 20px; color:#000000;">
                      <p>Hi ${user.firstName},<br/>
                      🎉Thank you so much for your purchase. <br/>
                      We are excited to get you up and running soon. <br/>
                      One of our onboarding specialists will connect with you soon and get your workspace up and running.
<br/>
            Regards,
            Zapllo Support Team </p>
                        < p style = "margin-top: 20px; text-align:center; font-size: 12px; color: #888888;" > This is an automated notification.Please do not reply.</p>
                            </div>
                            </div>
                            </div>
                            </body>`,
        };

        try {
            await sendEmail(emailOptions);
            console.log('Email sent successfully to', user.email);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        // **Send WhatsApp Notification**
        try {
            await sendWebhookNotification(user);
        } catch (webhookError) {
            console.error('Error sending WhatsApp notification:', webhookError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credits and subscription status: ', error);
        return NextResponse.json({ error: 'Error updating credits and subscription status' }, { status: 500 });
    }
}