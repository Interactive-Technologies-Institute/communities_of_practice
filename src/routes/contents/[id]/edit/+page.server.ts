import { editContentSchema } from '@/schemas/content';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';

export const load = async (event) => {
    const { session } = await event.locals.safeGetSession();
    if (!session) {
        return redirect(302, handleSignInRedirect(event));
    }
    const contentId = parseInt(event.params.id);

    async function getContent(id: number){
        const { data: contentData, error: contentError } = await event.locals.supabase
            .from('contents')
            .select('*')
            .eq('id', id)
            .single();

        if (contentError) {
            const errorMessage = 'Error fetching content, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }
        const fileUrl = event.locals.supabase.storage.from('contents').getPublicUrl(contentData.file);
        return {...contentData, file: undefined, fileUrl: fileUrl.data.publicUrl};
    }

    const contentData = await getContent(contentId);

    return {
        updateForm: await superValidate(contentData, zod(editContentSchema), {
            id: 'update-content',
        }),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(event, editContentSchema, 'update-content', async (event, userId, form) => {
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
                .update({
                    ...data,
                    user_id: userId,
                    file: filePath})
                .eq('id', parseInt(event.params.id));

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, withFiles({ message: supabaseError.message, form }));
            }

            return redirect(303, `/contents/${event.params.id}`);
        }),
};
