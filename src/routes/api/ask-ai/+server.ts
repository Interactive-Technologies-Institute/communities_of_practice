// src/routes/api/ask/+server.ts
import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import tokenizer from 'gpt-tokenizer';
import { OpenAI } from 'openai';
import { SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY!,
});

export const POST = async ({ request, locals: { supabase } }) => {
	try {
		const { query } = await request.json();

		const {data: { user }} = await supabase.auth.getUser();

		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const input = query.replace(/\n/g, ' ');
		console.log('User query:', input);

		await supabase.from('conversations').insert({
			speaker: 'user',
			entry: query,
			user_id: user.id
		});

		// Embed the query
		const embeddingResponse = await openai.embeddings.create({
			model: 'text-embedding-ada-002',
			input,
		});
		const embedding = embeddingResponse.data[0].embedding;

		// Search for relevant documents
		const { data: matchedDocuments, error } = await supabase.rpc('match_documents', {
			query_embedding: embedding,
			match_threshold: 0.00000001,
			match_count: 10
		} as any);  // TODO: As any

		if (error) throw error;

		if (!matchedDocuments.length || matchedDocuments[0].similarity < 0.8) {
			const noMatch = "I'm sorry, I couldn't find relevant information in the platform."
				await supabase.from('conversations').insert({
				speaker: 'ai',
				entry: noMatch,
				user_id: user.id
			} as any);
			return json({
				result: noMatch
			});
		}

		// Prepare context
        let tokenCount = 0;
        let contextText = '';

        for (const doc of matchedDocuments) {
            const content = doc.content;
            const encoded = tokenizer.encode(content);
            tokenCount += encoded.length;

            if (tokenCount > 8000) break;

            contextText += `${content.trim()}---\n`;
        }


		// Ask OpenAI
		const chatResponse = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a helpful assistant. Answer questions truthfully based on the following context:\n\n${contextText}`
				},
				{ role: 'user', content: query }
			],
			max_tokens: 512,
			temperature: 0
		});

		const text = chatResponse.choices[0].message.content;
		console.log('AI response:', text);

		await supabase.from('conversations').insert({
			speaker: 'ai',
			entry: text,
			user_id: user.id
		} as any); // TODO: As any
		return json({ text });
	} catch (e) {
		console.error('AI error:', e);
		return json({ error: 'Something went wrong.' }, { status: 500 });
	}
};
