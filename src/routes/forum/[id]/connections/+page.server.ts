import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { ContentWithCounter, EventWithCounters } from '@/types/types';
import { createThreadConnectionsSchema } from '@/schemas/connection';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';


export const load = async (event) => {
    const contentsSearch = stringQueryParam().decode(event.url.searchParams.get('cs'));
    const contentsTags = arrayQueryParam().decode(event.url.searchParams.get('contentsTags'));
    const contentsSortBy = stringQueryParam().decode(event.url.searchParams.get('contentsSortBy'));
    const contentsSortOrder = stringQueryParam().decode(event.url.searchParams.get('contentsSortOrder'));
    const fileTypes = arrayQueryParam().decode(event.url.searchParams.get('fileTypes'));
    const eventsSearch = stringQueryParam().decode(event.url.searchParams.get('es'));
    const eventsTags = arrayQueryParam().decode(event.url.searchParams.get('eventsTags'));
    const statuses = arrayQueryParam().decode(event.url.searchParams.get('statuses'));

    async function getContents(): Promise<ContentWithCounter[]> {
        let query = event.locals.supabase
            .from('contents_view')
            .select('*')
            .eq('moderation_status', 'approved')
            .order('moderation_status', { ascending: true });

        if (contentsSortBy === 'date_inserted') {
            query = query.order('inserted_at', { ascending: contentsSortOrder === 'asc' });
        }
        else if (contentsSortBy === 'downloads') {
            query = query.order('downloads_count', { ascending: contentsSortOrder === 'asc' });
        } 
        else if (contentsSortBy === 'title') {
            query = query.order('title', { ascending: contentsSortOrder === 'asc' });
        }
        else {
            query = query.order('inserted_at', { ascending: false });
        }

        if (contentsSearch?.trim()) {
            query = query.ilike('title', `%${contentsSearch.trim()}%`);
        }

        if (contentsTags && contentsTags.length) {
            query = query.overlaps('contentsTags', contentsTags);
        }
        
        if (fileTypes && fileTypes.length) {
            const validTypes = [
                'Image',
                'Video',
                'Audio',
                'PDF',
                'Text',
                'Archive',
                'JSON',
                'Spreadsheet',
                'Word Doc',
                'File'
            ];
            const allValid = fileTypes.every((r) => validTypes.includes(r));
            if (allValid) {
                query = query.in('file_type', fileTypes); 
            }
        }

        const { data: contents, error: contentsError } = await query;

        if (contentsError) {
            const errorMessage = 'Error fetching contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return contents;
    }

    async function getContentsTags(): Promise<Map<string, number>> {
        const { data: contentsTags, error: contentsTagsError } = await event.locals.supabase
            .from('contents_tags')
            .select();

        if (contentsTagsError) {
            const errorMessage = 'Error fetching contentsTags, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const tagMap = new Map<string, number>();
        if (contentsTags) {
            contentsTags.forEach((tag) => {
                const { count, tag: tagName } = tag;
                if (count !== null && tagName !== null) {
                    tagMap.set(tagName, count);
                }
            });
        }

        return tagMap;
    }

    async function getConnectedContentIds(threadId: number): Promise<number[]> {
        const { data: connectedContents, error: connectedContentsError } = await event.locals.supabase
            .from('thread_contents')
            .select('content_id')
            .eq('thread_id', threadId);

        if (connectedContentsError) {
            const errorMessage = 'Error fetching connected contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedContents?.map((row) => row.content_id) ?? [];
    }

    async function getEvents(): Promise<EventWithCounters[]> {
        let query = event.locals.supabase
            .from('events_view')
            .select('*')
            .not('moderation_status', 'in', '("pending","rejected")')
            .order('moderation_status', { ascending: true })
            .order('inserted_at', { ascending: false });

        if (eventsSearch) {
            query = query.textSearch('fts', eventsSearch, { config: 'simple', type: 'websearch' });
        }

        if (eventsTags && eventsTags.length) {
            query = query.overlaps('eventsTags', eventsTags);
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

    async function getEventsTags(): Promise<Map<string, number>> {
        const { data: eventsTags, error: tagsError } = await event.locals.supabase
            .from('events_tags')
            .select();

        if (tagsError) {
            const errorMessage = 'Error fetching eventsTags, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const tagMap = new Map<string, number>();
        if (eventsTags) {
            eventsTags.forEach((tag) => {
                const { count, tag: tagName } = tag;
                if (count !== null && tagName !== null) {
                    tagMap.set(tagName, count);
                }
            });
        }

        return tagMap;
    }

    async function getConnectedEventIds(threadId: number): Promise<number[]> {
        const { data: connectedEvents, error: connectedEventsError } = await event.locals.supabase
            .from('thread_events')
            .select('event_id')
            .eq('thread_id', threadId);

        if (connectedEventsError) {
            const errorMessage = 'Error fetching connected events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedEvents?.map((row) => row.event_id) ?? [];
    }

    const threadId = parseInt(event.params.id);

    return {
        contents: await getContents(),
        contentsTags: await getContentsTags(),
        events: await getEvents(),
        eventsTags: await getEventsTags(),
        connectedContentIds: await getConnectedContentIds(threadId),
        connectedEventIds: await getConnectedEventIds(threadId),
        connectForm: await superValidate(
                    { contentIds: [] },
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

            // Insert new connections
            if (form.data.contentIds.length > 0) {
                const connections = form.data.contentIds.map((content_id) => ({
                    thread_id: threadId,
                    content_id,
                    user_id: userId
                }));

                const { error } = await event.locals.supabase
                    .from('thread_contents')
                    .insert(connections);

                if (error) {
                    throw new Error('Failed to connect contents to thread');
                }
            }

            if (form.data.eventIds.length > 0) {
                const connections = form.data.eventIds.map((event_id) => ({
                    thread_id: threadId,
                    event_id,
                    user_id: userId
                }));

                const { error } = await event.locals.supabase
                    .from('thread_events')
                    .insert(connections);

                if (error) {
                    throw new Error('Failed to connect events to thread');
                }
            }
            throw redirect(303, `/forum/${threadId}`);
        }),
};