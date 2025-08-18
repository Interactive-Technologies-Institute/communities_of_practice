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
        
        const MAX_CHARS = 400000;
        const { query } = await request.json();
        // Confirm maximum size
        const input = query.slice(0, MAX_CHARS);
        
        // Summarize using OpenAI
        const response = await openai.chat.completions.create({
				model: 'gpt-4o',
				messages: [
					{
						role: 'system',
						content: 'You answer in portuguese(Portugal) and raw text without styling. You are an assistant that reduces/summarizes forum threads and events on a platform for communities of practice clearly and concisely. If appropriate, use bullet points.'
					},
					{
						role: 'user',
						content: `Summarize the following \n\n${input}`
					}
				],
				temperature: 0.7,
				max_tokens: 600
			});

        const summary = response.choices[0].message.content ?? '';
        return json(summary);
    } catch (e) {
        console.error('AI error:', e);
        return json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
