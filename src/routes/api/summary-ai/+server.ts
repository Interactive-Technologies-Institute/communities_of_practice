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
        
        const { query } = await request.json();
        const input = query.replace(/\n/g, ' ');
        
        // Summarize using OpenAI
        const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are an assistant that reduces/summarizes forum threads and events on a platform for communities of practice clearly and concisely.'
					},
					{
						role: 'user',
						content: `Summarize the following \n\n${input}`
					}
				],
				temperature: 0.7,
				max_tokens: 300
			});

        const summary = response.choices[0].message.content ?? '';
        return json(summary);
    } catch (e) {
        console.error('AI error:', e);
        return json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
