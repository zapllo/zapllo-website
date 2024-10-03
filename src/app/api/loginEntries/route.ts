export const dynamic = 'force-dynamic'; // Add this line
import { NextRequest, NextResponse } from 'next/server';
import LoginEntry from '@/models/loginEntryModel';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { IUser } from '@/models/userModel';

export async function GET(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);

        // Fetch all login entries for the user and populate the user and their reporting manager information
        const entries = await LoginEntry.find({ userId }).populate({
            path: 'userId', // Populate the `userId` field to get user's firstName, lastName
            select: 'firstName lastName reportingManager', // Include `reportingManager` in the population
            populate: {
                path: 'reportingManager', // Populate the `reportingManager` field within the `userId`
                select: 'firstName lastName', // Select only `firstName` and `lastName` of the reporting manager
            },
        }).exec();

        // Ensure timestamp is returned as an ISO string in UTC
        const formattedEntries = entries.map((entry) => {
            const populatedUser = entry.userId as IUser; // Type assertion to IUser (because of .populate)
            return {
                ...entry.toObject(), // Convert Mongoose Document to plain JS object
                timestamp: new Date(entry.timestamp).toISOString(), // Convert to ISO string for uniformity
                userId: {
                    firstName: populatedUser.firstName,
                    lastName: populatedUser.lastName,
                    reportingManager: populatedUser.reportingManager ? {
                        firstName: (populatedUser.reportingManager as unknown as IUser)?.firstName,
                        lastName: (populatedUser.reportingManager as unknown as IUser)?.lastName,
                    } : null, // If the user has a reporting manager, include their info
                },
            };
        });

        return NextResponse.json({ success: true, entries: formattedEntries });
    } catch (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch entries' });
    }
}
