import { updateUserRoleSchema } from '@/schemas/user-role';
import type { UserProfile } from '@/types/types';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';

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

	async function getUsers(): Promise<UserProfile[]> {
		const query = event.locals.supabase.from('profiles_view').select('*');

		const { data: users, error: usersError } = await query;

		if (usersError) {
			const errorMessage = 'Error fetching users, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		return users as UserProfile[];
	}

	return {
		users: await getUsers(),
		updateUserRoleForm: await superValidate(zod(updateUserRoleSchema), {
			id: 'update-user-role',
		}),
	};
};

export const actions = {
	default: async (event) =>
		handleFormAction(
			event,
			updateUserRoleSchema,
			'update-user-role',
			async (event, _loggedInUserId, form) => {
				const userId = form.data.userId;

				const { error: supabaseError } = await event.locals.supabase
					.from('user_roles')
					.update({ role: form.data.role })
					.eq('id', userId);

				if (supabaseError) {
					setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
					return fail(500, { message: supabaseError.message, form });
				}

				return { form };
			}
		),
};
