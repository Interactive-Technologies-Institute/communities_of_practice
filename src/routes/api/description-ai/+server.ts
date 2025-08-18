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
        const { content, type } = await request.json();
        // Confirm maximum size
        const safeContent = content.slice(0, MAX_CHARS);

        // Describe using OpenAI
        const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages: [
					{
						role: 'system',
						content: `You answer in portuguese(Portugal) and raw text without styling. You are a helpful assistant describing the contents of user-uploaded ${type} files. Be clear and concise.`
					},
					{
						role: 'user',
						content: `Please describe the following ${type}:\n\n${safeContent}`
					}
				],
				temperature: 0.6,
				max_tokens: 600
			});

        const description = response.choices[0].message.content ?? '';
        return json(description);
    } catch (e) {
        console.error('AI error:', e);
        return json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
