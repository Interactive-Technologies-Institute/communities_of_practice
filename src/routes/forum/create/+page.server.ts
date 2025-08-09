import { createThreadSchema } from '@/schemas/thread';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export const load = async (event) => {
	const { session } = await event.locals.safeGetSession();
	if (!session) {
		return redirect(302, handleSignInRedirect(event));
	}

	return {
		createForm: await superValidate(zod(createThreadSchema), {
			id: 'create-thread',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, createThreadSchema, 'create-thread', async (event, userId, form) => {
			async function uploadImage(
				image: File
			): Promise<{ path: string; error: StorageError | null }> {
				const fileExt = image.name.split('.').pop();
				const filePath = `${uuidv4()}.${fileExt}`;

				const { data: imageFileData, error: imageFileError } = await event.locals.supabase.storage
					.from('forum_threads')
					.upload(filePath, image);

				if (imageFileError) {
					setFlash({ type: 'error', message: imageFileError.message }, event.cookies);
					return { path: '', error: imageFileError };
				}

				return { path: imageFileData.path, error: null };
			}

			let imagePath = '';
			if (form.data.image) {
				const { path, error } = await uploadImage(form.data.image);
				if (error) {
					return fail(500, withFiles({ message: error.message, form }));
				}
				imagePath = path;
			} else if (form.data.imageUrl) {
				imagePath = form.data.imageUrl.split('/').pop() ?? '';
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { imageUrl, ...data } = form.data;			
			const { data: insertedThread, error: supabaseError } = await event.locals.supabase
				.from('forum_threads')
				.insert({
					title: form.data.title,
					content: form.data.content,
					user_id: userId,
					image: imagePath,
					summary: form.data.summary,
					tags: form.data.tags
				})
				.select('id')
				.single();

			if (supabaseError || !insertedThread) {
				setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
				return fail(500, { message: supabaseError.message, form });
			}
			
			// Add knowledge to chatbot, here because threads are auto-approved
			const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
			
			const embeddingText = `[Thread] ${form.data.title}
				Tags: ${form.data.tags.join(', ')}
				Content: ${form.data.content}
				Link: /forum/${insertedThread.id}`;
			try {
				const embeddingResponse = await openai.embeddings.create({
					model: 'text-embedding-ada-002',
					input: embeddingText
				});

				const embedding = embeddingResponse.data[0].embedding;

				await event.locals.supabase.from('documents').upsert({
					content: embeddingText,
					embedding: embedding,
					type: 'thread',
					source_id: insertedThread.id
				} as any, { onConflict: 'type, source_id' });  // TODO: As any

			} catch (e) {
				console.error('Embedding error:', e);
			}
			return redirect(303, `/forum/${insertedThread.id}/annexes`);
		}),
};
