import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import jwt from "jsonwebtoken";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_SECRET!, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        const emailOptions: SendEmailOptions = {
            to: email,
            subject: "Reset your password",
            text: `Please use the following link to reset your password: ${resetLink}`,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #13173F; color: #FFFFFF; padding: 20px; border-radius: 10px; text-align: center;">
                <img src='https://www.zapllo.com/logo.png'  style="height:40px; " />
                    <h1 style="background: linear-gradient(to right, #815BF5, #FC8929); -webkit-background-clip: text; color: transparent; font-size: 24px; margin-bottom: 20px;">
                        Reset Your Password
                    </h1>
                    <p style="font-size: 16px; color: #FFFFFF; margin-bottom: 20px;">
                        Please use the following link to reset your password:
                    </p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to right, #815BF5, #FC8929); color: #FFFFFF; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
            `
        };

        await sendEmail(emailOptions);

        return NextResponse.json({
            message: "Password reset link sent to your email",
            success: true,
        });
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
