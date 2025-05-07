import { createPostSchema } from '@/schemas/post';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import { fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	const { session } = await event.locals.safeGetSession();
	if (!session) {
		return redirect(302, handleSignInRedirect(event));
	}

	return {
		createForm: await superValidate(zod(createPostSchema), {
			id: 'create-post',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(event, createPostSchema, 'create-post', async (event, userId, form) => {
			const { error } = await event.locals.supabase
				.from('forum_posts')
				.insert({
					title: form.data.title,
					content: form.data.content,
					user_id: userId,
					tags: form.data.tags
				});

			if (error) {
				setFlash({ type: 'error', message: error.message }, event.cookies);
				return fail(500, { message: error.message, form });
			}

			return redirect(303, '/forum');
		}),
};
