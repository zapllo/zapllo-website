import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is in environment variables
});

export async function POST(req: NextRequest) {
    try {
        const { industry } = await req.json();
        if (!industry) {
            return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
        }

        // Construct the AI prompt to get task-related categories for a company based on industry
        const prompt = `Suggest 15 task-related business categories for a company in the ${industry} industry. Ensure an even mix of single-word and multi-word categories. Examples could include HR, Operations, Project Management, Client Support, and Automation.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Chat model
            messages: [{ role: 'system', content: prompt }],
        });

        // Extract the suggestions and ensure they are not undefined
        let suggestions = response.choices[0]?.message?.content
            ?.trim()
            .split('\n')
            .filter(Boolean) // Remove empty lines
            .map((category: string) => category.replace(/^\d+\.\s*/, '')) || []; // Default to an empty array if undefined

        // Split into single-word and multi-word categories
        const singleWordCategories = suggestions.filter(cat => cat.split(' ').length === 1);
        const multiWordCategories = suggestions.filter(cat => cat.split(' ').length > 1);

        // Ensure an even mix of single and multi-word categories (10 each)
        const finalCategories = [
            ...singleWordCategories.slice(0, 10),
            ...multiWordCategories.slice(0, 10),
        ];

        return NextResponse.json({ categories: finalCategories });
    } catch (error) {
        console.error('Error suggesting categories:', error);
        return NextResponse.json({ error: 'Failed to suggest categories' }, { status: 500 });
    }
}
