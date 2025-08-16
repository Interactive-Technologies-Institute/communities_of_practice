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
        
        const form = await request.formData();
        const file = form.get('audio');

        if (!(file instanceof File)) {
        return json('No audio file provided as form-data "audio".', { status: 400 });
        }
        
        // Transcribe using OpenAI
        const transcription = await openai.audio.transcriptions.create({
				file,
				model: 'gpt-4o-transcribe',
				response_format: 'text',
			});
        return json(transcription);
    } catch (e) {
        console.error('AI error:', e);
        return json({ error: 'Something went wrong.' }, { status: 500 });
    }
};
