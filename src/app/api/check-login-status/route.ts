export const dynamic = 'force-dynamic'; // Add this line
import { NextRequest, NextResponse } from 'next/server';
import LoginEntry from '@/models/loginEntryModel'; // Import LoginEntry model
import User from '@/models/userModel'; // Import User model to check faceDescriptors
import { getDataFromToken } from '@/helper/getDataFromToken'; // Extract userId from token

export async function GET(request: NextRequest) {
    try {
        // Extract userId from token
        const userId = await getDataFromToken(request);

        // Fetch the latest login entry for the user
        const lastEntry = await LoginEntry.findOne({ userId }).sort({ timestamp: -1 }).exec();

        // Fetch the user's faceDescriptors to check if they have registered faces
        const user = await User.findById(userId).select('faceDescriptors').exec();

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' });
        }

        // Check if the user has any registered face descriptors
        const hasRegisteredFaces = user.faceDescriptors && user.faceDescriptors.length > 0;

        // If no login history, return logged out status and check for face registration
        if (!lastEntry) {
            return NextResponse.json({ 
                success: true, 
                isLoggedIn: false, 
                hasRegisteredFaces,
                message: 'No login history found'
            });
        }

        // Check if the last action was 'login'
        const isLoggedIn = lastEntry.action === 'login';

        return NextResponse.json({ 
            success: true, 
            isLoggedIn, 
            hasRegisteredFaces 
        });
    } catch (error) {
        console.error('Error fetching login status:', error);
        return NextResponse.json({ success: false, error: 'Server error' });
    }
}
