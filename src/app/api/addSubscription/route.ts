import connectDB  from "@/lib/db";
import Subscriber from "@/models/subscriber";
import { NextApiRequest, NextApiResponse } from "next";

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<void> {
    try {
        const { email } = JSON.parse(request.body);

        if (!email) {
            return response.status(400).json({ error: "Email is required" });
        }

        await connectDB();

        const newSubscriber = new Subscriber({ email });
        const res = await newSubscriber.save();

        return response.status(200).json({ res });
    } catch (error: any) {
        if (error.code === 11000) {
            return response.status(400).json({ error: "Email already exists" });
        }

        return response.status(500).json({ error: error.message });
    }
}
