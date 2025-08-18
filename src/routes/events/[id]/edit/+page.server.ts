import { editEventSchema } from '@/schemas/event';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export const load = async (event) => {
	const { session } = await event.locals.safeGetSession();
	if (!session) {
		return redirect(302, handleSignInRedirect(event));
	}
	const eventId = parseInt(event.params.id);

	async function getEvent(id: number) {
		const { data: eventData, error: eventError } = await event.locals.supabase
			.from('events')
			.select('*')
			.eq('id', id)
			.single();

		if (eventError) {
			const errorMessage = 'Error fetching event, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}
		const imageUrl = event.locals.supabase.storage.from('events').getPublicUrl(eventData.image);
		return { ...eventData, image: undefined, imageUrl: imageUrl.data.publicUrl };
	}

	async function getVotingOptions(id: number) {
		const { data: votingOptions, error: votingError } = await event.locals.supabase
			.from('events_voting_options')
			.select('*')
			.eq('event_id', id);

		if (votingError) {
			const errorMessage = 'Error fetching voting options, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}
		return votingOptions;
	}

	function stripSeconds(time: string) {
		if (typeof (time) === 'string') return time.slice(0, 5);
		return time;
	}

	const eventData = await getEvent(eventId);
	// Check if the user is the author of the event
	if (eventData.user_id !== session.user.id) {
        return redirect(303, `/events/${eventId}`);
    }
	// To avoid zod validation errors
	eventData.start_time = eventData.start_time !== null ? stripSeconds(eventData.start_time) : null;
	eventData.end_time = eventData.end_time !== null ? stripSeconds(eventData.end_time) : null;
	eventData.voting_end_time = eventData.voting_end_time !== null ? stripSeconds(eventData.voting_end_time) : null;

	let votingOptions = await getVotingOptions(eventId);
	// To avoid zod validation errors
	votingOptions = votingOptions?.map((opt) => ({
		...opt,
		start_time: stripSeconds(opt.start_time),
		end_time: stripSeconds(opt.end_time),
	}));

	return {
		updateForm: await superValidate(
			{ ...eventData, voting_options: votingOptions ?? [] },
			zod(editEventSchema),
			{ id: 'update-event' }
		),
		eventId: eventId
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, editEventSchema, 'update-event', async (event, userId, form) => {
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
			const { imageUrl, voting_options, ...data } = form.data;
			const eventId = parseInt(event.params.id);
			const { error: supabaseError } = await event.locals.supabase
				.from('events')
				.update({ ...data, user_id: userId, image: imagePath })
				.eq('id', eventId);

			if (supabaseError) {
				setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
				return fail(500, withFiles({ message: supabaseError.message, form }));
			}

			// Check if the event is approved before embedding
			const { data: moderationStatus, error: moderationError } = await event.locals.supabase
				.from('latest_events_moderation')
				.select('status')
				.eq('event_id', eventId)
				.single();
				
			if (moderationError) {
				console.error('Error checking moderation status for event', moderationError.message);
			}
			else if (moderationStatus.status === 'approved') {
				// Update knowledge in chatbot
				const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

				const embeddingText = `[Event] ${form.data.title}
					Tags: ${form.data.tags.join(', ')}
					Date: ${form.data.date} | ${form.data.start_time}–${form.data.end_time}
					Location: ${form.data.location}
					Description: ${form.data.description}
					Link: /events/${eventId}`;

				try {
					const embeddingResponse = await openai.embeddings.create({
						model: 'text-embedding-ada-002',
						input: embeddingText
					});

					const embedding = embeddingResponse.data[0].embedding;

					await event.locals.supabase.from('documents').upsert({
						content: embeddingText,
						embedding: embedding,
						type: 'event',
						source_id: eventId
					} as any, { onConflict: 'type, source_id' });

				} catch (e) {
					console.error('Embedding error (edit event):', e);
				}
			}

			return redirect(303, `/events/${eventId}`);
		}),
};
