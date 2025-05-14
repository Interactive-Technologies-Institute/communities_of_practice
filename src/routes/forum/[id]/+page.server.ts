import { deleteThreadSchema, toggleThreadLikeSchema } from '@/schemas/thread';
import { createThreadCommentSchema, deleteThreadCommentSchema } from '@/schemas/thread-comment';
import type { ThreadWithAuthor, ModerationInfo, ThreadCommentWithAuthorAndLikes } from '@/types/types';
import { handleFormAction } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { NestedComment } from '@/types/types';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();

    async function getThread(id: string): Promise<ThreadWithAuthor> {
        const { data: threadData, error: threadError } = await event.locals.supabase
            .from('forum_threads_view')
            .select('*, author:profiles_view!inner(*)')
            .eq('id', id)
            .single();

        if (threadError) {
            const errorMessage = 'Error fetching thread, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const imageUrl = threadData.image
            ? event.locals.supabase.storage.from('forum_threads').getPublicUrl(threadData.image).data.publicUrl
            : undefined;

        return { ...threadData, image: imageUrl };
    }
    async function getThreadModeration(id: string): Promise<ModerationInfo[]> {
        const { data: moderation, error: moderationError } = await event.locals.supabase
            .from('forum_threads_moderation')
            .select('*')
            .eq('thread_id', id)
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
            .rpc('get_forum_thread_likes_count', {
                thread_id: parseInt(id),
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

    function buildCommentTree(comments: ThreadCommentWithAuthorAndLikes[]): NestedComment[] {
        const map = new Map<number, NestedComment>();
        const roots: NestedComment[] = [];

        for (const comment of comments) {
            map.set(comment.id, { ...comment, replies: [] });
        }

        for (const comment of map.values()) {
		if (comment.is_reply) {
			const parent = comment.parent_id ? map.get(comment.parent_id) : undefined;
			if (parent) {
				comment.parent_author = parent.author.display_name;
				parent.replies.push(comment);
			} else {
				comment.parent_author = '(deleted comment)';
				roots.push(comment);
			}
		} else {
			roots.push(comment);
		}
	}

        return roots;
    }

    async function getThreadComments(threadId: string): Promise<ThreadCommentWithAuthorAndLikes[]> {

        const { data: comments, error: commentsError } = await event.locals.supabase
            .from('thread_comments')
            .select('*, author:profiles_view!inner(*)')
            .eq('thread_id', threadId)
            .order('inserted_at', { ascending: true });

        if (commentsError) {
            const errorMessage = 'Error fetching comments, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const commentsWithExtra = await Promise.all(
            comments.map(async (comment) => {
                const { data: data, error: likeError } = await event.locals.supabase
                    .rpc('get_thread_comment_likes_count', {
                        comment_id: comment.id,
                        user_id: user?.id
                    })
                    .single();

                return {
                    ...comment,
                    likes_count: likeError ? 0 : data.count ?? 0
                };
            })
        );

        return commentsWithExtra;
    }

    return {
        thread: await getThread(event.params.id),
        moderation: await getThreadModeration(event.params.id),
        likesCount: likesCount.count,
        deleteForm: await superValidate(zod(deleteThreadSchema), {
            id: 'delete-thread',
        }),
        toggleLikeForm: await superValidate(
            { value: user ? likesCount.userLikes : false },
            zod(toggleThreadLikeSchema),
            { id: 'toggle-thread-like' }
        ),
        createThreadCommentForm: await superValidate(zod(createThreadCommentSchema), {
            id: 'create-thread-comment',
        }),
        deleteThreadCommentForm: await superValidate(zod(deleteThreadCommentSchema), {
            id: 'delete-thread-comment',
        }),
        nestedComments: buildCommentTree(await getThreadComments(event.params.id)),
    };
};

export const actions = {
    createThreadComment: async (event) =>
            handleFormAction(event, createThreadCommentSchema, 'create-thread-comment', async (event, userId, form) => {
                const { error } = await event.locals.supabase
                    .from('thread_comments')
                    .insert({
                        content: form.data.content,
                        user_id: userId,
                        thread_id: parseInt(event.params.id),
                        is_reply: form.data.parent_id !== null,
                        parent_id: form.data.parent_id ?? null
                    });
    
                if (error) {
                    setFlash({ type: 'error', message: error.message }, event.cookies);
                    return fail(500, { message: error.message, form });
                }
    
                return { form };
            }),
    deleteThreadComment: async (event) =>
        handleFormAction(event, deleteThreadCommentSchema, 'delete-thread-comment', async (event, userId, form) => {
            const { error: supabaseError } = await event.locals.supabase
                .from('thread_comments')
                .delete()
                .eq('id', form.data.id)
                .eq('user_id', userId);

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, { message: supabaseError.message, form });
            }

            return { form };
        }),
    delete: async (event) =>
        handleFormAction(event, deleteThreadSchema, 'delete-thread', async (event, userId, form) => {
            const { error: supabaseError } = await event.locals.supabase
                .from('forum_threads')
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
            toggleThreadLikeSchema,
            'toggle-thread-like',
            async (event, userId, form) => {
                if (form.data.value) {
                    const { error: supabaseError } = await event.locals.supabase
                        .from('forum_threads_liked')
                        .insert([
                            {
                                thread_id: parseInt(event.params.id),
                                user_id: userId,
                            },
                        ]);

                    if (supabaseError) {
                        setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                        return fail(500, { message: supabaseError.message, form });
                    }
                } else {
                    const { error: supabaseError } = await event.locals.supabase
                        .from('forum_threads_liked')
                        .delete()
                        .eq('thread_id', parseInt(event.params.id))
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
