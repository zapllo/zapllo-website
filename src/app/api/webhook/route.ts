import { NextRequest, NextResponse } from "next/server";

const sendWhatsAppMessage = async (phoneNumber: string, templateName: string, mediaUrl: string, bodyVariables: string[]) => {
    const payload = {
        countryCode: '+91',
        phoneNumber,
        type: 'Template',
        template: {
            name: templateName,
            languageCode: 'en',
            headerValues: [mediaUrl],
            bodyValues: bodyVariables,
        },
    };
    try {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Interakt API error: ${responseData.message}`);
        }
        console.log('WhatsApp message sent successfully:', payload);

    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw new Error('Failed to send WhatsApp message');
    }
};

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { phoneNumber, bodyVariables, templateName, mediaUrl } = reqBody;

        // Send WhatsApp message
        await sendWhatsAppMessage(phoneNumber, templateName, mediaUrl, bodyVariables);

        return NextResponse.json({ status: 'success', message: 'WhatsApp message sent successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
