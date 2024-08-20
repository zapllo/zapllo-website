import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (let chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Handle file upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files'); // Get all files

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const fileUrls = [];

    for (const file of files) {
      // Convert file to buffer
      const arrayBuffer = await (file as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Define S3 upload parameters
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/${Date.now()}-${(file as File).name}`,
        Body: buffer,
        ContentType: (file as File).type,
      };

      // Upload file to S3
      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      // Construct the file URL
      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      fileUrls.push(fileUrl);
    }
    console.log('File URLs:', fileUrls); // Log file URLs

    return NextResponse.json({ message: 'Files uploaded successfully', fileUrls });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
