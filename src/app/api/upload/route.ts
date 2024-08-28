import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Handle file and audio upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files'); // Get all files
    const audio = formData.get('audio'); // Get audio if it exists

    if (!files.length && !audio) {
      return NextResponse.json({ error: 'No files or audio uploaded' }, { status: 400 });
    }

    const fileUrls: string[] = [];
    let audioUrl: string | null = null;

    // Upload files to S3
    for (const file of files) {
      const arrayBuffer = await (file as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/${Date.now()}-${(file as File).name}`,
        Body: buffer,
        ContentType: (file as File).type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
      fileUrls.push(fileUrl);
    }

    // Upload audio to S3
    if (audio) {
      const audioBuffer = await (audio as File).arrayBuffer();
      const buffer = Buffer.from(audioBuffer);

      const audioUploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/audio/${Date.now()}-${(audio as File).name}`,
        Body: buffer,
        ContentType: (audio as File).type,
      };

      const audioCommand = new PutObjectCommand(audioUploadParams);
      await s3.send(audioCommand);

      audioUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${audioUploadParams.Key}`;
    }

    return NextResponse.json({ message: 'Files uploaded successfully', fileUrls, audioUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
