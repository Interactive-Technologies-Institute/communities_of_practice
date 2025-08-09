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

    async function getAnnexedContents(contentId: number): Promise<ContentWithCounter[]> {
		const { data: annexedContentIds, error: contentsError } = await event.locals.supabase
            .from('content_contents')
            .select('annexed_id')
            .eq('content_id', contentId);

        if (contentsError) {
            throw error(500, 'Error fetching annexed content IDs');
        }

        const ids = annexedContentIds?.map(row => row.annexed_id) ?? [];

        const { data: annexedContents, error: annexedContentsError } = await event.locals.supabase
            .from('contents_view')
            .select('*')
            .in('id', ids)
            .eq('moderation_status', 'approved')
			.order('title', { ascending: true });

        if (annexedContentsError) {
            throw error(500, 'Error fetching annexed contents');
        }

        return annexedContents;
	}

    async function getAnnexedEvents(contentId: number): Promise<EventWithCounters[]> {
        const { data: annexedEvents, error: annexedEventsError } = await event.locals.supabase
            .from('events_view')
            .select('*, content_events!inner(content_id)')
            .eq('content_events.content_id', contentId)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (annexedEventsError) {
            const errorMessage = 'Error fetching annexed events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return annexedEvents;
    }

    async function getAnnexedThreads(contentId: number): Promise<ThreadWithCounters[]> {
        const { data: annexedThreads, error: annexedThreadsError } = await event.locals.supabase
            .from('forum_threads_view')
            .select('*, content_threads!inner(content_id)')
            .eq('content_threads.content_id', contentId)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (annexedThreadsError) {
            const errorMessage = 'Error fetching annexed forum threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return annexedThreads;
    }

    async function getContentsAnnexedTo(contentId: number): Promise<ContentWithCounter[]> {
        const { data: contentsAnnexedToIds, error: annexedToIdsError } = await event.locals.supabase
            .from('content_contents')
            .select('content_id')
            .eq('annexed_id', contentId);

        if (annexedToIdsError) {
            const msg = 'Error fetching content IDs annexed to this content, please try again later.';
            setFlash({ type: 'error', message: msg }, event.cookies);
            return error(500, msg);
        }

        const ids = contentsAnnexedToIds?.map(row => row.content_id) ?? [];

        const { data: contentsAnnexedTo, error: annexedToError } = await event.locals.supabase
            .from('contents_view')
            .select('*')
            .in('id', ids)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (annexedToError) {
            const msg = 'Error fetching contents annexed to this content, please try again later.';
            setFlash({ type: 'error', message: msg }, event.cookies);
            return error(500, msg);
        }

        return contentsAnnexedTo;
    }

    async function getEventsAnnexedTo(contentId: number): Promise<EventWithCounters[]> {
        const { data: eventsAnnexedTo, error: annexedToError } = await event.locals.supabase
            .from('events_view')
            .select('*, event_contents!inner(annexed_id)')
            .eq('event_contents.annexed_id', contentId)
            .eq('moderation_status', 'approved')
            .order('title', { ascending: true });

        if (annexedToError) {
            const msg = 'Error fetching events annexed to this content, please try again later.';
            setFlash({ type: 'error', message: msg }, event.cookies);
            return error(500, msg);
        }

        return eventsAnnexedTo;
    }

    async function getThreadsAnnexedTo(contentId: number): Promise<ThreadWithCounters[]> {
	const { data: threadsAnnexedTo, error: annexedToError } = await event.locals.supabase
		.from('forum_threads_view')
		.select('*, thread_contents!inner(annexed_id)')
		.eq('thread_contents.annexed_id', contentId)
		.eq('moderation_status', 'approved')
		.order('title', { ascending: true });

	if (annexedToError) {
		const msg = 'Error fetching threads annexed to this content, please try again later.';
		setFlash({ type: 'error', message: msg }, event.cookies);
		return error(500, msg);
	}

	return threadsAnnexedTo;
}
    
    const downloadCount = await getDownloadCount(event.params.id);

    const content = await getContent(contentId);

    return {
        content: content,
        moderation: await getContentModeration(contentId),
        downloadCount: downloadCount.count,
        annexedContents: await getAnnexedContents(contentId),
        annexedEvents: await getAnnexedEvents(contentId),
        annexedThreads: await getAnnexedThreads(contentId),
        contentsAnnexedTo: await getContentsAnnexedTo(contentId),
        eventsAnnexedTo: await getEventsAnnexedTo(contentId),
        threadsAnnexedTo: await getThreadsAnnexedTo(contentId),
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
