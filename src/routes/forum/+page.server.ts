import type { PostWithLikes } from '@/types/types';
import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));

    async function getPosts(): Promise<PostWithLikes[]> {
        let query = event.locals.supabase
            .from('forum_posts_view')
            .select('*')
            .order('moderation_status', { ascending: true })
            .order('inserted_at', { ascending: false });

        if (search) {
            query = query.textSearch('fts', search, { config: 'simple', type: 'websearch' });
        }

        if (tags && tags.length) {
            query = query.overlaps('tags', tags);
        }

        const { data: forumPosts, error: forumError } = await query;

        if (forumError) {
            const errorMessage = 'Error fetching posts, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const postsWithLikes = await Promise.all(
			forumPosts.map(async (post) => {
				const { data, error: likesError } = await event.locals.supabase
					.rpc('get_forum_post_likes_count', {
						post_id: post.id,
						user_id: user?.id,
					})
					.single();

				return {
					...post,
					likes_count: likesError ? 0 : data.count ?? 0,
				};
			})
		);

		return postsWithLikes;
    }

    async function getTags(): Promise<Map<string, number>> {
        const { data: tags, error: tagsError } = await event.locals.supabase
            .from('forum_posts_tags')
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
        forum_posts_with_likes: await getPosts(),
        tags: await getTags(),
    };
};
