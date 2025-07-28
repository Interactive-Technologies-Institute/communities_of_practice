import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '@/types/supabase-types';
import type { UserRole } from '@/types/types';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as documentHandle } from '@sveltekit-addons/document/hooks';
import { jwtDecode } from 'jwt-decode';

const sessionHandle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					/**
					 * Note: You have to add the `path` variable to the
					 * set and remove method due to sveltekit's cookie API
					 * requiring this to be set, setting the path to an empty string
					 * will replicate previous/standard behavior (https://kit.svelte.dev/docs/types#public-types-cookies)
					 */
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, { ...options, path: '/' })
					);
				},
			},
		}
	);

	/**
	 * Unlike `supabase.auth.getSession`, which is unsafe on the server because it
	 * doesn't validate the JWT, this function validates the JWT by first calling
	 * `getUser` and aborts early if the JWT signature is invalid.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error,
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		const jwt = jwtDecode<{ user_role: UserRole | undefined }>(session.access_token);
		const userRole = jwt.user_role ?? 'user';
		return { session, user: user !== null ? { ...user, role: userRole } : null };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version' || name === 'content-type';
		},
	});
};

export const handle = sequence(sessionHandle, documentHandle);
