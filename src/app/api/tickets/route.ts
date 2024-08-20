// app/api/tickets/route.ts

import { NextResponse } from 'next/server';
import Ticket from '@/models/ticketModel';
import connectDB from '@/lib/db';

// GET request to fetch all tickets

// POST request to create a new ticket
export async function POST(req: Request) {
    try {
        await connectDB(); // Ensure the database is connected
        const data = await req.json(); // Parse the request body
        // In your ticket creation API
        console.log('Received Ticket Data:', data); // Ensure fileUrl is received

        const newTicket = new Ticket(data); // Create a new ticket instance
        await newTicket.save(); // Save the ticket to the database
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}

// PATCH request to update an existing ticket
export async function PATCH(req: Request) {
    try {
        await connectDB(); // Ensure the database is connected
        const { id, ...data } = await req.json(); // Parse the request body

        // Update the ticket by its ID
        const updatedTicket = await Ticket.findByIdAndUpdate(id, data, { new: true });

        if (!updatedTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTicket);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
