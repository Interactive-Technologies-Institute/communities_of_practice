import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { ContentWithCounter, EventWithCounters, ThreadWithCounters, SelectableItem } from '@/types/types';
import { createThreadConnectionsSchema } from '@/schemas/connection';
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
            .eq('moderation_status', 'approved')
            .order('moderation_status', { ascending: true });

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

    async function getConnectedContentIds(threadId: number): Promise<number[]> {
        const { data: connectedContents, error: connectedContentsError } = await event.locals.supabase
            .from('thread_contents')
            .select('annexed_id')
            .eq('thread_id', threadId);

        if (connectedContentsError) {
            const errorMessage = 'Error fetching connected contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedContents?.map((row) => row.annexed_id) ?? [];
    }

    async function getEvents(): Promise<EventWithCounters[]> {
        let query = event.locals.supabase
            .from('events_view')
            .select('*')
            .not('moderation_status', 'in', '("pending","rejected")')
            .order('moderation_status', { ascending: true })
            .order('inserted_at', { ascending: false });

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

    async function getConnectedEventIds(threadId: number): Promise<number[]> {
        const { data: connectedEvents, error: connectedEventsError } = await event.locals.supabase
            .from('thread_events')
            .select('annexed_id')
            .eq('thread_id', threadId);

        if (connectedEventsError) {
            const errorMessage = 'Error fetching connected events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedEvents?.map((row) => row.annexed_id) ?? [];
    }

    async function getThreads(): Promise<ThreadWithCounters[]> {
        let query = event.locals.supabase
            .from('forum_threads_view')
            .select('*')
            .eq('moderation_status', 'approved')
            .neq('id', threadId)
            .order('moderation_status', { ascending: true });

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

    async function getConnectedThreadIds(threadId: number): Promise<number[]> {
        const { data: connectedThreads, error: connectedThreadsError } = await event.locals.supabase
            .from('thread_threads')
            .select('annexed_id')
            .eq('thread_id', threadId);

        if (connectedThreadsError) {
            const errorMessage = 'Error fetching connected threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedThreads?.map((row) => row.annexed_id) ?? [];
    }

    const threadId = parseInt(event.params.id);
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
    
    const connectedContentIds = await getConnectedContentIds(threadId);
    const connectedEventIds = await getConnectedEventIds(threadId);
    const connectedThreadIds = await getConnectedThreadIds(threadId);
    const connectedItems = [
        ...connectedContentIds.map((id) => ({ id, type: 'content' as const })),
        ...connectedEventIds.map((id) => ({ id, type: 'event' as const })),
        ...connectedThreadIds.map((id) => ({ id, type: 'thread' as const })),
    ];

    return {
        items,
        connectedItems,
        connectForm: await superValidate(
            { selectedItems: connectedItems },
            zod(createThreadConnectionsSchema),
            { id: 'create-thread-connections' }
        ),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(event, createThreadConnectionsSchema, 'create-thread-connections', async (event, userId, form) => {
            const threadId = parseInt(event.params.id);
            
            // Delete existing connections
            await event.locals.supabase
                .from('thread_contents')
                .delete()
                .eq('thread_id', threadId);

            await event.locals.supabase
                .from('thread_events')
                .delete()
                .eq('thread_id', threadId);

            await event.locals.supabase
                .from('thread_threads')
                .delete()
                .eq('thread_id', threadId);

            // Insert new connections
            const contentsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'content')
                .map((item) => ({
                    thread_id: threadId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            const eventsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'event')
                .map((item) => ({
                    thread_id: threadId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            const threadsToInsert = form.data.selectedItems
                .filter((item) => item.type === 'thread')
                .map((item) => ({
                    thread_id: threadId,
                    annexed_id: item.id,
                    user_id: userId
                }));

            if (contentsToInsert.length) {
                await event.locals.supabase.from('thread_contents').insert(contentsToInsert);
            }
            if (eventsToInsert.length) {
                await event.locals.supabase.from('thread_events').insert(eventsToInsert);
            }
            if (threadsToInsert.length) {
                await event.locals.supabase.from('thread_threads').insert(threadsToInsert);
            }
            throw redirect(303, `/forum/${threadId}`);
        }),
};