import { json } from '@sveltejs/kit';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

import fs from 'fs';
import path from 'path';
import { writeFile, unlink, readdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY! });

const CHUNK_DURATION = 600; // 10 minutes per chunk

export const POST = async ({ request, locals: { supabase } }) => {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

		const form = await request.formData();
		const file = form.get('audio');
		if (!(file instanceof File)) return json({ error: 'No audio file provided.' }, { status: 400 });

		// Save input file to temp
		const baseId = randomUUID();
		const tempDir = path.join(tmpdir(), `transcribe-${baseId}`);
		await fs.promises.mkdir(tempDir, { recursive: true });

		const tempInput = path.join(tempDir, `input.mp3`);
		const arrayBuffer = await file.arrayBuffer();
		await writeFile(tempInput, Buffer.from(arrayBuffer));

		// Split the file using ffmpeg
		await new Promise((resolve, reject) => {
			const ffmpeg = spawn('ffmpeg', [
				'-i', tempInput,
				'-f', 'segment',
				'-segment_time', CHUNK_DURATION.toString(),
				'-c', 'copy',
				path.join(tempDir, 'chunk_%03d.mp3'),
			]);

			ffmpeg.on('close', (code) => {
				code === 0 ? resolve(true) : reject(new Error('FFmpeg failed to split audio'));
			});
		});

		// Get all chunk files
		const files = (await readdir(tempDir))
			.filter(f => f.startsWith('chunk_') && f.endsWith('.mp3'))
			.sort();

		let fullTranscription = '';

		// Transcribe each file
		for (const f of files) {
			const filePath = path.join(tempDir, f);
			const readStream = fs.createReadStream(filePath);

			const result = await openai.audio.transcriptions.create({
				file: readStream,
				model: 'whisper-1',
				response_format: 'text',
			});

			fullTranscription += ` ${result}`;

		}

		// Clean up
		await Promise.all(
			files.map(f => unlink(path.join(tempDir, f)))
				.concat(unlink(tempInput))
		);
		await fs.promises.rmdir(tempDir, { recursive: true });

		return new Response(fullTranscription.trim(), {
            headers: { 'Content-Type': 'text/plain' }
        });


	} catch (e: any) {
		console.error('Transcription failed:', e);
		return json({ error: e.message ?? 'Something went wrong' }, { status: 500 });
	}
};
