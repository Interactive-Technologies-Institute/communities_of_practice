import { deleteContentSchema, downloadContentSchema } from '@/schemas/content';
import type { Content, ModerationInfo, ContentWithCounter, EventWithCounters, ThreadWithCounters } from '@/types/types';
import { handleFormAction } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const contentId = parseInt(event.params.id);

    async function getContent(id: number): Promise<Content> {
        const { data: contentData, error: contentError } = await event.locals.supabase
            .from('contents_view')
            .select('*')
            .eq('id', id)
            .single();

        if (contentError) {
            const errorMessage = 'Error fetching content, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        return contentData;
    }

    async function getContentModeration(id: number): Promise<ModerationInfo[]> {
        const { data: moderation, error: moderationError } = await event.locals.supabase
            .from('contents_moderation')
            .select('*')
            .eq('content_id', id)
            .order('inserted_at', { ascending: false });

        if (moderationError) {
            const errorMessage = 'Error fetching moderation, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return moderation;
    }

    async function getDownloadCount(id: string): Promise<{ count: number; userDownloaded: boolean }> {
        const { data: downloaded, error: downloadedError } = await event.locals.supabase
            .rpc('get_content_download_count', {
                content_id: parseInt(id),
                user_id: user?.id,
            })
            .single();

        if (downloadedError) {
            const errorMessage = 'Error fetching interest count, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        return { count: downloaded.count, userDownloaded: downloaded.has_download };
    }

    async function getConnectedContents(contentId: number): Promise<ContentWithCounter[]> {
		const { data: connectedContentIds, error: contentsError } = await event.locals.supabase
            .from('content_contents')
            .select('annexed_id')
            .eq('content_id', contentId);

        if (contentsError) {
            throw error(500, 'Error fetching connected content IDs');
        }

        const ids = connectedContentIds?.map(row => row.annexed_id) ?? [];

        const { data: connectedContents, error: connectedContentsError } = await event.locals.supabase
            .from('contents_view')
            .select('*')
            .in('id', ids)
            .eq('moderation_status', 'approved')
			.order('title', { ascending: true });

        if (connectedContentsError) {
            throw error(500, 'Error fetching connected contents');
        }

        return connectedContents;
	}

    async function getConnectedEvents(contentId: number): Promise<EventWithCounters[]> {
        const { data: connectedEvents, error: connectedEventsError } = await event.locals.supabase
            .from('events_view')
            .select('*, content_events!inner(content_id)')
            .eq('content_events.content_id', contentId)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (connectedEventsError) {
            const errorMessage = 'Error fetching connected events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedEvents;
    }

    async function getConnectedThreads(contentId: number): Promise<ThreadWithCounters[]> {
        const { data: connectedThreads, error: connectedThreadsError } = await event.locals.supabase
            .from('forum_threads_view')
            .select('*, content_threads!inner(content_id)')
            .eq('content_threads.content_id', contentId)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (connectedThreadsError) {
            const errorMessage = 'Error fetching connected forum threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedThreads;
    }
    
    const downloadCount = await getDownloadCount(event.params.id);

    const content = await getContent(contentId);

    return {
        content: content,
        moderation: await getContentModeration(contentId),
        downloadCount: downloadCount.count,
        connectedContents: await getConnectedContents(contentId),
        connectedEvents: await getConnectedEvents(contentId),
        connectedThreads: await getConnectedThreads(contentId),
        downloadForm: await superValidate(
                    { value: downloadCount.userDownloaded, file: content.file },
                    zod(downloadContentSchema),
                    {
                        id: 'download-content',
                    }
                ),
        deleteForm: await superValidate(zod(deleteContentSchema), {
            id: 'delete-content',
        }),
    };
};

export const actions = {
    delete: async (event) =>
        handleFormAction(event, deleteContentSchema, 'delete-content', async (event, userId, form) => {
            const { error: supabaseError } = await event.locals.supabase
                .from('contents')
                .delete()
                .eq('id', form.data.id);

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, { message: supabaseError.message, form });
            }

            return redirect(303, '/contents');
        }),
    downloadContent: async (event) =>
        handleFormAction(
            event,
            downloadContentSchema,
            'download-content',
            async (event, userId, form) => {
                if (form.data.value) {
                    const { error: supabaseError } = await event.locals.supabase
                        .from('contents_downloaded')
                        .upsert(
                            {
                                content_id: parseInt(event.params.id, 10),
                                user_id: userId,
                            },
                            {
                                onConflict: 'content_id,user_id',
                                ignoreDuplicates: true,
                            },
                        );

                    if (supabaseError) {
                        setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                        return fail(500, { message: supabaseError.message, form });
                    }
                }

                return { form };
            }
        ),
};
