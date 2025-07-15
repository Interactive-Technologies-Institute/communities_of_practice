import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { ContentWithCounter } from '@/types/types';
import { createEventConnectionsSchema } from '@/schemas/connection';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';


export const load = async (event) => {
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const fileTypes = arrayQueryParam().decode(event.url.searchParams.get('fileTypes'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getContents(): Promise<ContentWithCounter[]> {
        let query = event.locals.supabase
            .from('contents_view')
            .select('*')
            .eq('moderation_status', 'approved')
            .order('moderation_status', { ascending: true });

        if (sortBy === 'date_inserted') {
            query = query.order('inserted_at', { ascending: sortOrder === 'asc' });
        }
        else if (sortBy === 'downloads') {
            query = query.order('downloads_count', { ascending: sortOrder === 'asc' });
        } 
        else if (sortBy === 'title') {
            query = query.order('title', { ascending: sortOrder === 'asc' });
        }
        else {
            query = query.order('inserted_at', { ascending: false });
        }

        if (search?.trim()) {
            query = query.ilike('title', `%${search.trim()}%`);
        }

        if (tags && tags.length) {
            query = query.overlaps('tags', tags);
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

    async function getTags(): Promise<Map<string, number>> {
        const { data: tags, error: tagsError } = await event.locals.supabase
            .from('contents_tags')
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

    async function getConnectedContentIds(eventId: number): Promise<number[]> {
        const { data: connectedContents, error: connectedContentsError } = await event.locals.supabase
            .from('event_contents')
            .select('content_id')
            .eq('event_id', eventId);

        if (connectedContentsError) {
            const errorMessage = 'Error fetching connected contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedContents?.map((row) => row.content_id) ?? [];
    }

    const eventId = parseInt(event.params.id);

    return {
        contents: await getContents(),
        tags: await getTags(),
        connectedContentIds: await getConnectedContentIds(eventId),
        connectForm: await superValidate(
                    { contentIds: [] },
                    zod(createEventConnectionsSchema),
                    { id: 'create-event-connections' }
                ),
    };
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, createEventConnectionsSchema, 'create-event-connections', async (event, userId, form) => {
            const eventId = parseInt(event.params.id);
            
			// Delete existing connections
			await event.locals.supabase
				.from('event_contents')
				.delete()
				.eq('event_id', eventId);

			// Insert new connections
			if (form.data.contentIds.length > 0) {
				const connections = form.data.contentIds.map((content_id) => ({
					event_id: eventId,
					content_id,
					user_id: userId
				}));

				const { error } = await event.locals.supabase
					.from('event_contents')
					.insert(connections);

				if (error) {
					throw new Error('Failed to connect contents to event');
				}
			}
            throw redirect(303, `/events/${eventId}`);
		}),
};