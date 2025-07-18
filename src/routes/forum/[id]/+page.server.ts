import { deleteThreadSchema, toggleThreadLikeSchema } from '@/schemas/thread';
import { createThreadCommentSchema, deleteThreadCommentSchema, toggleThreadCommentLikeSchema, updateThreadCommentSchema } from '@/schemas/thread-comment';
import type { ThreadWithAuthor, ModerationInfo, ThreadCommentWithAuthorAndLikes, Event, ContentWithCounter, EventWithCounters } from '@/types/types';
import { handleFormAction } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { NestedComment } from '@/types/types';
import type { SuperValidated } from 'sveltekit-superforms';
import type { Infer } from 'sveltekit-superforms';
import { stringQueryParam } from '@/utils';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getThread(id: number): Promise<ThreadWithAuthor> {
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

        return {
        ...threadData,
        image: imageUrl
    };
    }
    async function getThreadModeration(id: number): Promise<ModerationInfo[]> {
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

    async function getLikesCount(id: number): Promise<{ count: number; userLikes: boolean }> {
        const { data: likes, error: likesError } = await event.locals.supabase
            .rpc('get_forum_thread_likes_count', {
                thread_id: id,
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

    function getCommentsCount(comments: NestedComment[]): number {
        let count = 0;
        for (const c of comments) {
            count += 1;
            if (c.replies?.length) {
                count += getCommentsCount(c.replies);
            }
        }
        return count;
    }

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

    async function getThreadComments(id: number): Promise<NestedComment[]> {
        const query = event.locals.supabase
            .from('thread_comments_view')
            .select('*, author:profiles_view!inner(*)')
            .eq('thread_id', id);

        if (sortBy === 'likes') {
            query.order('likes_count', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'date_inserted') {
            query.order('inserted_at', { ascending: sortOrder === 'asc' });
        } else {
            query.order('inserted_at', { ascending: true });
        }

        const { data: comments, error: commentsError } = await query;

        if (commentsError) {
            console.error('Supabase commentsError:', commentsError);
            const errorMessage = 'Error fetching comments, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        // For each comment, fetch like count and whether the user has liked it
        const commentsWithExtra: NestedComment[] = await Promise.all(
            comments
                .map(async (comment) => {
                    if (comment.id == null) {
                        throw new Error(`Missing ID on thread comment: ${JSON.stringify(comment)}`);
                    }
                    const { data, error: likeError } = await event.locals.supabase
                        .rpc('get_thread_comment_likes_count', {
                            comment_id: comment.id,
                            user_id: user?.id
                        })
                        .single();

                    return {
                        ...comment,
                        replies: [],
                    };
                })
        );
	    return commentsWithExtra;
    }

    async function getConnectedContents(threadId: number): Promise<ContentWithCounter[]> {
        const { data: connectedContents, error: connectedContentsError } = await event.locals.supabase
            .from('contents_view')
            .select('*, thread_contents!inner(thread_id)')
            .eq('thread_contents.thread_id', threadId)
            .eq('moderation_status', 'approved');

        if (connectedContentsError) {
            const errorMessage = 'Error fetching connected contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedContents;
    }

    async function getConnectedEvents(threadId: number): Promise<EventWithCounters[]> {
        const { data: connectedEvents, error: connectedEventsError } = await event.locals.supabase
            .from('events_view')
            .select('*, thread_events!inner(thread_id)')
            .eq('thread_events.thread_id', threadId)
            .eq('moderation_status', 'approved');

        if (connectedEventsError) {
            const errorMessage = 'Error fetching connected events, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return connectedEvents;
    }
    
    const threadId = parseInt(event.params.id);
    if (isNaN(threadId)) throw error(400, 'Invalid thread ID');

    const likesCount = await getLikesCount(threadId);
    const commentsCount = await getCommentsCount(await getThreadComments(threadId));
    // Fetch all comments and build the like forms for each
    const comments = await getThreadComments(threadId);
    const commentLikeForms: Record<string, SuperValidated<Infer<typeof toggleThreadCommentLikeSchema>>> = {};
    const editThreadCommentForms: Record<string, SuperValidated<Infer<typeof updateThreadCommentSchema>>> = {};
    
    for (const comment of comments) {
        const { data, error: likeError } = await event.locals.supabase
            .rpc('get_thread_comment_likes_count', {
                comment_id: comment.id,
                user_id: user?.id
            })
            .single();

        const userHasLiked = likeError ? false : data.has_likes ?? false;
        const commentLikeForm = await superValidate(
            { id: comment.id, value: userHasLiked },
            zod(toggleThreadCommentLikeSchema),
            { id: `toggle-thread-comment-like-${comment.id}` }
        );
        const commentEditForm = await superValidate(
            { id: comment.id, content: comment.content },
            zod(updateThreadCommentSchema),
            { id: `update-thread-comment-${comment.id}` }
        );

        commentLikeForms[comment.id] = commentLikeForm;
        editThreadCommentForms[comment.id] = commentEditForm;
    }

    return {
        thread: await getThread(threadId),
        moderation: await getThreadModeration(threadId),
        likesCount: likesCount.count,
        commentsCount,
        connectedContents: await getConnectedContents(threadId),
        connectedEvents: await getConnectedEvents(threadId),
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
        toggleCommentLikeForms: commentLikeForms,
        editThreadCommentForms,
        nestedComments: buildCommentTree(await getThreadComments(threadId)),
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
            // Check if the comment has replies
            const { data: replies, error: repliesError } = await event.locals.supabase
                .from('thread_comments')
                .select('id')
                .eq('parent_id', form.data.id);

            if (repliesError) {
                setFlash({ type: 'error', message: repliesError.message }, event.cookies);
                return fail(500, { message: repliesError.message, form });
            }

            if (replies && replies.length > 0) {
                // Don't delete completely if there are replies
                const { error: updateError } = await event.locals.supabase
                    .from('thread_comments')
                    .update({
                        is_deleted: true,
                    })
                    .eq('id', form.data.id)
                    .eq('user_id', userId);

                if (updateError) {
                    setFlash({ type: 'error', message: updateError.message }, event.cookies);
                    return fail(500, { message: updateError.message, form });
                }
            } else {
                // Hard-delete if no replies
                const { data: parentData, error: parentError } = await event.locals.supabase
                    .from('thread_comments')
                    .select('parent_id')
                    .eq('id', form.data.id)
                    .single();

                if (parentError) {
                    setFlash({ type: 'error', message: parentError.message }, event.cookies);
                    return fail(500, { message: parentError.message, form });
                }

                const { error: supabaseError } = await event.locals.supabase
                    .from('thread_comments')
                    .delete()
                    .eq('id', form.data.id)
                    .eq('user_id', userId);

                if (supabaseError) {
                    setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                    return fail(500, { message: supabaseError.message, form });
                }

                if (parentData && parentData.parent_id) {
                    // Check if parent should be hard-deleted
                    const { data: parent, error: parentFetchError } = await event.locals.supabase
                    .from('thread_comments')
                    .select('id, is_deleted')
                    .eq('id', parentData.parent_id)
                    .single();

                    if (parentFetchError) {
                        setFlash({ type: 'error', message: parentFetchError.message }, event.cookies);
                        return fail(500, { message: parentFetchError.message, form });
                    }
                    
                    if (parent && parent.is_deleted) {
                        // Check if parent is soft-deleted and has no non-deleted replies
                        const { count, error: countError } = await event.locals.supabase
                            .from('thread_comments')
                            .select('id', { count: 'exact', head: true })
                            .eq('parent_id', parent.id)
                            .eq('is_deleted', false);

                        if (!countError && count === 0) {
                            // Hard-delete the parent comment
                            await event.locals.supabase
                                .from('thread_comments')
                                .delete()
                                .eq('id', parent.id);
                        }
                    }
                }
            }
            return { form };
        }),
    editThreadComment: async (event) =>
		handleFormAction(event, updateThreadCommentSchema, 'edit-thread-comment', async (event, userId, form) => {
			const { error } = await event.locals.supabase
				.from('thread_comments')
				.update({ content: form.data.content })
				.eq('id', form.data.id)
				.eq('user_id', userId);

			if (error) {
				setFlash({ type: 'error', message: error.message }, event.cookies);
				return fail(500, { message: error.message, form });
			}

			return { form };
		}),
    toggleCommentLike: async (event) =>
        handleFormAction(
            event,
            toggleThreadCommentLikeSchema,
            'toggle-thread-comment-like',
            async (event, userId, form) => {
                const supabase = event.locals.supabase;

                if (form.data.value) {
                    const { error } = await supabase
                        .from('thread_comments_liked')
                        .insert({
                            comment_id: form.data.id,
                            user_id: userId
                        });
                    if (error) return fail(500, { message: error.message, form });
                } else {
                    const { error } = await supabase
                        .from('thread_comments_liked')
                        .delete()
                        .eq('comment_id', form.data.id)
                        .eq('user_id', userId);
                    if (error) return fail(500, { message: error.message, form });
                }
                return { form };
            }
        ),
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