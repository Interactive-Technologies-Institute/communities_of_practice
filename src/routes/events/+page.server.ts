import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import type { EventWithCounters } from '@/types/types';

export const load = async (event) => {
	const search = stringQueryParam().decode(event.url.searchParams.get('s'));
	const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));
	const statuses = arrayQueryParam().decode(event.url.searchParams.get('statuses'));

	async function getEvents(): Promise<EventWithCounters[]> {
		let query = event.locals.supabase
			.from('events_view')
			.select('*')
			.order('moderation_status', { ascending: true })
			.order('inserted_at', { ascending: false });

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
	};
};
