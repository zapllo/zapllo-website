import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"

connectDB()
// Calls the connect function to establish a connection to the database.

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json()
        const { email, password } = reqBody

        //check if user exists
        const user = await User.findOne({ email })

        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 })
        }

        //check if password is correct
        const validPassword = await bcryptjs.compare
            (password, user.password)
        if (!validPassword) {
            return NextResponse.json({ error: "Invlid password" }, { status: 400 })
        }

        //create token data
        // A JavaScript object (tokenData) is created to store essential user 
        // information. In this case, it includes the user's unique identifier (id), 
        // username, and email.

        const tokenData = {
            id: user._id,
            email: user.email
        }

        // Create a token with expiration of 1 day
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1d" })

        // Create a JSON response indicating successful login
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            data: user,
        })
        console.log(user, 'user')


        // Set the token as an HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,  // This makes the cookie inaccessible to client-side JavaScript
            secure: process.env.NODE_ENV === "production",  // Ensures the cookie is only sent over HTTPS in production
            sameSite: "strict",  // Prevents the cookie from being sent along with cross-site requests
            maxAge: 24 * 60 * 60,  // The duration (in seconds) for which the cookie will be valid (1 day here)
            path: "/",  // The path scope of the cookie
        });


        return response;



    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })

    }
}