import { NextResponse, NextRequest } from 'next/server';
import AWS from 'aws-sdk';
import User from '@/models/userModel'; // Import the User model
import LoginEntry from '@/models/loginEntryModel'; // Import the new LoginEntry model
import { getDataFromToken } from '@/helper/getDataFromToken'; // Function to extract userId from token
import mongoose from 'mongoose';

// AWS Rekognition client (using v3 SDK)
const rekognitionClient = new AWS.Rekognition({
    region: process.env.AWS_REGION, // e.g., 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Function to extract S3 object key from URL
const extractS3Key = (url: string) => {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // This removes the bucket and region parts of the URL
};

// Handle face recognition login
export async function POST(request: NextRequest) {
    try {
        // Extract userId from the token
        const userId = await getDataFromToken(request);

        // Parse the request body (expecting imageUrl, lat, lng)
        const { imageUrl, lat, lng, action } = await request.json();

        // Validate imageUrl and lat/lng
        if (!imageUrl || !lat || !lng) {
            return NextResponse.json({ success: false, error: 'Image URL or location data missing' });
        }

        // Find the user in MongoDB
        const user = await User.findById(userId);
        if (!user || !Array.isArray(user.imageUrls) || user.imageUrls.length === 0) {
            return NextResponse.json({ success: false, error: 'User or images not found' });
        }

        let matchFound = false;
        let matchConfidence = 0;

        // Iterate over the user's registered images
        for (const registeredImageUrl of user.imageUrls as string[]) { // Cast to string[]
            const compareParams = {
                SourceImage: {
                    S3Object: {
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Name: extractS3Key(imageUrl), // Image captured during login
                    },
                },
                TargetImage: {
                    S3Object: {
                        Bucket: process.env.AWS_S3_BUCKET_NAME!,
                        Name: extractS3Key(registeredImageUrl), // Registered images
                    },
                },
                SimilarityThreshold: 90, // Only accept matches with confidence >= 90%
            };

            const compareData = await rekognitionClient.compareFaces(compareParams).promise();

            if (compareData.FaceMatches && compareData.FaceMatches.length > 0) {
                const confidence = compareData.FaceMatches[0]?.Similarity; // Ensure confidence is defined
                if (confidence !== undefined && confidence >= 90) {
                    matchFound = true;
                    matchConfidence = confidence;
                    break; // Stop after finding a match
                }
            }
        }

        if (matchFound) {
            // Create a new login entry
            const loginEntry = new LoginEntry({
                userId,
                lat,
                lng,
                action,
                timestamp: new Date(),
            });

            await loginEntry.save();

            return NextResponse.json({
                success: true,
                message: 'Face match found. Login successful.',
                confidence: matchConfidence,
                lat,
                lng,
            });
        } else {
            return NextResponse.json({ success: false, error: 'No matching face found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Server error' });
    }
}
