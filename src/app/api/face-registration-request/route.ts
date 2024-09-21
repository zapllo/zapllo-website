import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import FaceRegistrationRequest from '@/models/faceRegistrationRequest';
import User from '@/models/userModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/helper/getDataFromToken';

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

// POST: Create a new face registration request and process face descriptors
export async function POST(request: NextRequest) {
    try {
        await connectDB(); // Ensure you're connected to the database

        const { imageUrls } = await request.json();

        // Get userId from token
        const userId = await getDataFromToken(request);

        // Validate userId
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
        }

        // Validate imageUrls
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length !== 3) {
            return NextResponse.json({ success: false, message: 'You must provide exactly 3 image URLs' }, { status: 400 });
        }

        // Find the user in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
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

            // Save the face registration request with status pending
            const newRequest = new FaceRegistrationRequest({
                userId,
                imageUrls,
                status: 'pending', // Set as pending until admin approves
            });

            // Append the face descriptor array to the request (optional, for record-keeping)
            // newRequest.faceDescriptor = faceDescriptorArray;

            // Save the request
            await newRequest.save();

            // Return success response
            return NextResponse.json({
                success: true,
                message: 'Face registration request submitted and pending approval.',
                faceDescriptor,
                imageUrls,
            });
        } else {
            return NextResponse.json({ success: false, message: 'No face detected in the image.' });
        }
    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
    }
}


export async function GET(request: NextRequest) {
    try {
        await connectDB(); // Ensure you're connected to the database

        // Get the logged-in user ID from the token
        const userId = await getDataFromToken(request);

        // Fetch the logged-in user's details (including organization)
        const loggedInUser = await User.findById(userId);
        if (!loggedInUser || !loggedInUser.organization) {
            return NextResponse.json({ success: false, message: 'User or organization not found' }, { status: 404 });
        }

        // Fetch all face registration requests for users in the same organization as the logged-in user
        const faceRequests = await FaceRegistrationRequest.find({
            userId: { $in: await User.find({ organization: loggedInUser.organization }).select('_id') },
        })
            .populate('userId', 'firstName lastName') // Populate user details (firstName and lastName)
            .exec();

        return NextResponse.json({ success: true, requests: faceRequests }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
