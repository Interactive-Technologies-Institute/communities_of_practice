import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { ContentWithCounter, EventWithCounters, ThreadWithCounters, SelectableItem } from '@/types/types';
import { createAnnexesSchema } from '@/schemas/annex';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
    const search = stringQueryParam().decode(event.url.searchParams.get('search'));
    const types = arrayQueryParam().decode(event.url.searchParams.get('types'));
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getContents(): Promise<ContentWithCounter[]> {
        let query = event.locals.supabase
            .from('contents_view')
            .select('*')
            .eq('moderation_status', 'approved');

        if (search?.trim()) {
            query = query.ilike('title', `%${search.trim()}%`);
        }

        const { data: contents, error: contentsError } = await query;

        if (contentsError) {
            const errorMessage = 'Error fetching contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return contents;
    }

    async function getAnnexedContentIds(eventId: number): Promise<number[]> {
        const { data: annexedContents, error: annexedContentsError } = await event.locals.supabase
            .from('event_contents')
            .select('annexed_id')
            .eq('event_id', eventId);

        if (annexedContentsError) {
            const errorMessage = 'Error fetching annexed contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return annexedContents?.map((row) => row.annexed_id) ?? [];
    }

    async function getEvents(): Promise<EventWithCounters[]> {
        let query = event.locals.supabase
            .from('events_view')
            .select('*')
            .eq('moderation_status', 'approved')
            .neq('id', eventId);

        if (search?.trim()) {
            query = query.ilike('title', `%${search.trim()}%`);
        }

        const { data: events, error: eventsError } = await query;

        if (eventsError) {
            const errorMessage = 'Error fetching events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return events;
    }

    async function getAnnexedEventIds(eventId: number): Promise<number[]> {
        const { data: annexedEvents, error: annexedEventsError } = await event.locals.supabase
            .from('event_events')
            .select('annexed_id')
            .eq('event_id', eventId);

        if (annexedEventsError) {
            const errorMessage = 'Error fetching annexed events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return annexedEvents?.map((row) => row.annexed_id) ?? [];
    }

    async function getThreads(): Promise<ThreadWithCounters[]> {
        let query = event.locals.supabase
            .from('forum_threads_view')
            .select('*')
            .eq('moderation_status', 'approved');

        if (search?.trim()) {
            query = query.ilike('title', `%${search.trim()}%`);
        }

        const { data: threads, error: threadsError } = await query;

        if (threadsError) {
            const errorMessage = 'Error fetching threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return threads;
    }

    async function getAnnexedThreadIds(eventId: number): Promise<number[]> {
        const { data: annexedThreads, error: annexedThreadsError } = await event.locals.supabase
            .from('event_threads')
            .select('annexed_id')
            .eq('event_id', eventId);

        if (annexedThreadsError) {
            const errorMessage = 'Error fetching annexed threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return annexedThreads?.map((row) => row.annexed_id) ?? [];
    }

    const eventId = parseInt(event.params.id);
    const contents = (await getContents()).map((c) => ({ ...c, type: 'content' as const}));
    const events = (await getEvents()).map((e) => ({ ...e, type: 'event' as const}));
    const threads = (await getThreads()).map((e) => ({ ...e, type: 'thread' as const}));

    // Combine and sort
    let items: SelectableItem[] = [...contents, ...events, ...threads];

    items.sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        
        if (sortBy === 'title') {
            return order * a.title.localeCompare(b.title);
        }
        if (sortBy === 'date_inserted') {
            return order * (new Date(a.inserted_at).getTime() - new Date(b.inserted_at).getTime());
        }
        return (new Date(a.inserted_at).getTime() - new Date(b.inserted_at).getTime());
    });
    
    if (types?.length) {
        items = items.filter((item) => types.includes(item.type));
    }

    const annexedContentIds = await getAnnexedContentIds(eventId);
    const annexedEventIds = await getAnnexedEventIds(eventId);
    const annexedThreadIds = await getAnnexedThreadIds(eventId);
    const annexedItems = [
        ...annexedContentIds.map((id) => ({ id, type: 'content' as const })),
        ...annexedEventIds.map((id) => ({ id, type: 'event' as const })),
        ...annexedThreadIds.map((id) => ({ id, type: 'thread' as const })),
    ];

    return {
        items,
        annexedItems,
        annexForm: await superValidate(
            { selectedItems: annexedItems },
            zod(createAnnexesSchema),
            { id: 'create-event-annexes' }
        ),
    };
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, createAnnexesSchema, 'create-event-annexes', async (event, userId, form) => {
            const eventId = parseInt(event.params.id);
            
			// Delete existing annexes
			await event.locals.supabase
				.from('event_contents')
				.delete()
				.eq('event_id', eventId);
            
            await event.locals.supabase
				.from('event_events')
				.delete()
				.eq('event_id', eventId);

            await event.locals.supabase
				.from('event_threads')
				.delete()
				.eq('event_id', eventId);

			// Insert new annexes
            const contentsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'content')
                .map((item) => ({
                    event_id: eventId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            const eventsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'event')
                .map((item) => ({
                    event_id: eventId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            const threadsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'thread')
                .map((item) => ({
                    event_id: eventId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            if (contentsToInsert.length) {
                await event.locals.supabase.from('event_contents').insert(contentsToInsert);
            }
            if (eventsToInsert.length) {
                await event.locals.supabase.from('event_events').insert(eventsToInsert);
            }
            if (threadsToInsert.length) {
                await event.locals.supabase.from('event_threads').insert(threadsToInsert);
            }
            throw redirect(303, `/events/${eventId}`);
		}),
};