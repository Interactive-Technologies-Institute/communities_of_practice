import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY!,
});

export const POST = async ({ request, locals: { supabase } }) => {
    try {
        
        const {data: { user }} = await supabase.auth.getUser();
        if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
        
        const MAX_CHARS = 25000;
        const { content } = await request.json();
        // Confirm maximum size
        const input = content.slice(0, MAX_CHARS);

        // Tags using OpenAI
        const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You answer in portuguese(Portugal) and raw text without styling. You are an assistant that suggests useful tags (each between 3 and 30 characters, including spaces) for forum threads or contents.'
					},
					{
						role: 'user',
						content: `Return a maximum of 4 unique tags (it's mandatory that each is between 3 and 30 characters, including spaces) that represent the following thread / content as a JSON array of strings. Example: ["tag1", "tag2"]\n\nContent:\n${input}`
					}
				],
				temperature: 0.7,
				max_tokens: 300
			});

        const text = response.choices[0].message.content ?? '[]';
        let tags: string[] = [];
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) tags = parsed.map(String);
        } catch {
            tags = [];
        }

        return json(tags);
    } catch (e) {
        console.error('AI error:', e);
        return json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
