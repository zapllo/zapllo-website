import sendgrid from '@sendgrid/mail';

export interface SendEmailOptions {
    to: string;
    cc: string; // Optional cc field
    subject: string;
    text: string;
    html: string;
}

export async function sendEmail({ to, cc, subject, text, html }: SendEmailOptions): Promise<void> {
    // Check if SENDGRID_API_KEY is defined
    if (!process.env.SENDGRID_API_KEY) {
        console.error('SENDGRID_API_KEY is not defined');
        return;
    }

    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        cc,
        from: process.env.SENDGRID_SENDER_EMAIL || 'contact@zapllo.com', // Provide a default sender if not defined
        subject,
        text,
        html,
    };



    try {
        await sendgrid.send(msg);
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
