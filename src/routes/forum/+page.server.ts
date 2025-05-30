import type { ThreadWithAuthorAndCounters } from '@/types/types';
import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));

    async function getThreads(): Promise<ThreadWithAuthorAndCounters[]> {
        let query = event.locals.supabase
            .from('forum_threads_view')
            .select('*, author:profiles_view!inner(*)')
            .order('moderation_status', { ascending: true })
            .order('inserted_at', { ascending: false });

        if (search) {
            query = query.textSearch('fts', search, { config: 'simple', type: 'websearch' });
        }

        if (tags && tags.length) {
            query = query.overlaps('tags', tags);
        }

        const { data: forumThreads, error: forumError } = await query;

        if (forumError) {
            const errorMessage = 'Error fetching threads, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const threadsWithCounters = await Promise.all(
            forumThreads.map(async (thread) => {
                const { data: likesData, error: likesError } = await event.locals.supabase
                    .rpc('get_forum_thread_likes_count', {
                        thread_id: thread.id,
                        user_id: user?.id,
                    })
                    .single();

                const { data: commentsData, error: commentsError } = await event.locals.supabase
                    .rpc('get_forum_thread_comments_count', {
                        thread_id: thread.id
                    })
                    .single();

                return {
                    ...thread,
                    image: thread.image ?? '',
                    likes_count: likesError ? 0 : likesData.count ?? 0,
                    comments_count: commentsError ? 0 : commentsData.count ?? 0,
                    author: {
                        ...thread.author,
                        interests: thread.author.interests ?? [],
                        skills: thread.author.skills ?? [],
                        education: thread.author.education ?? [],
                        languages: thread.author.languages ?? [],
                    },
                };
            })
        );

		return threadsWithCounters;
    }

    async function getTags(): Promise<Map<string, number>> {
        const { data: tags, error: tagsError } = await event.locals.supabase
            .from('forum_threads_tags')
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
        forum_threads_with_counters: await getThreads(),
        tags: await getTags(),
    };
};
