import type { UserProfile } from '@/types/types';
import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

export const load = async (event) => {
    const { user } = await event.locals.safeGetSession();
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));

    async function getUsers(): Promise<UserProfile[]> {
        let query = event.locals.supabase
            .from('profiles_view')
            .select('*');

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
