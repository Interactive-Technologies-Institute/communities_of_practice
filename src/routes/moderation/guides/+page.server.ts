import { updateModerationInfoSchema } from '@/schemas/moderation-info.js';
import type { GuideWithModeration } from '@/types/types';
import { arrayQueryParam, handleFormAction, stringQueryParam, handleSignInRedirect } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	const { session } = await event.locals.safeGetSession();
	if (!session) {
		return redirect(302, handleSignInRedirect(event));
	}

    const { data: userRoleData } = await event.locals.supabase
        .from('user_roles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (!userRoleData || (userRoleData.role !== 'admin' && userRoleData.role !== 'moderator')) {
        throw redirect(302, '/');
    }
	
	const search = stringQueryParam().decode(event.url.searchParams.get('s'));
	const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));

	async function getGuides(): Promise<GuideWithModeration[]> {
		let query = event.locals.supabase
			.from('guides_view')
			.select('*, moderation:latest_guides_moderation!inner(status, inserted_at, comment)')
			.order('updated_at', { ascending: false });

		if (search) {
			query = query.textSearch('fts', search, { config: 'simple', type: 'websearch' });
		}

		if (tags && tags.length) {
			query = query.overlaps('tags', tags);
		}

		const { data: guides, error: guidesError } = await query;

		if (guidesError) {
			const errorMessage = 'Error fetching guides, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		return guides;
	}

	async function getTags(): Promise<Map<string, number>> {
		const { data: tags, error: tagsError } = await event.locals.supabase
			.from('guides_tags')
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
		guides: await getGuides(),
		tags: await getTags(),
		updateModerationForm: await superValidate(zod(updateModerationInfoSchema), {
			id: 'update-moderation',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(
			event,
			updateModerationInfoSchema,
			'update-moderation',
			async (event, userId, form) => {
				const { error: supabaseError } = await event.locals.supabase
					.from('guides_moderation')
					.insert({
						guide_id: form.data.ref_id,
						user_id: form.data.user_id,
						status: form.data.status,
						comment: form.data.comment,
					});

				if (supabaseError) {
					setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
					return fail(500, { message: supabaseError.message, form });
				}

				return { form };
			}
		),
};
