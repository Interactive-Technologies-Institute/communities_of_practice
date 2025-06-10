import type { UserProfile } from '@/types/types';
import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const roles = arrayQueryParam().decode(event.url.searchParams.get('roles'));
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getUsers(): Promise<UserProfile[]> {
        let query = event.locals.supabase
            .from('profiles_view')
            .select('*');

        if (sortBy === 'date_inserted') {
            query = query.order('inserted_at', { ascending: sortOrder === 'asc' });
        } 
        else if (sortBy === 'display_name') {
			query = query.order('display_name', { ascending: sortOrder === 'asc' });
		}
        else {
            query = query.order('inserted_at', { ascending: false });
        }

        if (search?.trim()) {
            query = query.ilike('display_name', `%${search.trim()}%`);
        }

        if (roles && roles.length) {
            const validRoles = ['user', 'moderator', 'admin'];
            const allValid = roles.every((r) => validRoles.includes(r));
            if (allValid) {
                query = query.in('role', roles as ('user' | 'moderator' | 'admin')[]);
            }
        }


        const { data: userProfiles, error: userProfilesError } = await query;

        if (userProfilesError) {
            const errorMessage = 'Error fetching user profiles, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return userProfiles;
    }
        
    return {
        user_profiles: await getUsers(),
    };
};
