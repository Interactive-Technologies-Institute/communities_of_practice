import type { RequestHandler } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { writeFile, readFile, unlink } from 'fs/promises';
import { PUBLIC_GOOGLE_DRIVE_API_KEY } from '$env/static/public';

export const GET: RequestHandler = async ({ url }) => {
	const fileId = url.searchParams.get('id');
	if (!fileId) {
		return new Response('Missing file ID', { status: 400 });
	}

	const apiKey = PUBLIC_GOOGLE_DRIVE_API_KEY;
	const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&acknowledgeAbuse=true&key=${apiKey}`;

	const response = await fetch(driveUrl);
	if (!response.ok) {
		return new Response('Failed to fetch file from Google Drive', { status: 500 });
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	if (buffer.length < 10000 || buffer.slice(0, 5).toString().includes('<html>')) {
		return new Response('Downloaded file is not valid media.', { status: 415 });
	}

	const tmpInput = join(tmpdir(), `${randomUUID()}.mp4`);
	const tmpOutput = join(tmpdir(), `${randomUUID()}.mp3`);
	await writeFile(tmpInput, buffer);

	await new Promise((resolve, reject) => {
		const ffmpeg = spawn('ffmpeg', [
			'-i', tmpInput,
			'-b:a', '64k',
			'-f', 'mp3',
			tmpOutput
		]);
		
		ffmpeg.on('close', (code) => {
			code === 0 ? resolve(true) : reject(new Error('ffmpeg failed'));
		});
	});

	const outBuffer = await readFile(tmpOutput);
	await unlink(tmpInput);
	await unlink(tmpOutput);

	return new Response(outBuffer, {
		headers: {
			'Content-Type': 'audio/mpeg',
			'Content-Length': outBuffer.length.toString()
		}
	});
};
