import { signInSchema } from '$lib/schemas/sign-in';
import { fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms/server';

export const load = async (event) => {
	const session = await event.locals.getSession();
	if (session) {
		return redirect(303, '/');
	}

	return {
		form: await superValidate(zod(signInSchema)),
	};
};

export const actions = {
	default: async ({ request, url, cookies, locals: { supabase } }) => {
		const form = await superValidate(request, zod(signInSchema));

		if (!form.valid) {
			const errorMessage = 'Invalid form.';
			setFlash({ type: 'error', message: errorMessage }, cookies);
			return fail(400, { message: errorMessage, form });
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password,
		});

		if (error) {
			setFlash({ type: 'error', message: error.message }, cookies);
			return fail(500, { message: error.message, form });
		}

		if (url.searchParams.has('redirectTo')) {
			return redirect(303, url.searchParams.get('redirectTo')!);
		}
		return redirect(303, '/');
	},
};
