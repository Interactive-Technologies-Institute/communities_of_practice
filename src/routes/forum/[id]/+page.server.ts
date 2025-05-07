import { deletePostSchema, togglePostLikeSchema } from '@/schemas/post';
import type { PostWithAuthor, ModerationInfo } from '@/types/types';
import { handleFormAction } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();

    async function getPost(id: string): Promise<PostWithAuthor> {
        const { data: post, error: postError } = await event.locals.supabase
            .from('forum_posts_view')
            .select('*, author:profiles_view!inner(*)')
            .eq('id', id)
            .single();

        if (postError) {
            const errorMessage = 'Error fetching post, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        
        return post;
    }

    async function getPostModeration(id: string): Promise<ModerationInfo[]> {
        const { data: moderation, error: moderationError } = await event.locals.supabase
            .from('forum_posts_moderation')
            .select('*')
            .eq('post_id', id)
            .order('inserted_at', { ascending: false });

        if (moderationError) {
            const errorMessage = 'Error fetching moderation, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return moderation;
    }

    async function getLikesCount(id: string): Promise<{ count: number; userLikes: boolean }> {
        const { data: likes, error: likesError } = await event.locals.supabase
            .rpc('get_forum_post_likes_count', {
                post_id: parseInt(id),
                user_id: user?.id,
            })
            .single();
        
        if (likesError) {
            const errorMessage = 'Error fetching likes count, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        return { count: likes.count, userLikes: likes.has_likes };
    }


    const likesCount = await getLikesCount(event.params.id);


    return {
        post: await getPost(event.params.id),
        moderation: await getPostModeration(event.params.id),
        likesCount: likesCount.count,
        deleteForm: await superValidate(zod(deletePostSchema), {
            id: 'delete-post',
        }),
        toggleLikeForm: await superValidate(
            { value: user ? likesCount.userLikes : false }, // Ensures only current user sees their state
            zod(togglePostLikeSchema),
            { id: 'toggle-post-like' }
        ),
    };
};

export const actions = {
    delete: async (event) =>
        handleFormAction(event, deletePostSchema, 'delete-post', async (event, userId, form) => {
            const { error: supabaseError } = await event.locals.supabase
                .from('forum_posts')
                .delete()
                .eq('id', form.data.id);

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, { message: supabaseError.message, form });
            }

            return redirect(303, '/forum');
        }),

    toggleLike: async (event) =>
        handleFormAction(
            event,
            togglePostLikeSchema,
            'toggle-post-like',
            async (event, userId, form) => {
                if (form.data.value) {
                    const { error: supabaseError } = await event.locals.supabase
                        .from('forum_posts_liked')
                        .insert([
                            {
                                post_id: parseInt(event.params.id),
                                user_id: userId,
                            },
                        ]);

                    if (supabaseError) {
                        setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                        return fail(500, { message: supabaseError.message, form });
                    }
                } else {
                    const { error: supabaseError } = await event.locals.supabase
                        .from('forum_posts_liked')
                        .delete()
                        .eq('post_id', parseInt(event.params.id))
                        .eq('user_id', userId);

                    if (supabaseError) {
                        setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                        return fail(500, { message: supabaseError.message, form });
                    }
                }

                return { form };
            }
        ),
};
