import sendgrid from '@sendgrid/mail';

export interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailOptions): Promise<void> {
    // Check if SENDGRID_API_KEY is defined
    if (!process.env.SENDGRID_API_KEY) {
        console.error('SENDGRID_API_KEY is not defined');
        return;
    }

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: process.env.SENDGRID_SENDER_EMAIL || 'contact@zapllo.com', // Provide a default sender if not defined
        subject,
        text,
    };

    try {
        await sendgrid.send(msg);
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
