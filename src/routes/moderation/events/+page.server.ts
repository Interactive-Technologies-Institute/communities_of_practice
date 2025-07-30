import { updateModerationInfoSchema } from '@/schemas/moderation-info';
import type { EventWithModeration } from '@/types/types';
import { arrayQueryParam, handleFormAction, stringQueryParam } from '@/utils';
import { error, fail } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export const load = async (event) => {
	const search = stringQueryParam().decode(event.url.searchParams.get('s'));
	const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));
	const statuses = arrayQueryParam().decode(event.url.searchParams.get('statuses'));

	async function getEvents(): Promise<EventWithModeration[]> {
		let query = event.locals.supabase
			.from('events_view')
			.select('*, moderation:latest_events_moderation(status, inserted_at, comment)')
			.order('updated_at', { ascending: false });

		if (search) {
			query = query.textSearch('fts', search, { config: 'simple', type: 'websearch' });
		}

		if (tags && tags.length) {
			query = query.overlaps('tags', tags);
		}

		if (statuses && statuses.length) {
			const validStatuses = ['voting_open', 'no_one_voted', 'scheduled', 'ongoing', 'completed'];
			const allValid = statuses.every((s) => validStatuses.includes(s));
			if (allValid) {
				query = query.in('status', statuses as ('voting_open' | 'no_one_voted' | 'scheduled' | 'ongoing' | 'completed')[]);
			}
		}

		const { data: events, error: eventsError } = await query;

		if (eventsError) {
			const errorMessage = 'Error fetching events, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		return events;
	}

	async function getTags(): Promise<Map<string, number>> {
		const { data: tags, error: tagsError } = await event.locals.supabase
			.from('events_tags')
			.select();

		if (tagsError) {
			const errorMessage = 'Error fetching tags, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		const tagMap = new Map<string, number>();
		if (tags) {
			tags.forEach((tag) => {
				const { count, tag: tagName } = tag;
				if (count !== null && tagName !== null) {
					tagMap.set(tagName, count);
				}
			});
		}

		return tagMap;
	}

	return {
		events: await getEvents(),
		tags: await getTags(),
		updateModerationForm: await superValidate(zod(updateModerationInfoSchema), {
			id: 'update-moderation',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(
			event,
			updateModerationInfoSchema,
			'update-moderation',
			async (event, userId, form) => {
				const { error: supabaseError } = await event.locals.supabase
					.from('events_moderation')
					.insert({
						event_id: form.data.ref_id,
						user_id: form.data.user_id,
						status: form.data.status,
						comment: form.data.comment,
					});

				if (supabaseError) {
					setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
					return fail(500, { message: supabaseError.message, form });
				}

				// Add knowledge to chatbot if event is approved
				if (form.data.status === 'approved') {
					const { data: approvedEvent, error: eventError } = await event.locals.supabase
						.from('events')
						.select('id, title, tags, description, location, date, start_time, end_time')
						.eq('id', form.data.ref_id)
						.single();

					if (eventError || !approvedEvent) {
						console.error('Could not fetch event for embedding:', eventError?.message);
					} else {
						const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

						const embeddingText = `[Event] ${approvedEvent.title}
							Tags: ${approvedEvent.tags.join(', ')}
							Date: ${approvedEvent.date ?? 'TBD'} | ${approvedEvent.start_time ?? '?'}–${approvedEvent.end_time ?? '?'}
							Location: ${approvedEvent.location ?? 'Unspecified'}
							Description: ${approvedEvent.description ?? ''}
							Link: /events/${approvedEvent.id}`;

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
								source_id: approvedEvent.id
							} as any, {
								onConflict: 'type, source_id'  // TODO: As any
							});
						} catch (e) {
							console.error('Embedding error (event approval):', e);
						}
					}
				}

				return { form };
			}
		),
};
