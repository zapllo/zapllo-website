import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";


connectDB()
// Calls the connect function to establish a connection to the database.


export async function POST(request: NextRequest) {
    // Defines an asynchronous POST request handler.
    try {
        const reqBody = await request.json()
        const { whatsappNo, email, password, firstName, lastName } = reqBody
        // Parses the request body to extract username, email, and password.

        //Checks if a user with the provided email already exists. 
        const user = await User.findOne({ email })

        //If yes, returns a 400 response.
        if (user) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        //hash password using bcryptjs.
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            whatsappNo,
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        // Saves the new user to the database.
        const savedUser = await newUser.save()
        const emailOptions: SendEmailOptions = {
            to: email,
            subject: 'Thanks for registering at Zapllo!',
            text: `Dear ${firstName},\n\nThank you for reaching out to Zapllo! We are thrilled to hear from you and appreciate your interest in our services. Our team is already on it, and you can expect to hear back from us within the next 24 hours.Whether it is about our custom Notion systems, automation solutions, or business workflow consultation, we are here to help you achieve your goals with innovative and powerful solutions. In the meantime, feel free to explore our website to learn more about what we offer and how we can assist you.\n\nThanks & Regards\nTeam Zapllo`,
        };

        await sendEmail(emailOptions);

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser,
        })


    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })

    }
}