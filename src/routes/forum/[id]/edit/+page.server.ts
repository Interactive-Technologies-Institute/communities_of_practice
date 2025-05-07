import { createThreadSchema } from '@/schemas/thread';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';

export const load = async (event) => {
    const { session } = await event.locals.safeGetSession();
    if (!session) {
        return redirect(302, handleSignInRedirect(event));
    }

    async function getThread(id: string) {
        const { data: thread, error: threadError } = await event.locals.supabase
            .from('forum_threads')
            .select('*')
            .eq('id', id)
            .single();

        if (threadError) {
            const errorMessage = 'Error fetching thread, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        return thread;
    }

    const thread = await getThread(event.params.id);

    return {
        updateForm: await superValidate(thread, zod(createThreadSchema), {
            id: 'update-thread',
        }),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(event, createThreadSchema, 'update-thread', async (event, userId, form) => {

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const data = form.data;
            const { error: supabaseError } = await event.locals.supabase
                .from('forum_threads')
                .update({ ...data, user_id: userId })
                .eq('id', event.params.id);

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, withFiles({ message: supabaseError.message, form }));
            }

            return redirect(303, `/forum/${event.params.id}`);
        }),
};
