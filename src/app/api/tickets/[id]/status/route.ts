import { NextRequest, NextResponse } from 'next/server'
import Ticket from '@/models/ticketModel'
import connectDB from '@/lib/db'
import { getDataFromToken } from '@/helper/getDataFromToken'

// PATCH /api/tickets/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB()

        const { status, comment, fileUrls } = await req.json()

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 })
        }

        // Find the ticket and update its status
        const updatedTicket = await Ticket.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        )

        if (!updatedTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }
        const userId = await getDataFromToken(req)

        // Add the comment
        if (comment) {
            updatedTicket.comments.push({
                userId, // Assuming you're passing the user ID somehow
                content: comment,
                fileUrls: fileUrls || [],
                createdAt: new Date(),
            })
            await updatedTicket.save()
        }

        return NextResponse.json(updatedTicket)
    } catch (error) {
        console.error('Error updating ticket status:', error)
        return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 })
    }
}
