import { createContentSchema } from '@/schemas/content';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';

export const load = async (event) => {
    const { session } = await event.locals.safeGetSession();
    if (!session) {
        return redirect(302, handleSignInRedirect(event));
    }

    return {
        createForm: await superValidate(zod(createContentSchema), {
            id: 'create-content',
        }),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(event, createContentSchema, 'create-content', async (event, userId, form) => {
            async function uploadFile(
                file: File
            ): Promise<{ path: string; error: StorageError | null }> {
                const fileExt = file.name.split('.').pop();
                const filePath = `${uuidv4()}.${fileExt}`;

                const { data: fileData, error: fileError } = await event.locals.supabase.storage
                    .from('contents')
                    .upload(filePath, file);

                if (fileError) {
                    setFlash({ type: 'error', message: fileError.message }, event.cookies);
                    return { path: '', error: fileError };
                }

                return { path: fileData.path, error: null };
            }

            let filePath = '';
            if (form.data.file) {
                const { path, error } = await uploadFile(form.data.file);
                if (error) {
                    return fail(500, withFiles({ message: error.message, form }));
                }
                filePath = path;
            } else if (form.data.fileUrl) {
                filePath = form.data.fileUrl.split('/').pop() ?? '';
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { fileUrl, file, ...data } = form.data;			
            const { error: supabaseError } = await event.locals.supabase
                .from('contents')
                .insert({
                    ...data,
                    user_id: userId,
                    file: filePath
                });

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, withFiles({ message: supabaseError.message, form }));
            }

            return redirect(303, '/contents');
        }),
};
