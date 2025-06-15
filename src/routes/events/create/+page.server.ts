import { createEventSchema } from '@/schemas/event';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';

export const load = async (event) => {
	const { session } = await event.locals.safeGetSession();
	if (!session) {
		return redirect(302, handleSignInRedirect(event));
	}

	return {
		createForm: await superValidate(zod(createEventSchema), {
			id: 'create-event',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, createEventSchema, 'create-event', async (event, userId, form) => {
			async function uploadImage(
				image: File
			): Promise<{ path: string; error: StorageError | null }> {
				const fileExt = image.name.split('.').pop();
				const filePath = `${uuidv4()}.${fileExt}`;

				const { data: imageFileData, error: imageFileError } = await event.locals.supabase.storage
					.from('events')
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
			const { imageUrl, image, voting_options, ...eventData } = form.data;

			const { data: insertedEvent, error: insertError } = await event.locals.supabase
				.from('events')
				.insert({
					...eventData,
					user_id: userId,
					image: imagePath
				})
				.select('id')
				.single();

			if (insertError || !insertedEvent) {
				setFlash({ type: 'error', message: insertError?.message ?? 'Insert failed' }, event.cookies);
				return fail(500, withFiles({ message: insertError?.message, form }));
			}
			
			// Insert voting options if provided
			if (eventData.allow_voting && voting_options && voting_options.length > 0) {
				const votingData = voting_options.map((opt) => ({
					event_id: insertedEvent.id,
					date: new Date(opt.date).toISOString().slice(0, 10),
					start_time: opt.start_time,
					end_time: opt.end_time,
				}));

				const { error: votingError } = await event.locals.supabase
					.from('events_voting_options')
					.insert(votingData);

				if (votingError) {
					setFlash({ type: 'error', message: votingError.message }, event.cookies);
					return fail(500, withFiles({ message: votingError.message, form }));
				}
			}

			return redirect(303, '/events');
		}),
};
