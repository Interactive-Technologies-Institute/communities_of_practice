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

    async function getThread(id: number) {
        const { data: threadData, error: threadError } = await event.locals.supabase
            .from('forum_threads')
            .select('*')
            .eq('id', id)
            .single();

        if (threadError) {
            const errorMessage = 'Error fetching thread, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
		const imageUrl = event.locals.supabase.storage.from('forum_threads').getPublicUrl(threadData.image);
        return { ...threadData, image: undefined, imageUrl: imageUrl.data.publicUrl };
    }
    
    const threadId = parseInt(event.params.id);
    const thread = await getThread(threadId);

    return {
        updateForm: await superValidate(thread, zod(createThreadSchema), {
            id: 'update-thread',
        }),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(event, createThreadSchema, 'update-thread', async (event, userId, form) => {
            async function uploadImage(
                image: File
            ): Promise<{ path: string; error: StorageError | null }> {
                const fileExt = image.name.split('.').pop();
                const filePath = `${uuidv4()}.${fileExt}`;

                const { data: imageFileData, error: imageFileError } = await event.locals.supabase.storage
                    .from('forum_threads')
                    .upload(filePath, image);

                if (imageFileError) {
                    setFlash({ type: 'error', message: imageFileError.message }, event.cookies);
                    return { path: '', error: imageFileError };
                }

                return { path: imageFileData.path, error: null };
            }

            let imagePath = '';
            if (form.data.image) {
                const { path, error } = await uploadImage(form.data.image);
                if (error) {
                    return fail(500, withFiles({ message: error.message, form }));
                }
                imagePath = path;
            } else if (form.data.imageUrl) {
                imagePath = form.data.imageUrl.split('/').pop() ?? '';
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { imageUrl, ...data } = form.data;
            const { error: supabaseError } = await event.locals.supabase
                .from('forum_threads')
                .update({ ...data, user_id: userId, image: imagePath })
                .eq('id', parseInt(event.params.id));

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, withFiles({ message: supabaseError.message, form }));
            }

            return redirect(303, `/forum/${event.params.id}`);
        }),
};
