import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import User from '@/models/userModel'; // Import the User model
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

// Handle face recognition and updating MongoDB
export async function POST(request: Request) {
    try {
        // Parse the request body (expecting userId and imageUrls)
        const { userId, imageUrls } = await request.json();

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ success: false, error: 'Invalid user ID' });
        }

        // Validate imageUrls
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length !== 3) {
            return NextResponse.json({ success: false, error: 'You must provide exactly 3 image URLs' });
        }

        // Find the user in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' });
        }

        // Use the first image for face recognition (assume imageUrls[0])
        const rekognitionParams = {
            Image: {
                S3Object: {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Name: extractS3Key(imageUrls[0]), // Extract the object key from the URL
                },
            },
            Attributes: ['ALL'],
        };

        // Call AWS Rekognition to detect faces
        const rekognitionData = await rekognitionClient.detectFaces(rekognitionParams).promise();

        if (rekognitionData.FaceDetails && rekognitionData.FaceDetails.length > 0) {
            const faceDescriptor = rekognitionData.FaceDetails[0]; // Get the first face descriptor

            // Convert the face descriptor to a number array (filter only numeric data)
            const faceDescriptorArray = Object.values(faceDescriptor).filter(value => typeof value === 'number');

            // Append the new face descriptor to the faceDescriptors array
            user.faceDescriptors.push(faceDescriptorArray);

            // Step 2: Add the image URLs to the user's document
            (user.imageUrls as unknown as string[]).push(...imageUrls);

            // Save the updated user document
            await user.save();

            // Return success response
            return NextResponse.json({
                success: true,
                message: 'Face descriptor and image URLs saved successfully',
                faceDescriptor,
                imageUrls,
            });
        } else {
            return NextResponse.json({ success: false, error: 'No face detected' });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: 'Server error' });
    }
}
