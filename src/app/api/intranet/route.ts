// /app/api/intranet/route.ts

import { NextResponse } from 'next/server';
import Intranet from '../../../models/intranetModel'; // Adjust the path to your Intranet model
import connectDB from '@/lib/db';

// Connect to the database
connectDB();

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const intranet = await Intranet.create(data);
        return NextResponse.json(intranet, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create Intranet entry' }, { status: 400 });
    }
}

export async function GET() {
    try {
        const intranetEntries = await Intranet.find().populate('category');
        return NextResponse.json(intranetEntries);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Intranet entries' }, { status: 400 });
    }
}
