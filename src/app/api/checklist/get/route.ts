import connectDB from "@/lib/db";
import ChecklistItem from "@/models/checklistModel";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
    try {
        await connectDB();
        const checklistItems = await ChecklistItem.find();
        return NextResponse.json({ checklistItems },
            {
                status: 200,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching checklist items:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}