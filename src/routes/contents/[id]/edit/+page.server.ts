import { editContentSchema } from '@/schemas/content';
import { handleFormAction, handleSignInRedirect } from '@/utils';
import type { StorageError } from '@supabase/storage-js';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, withFiles} from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

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
    // Check if the user is the author of the content
    if (contentData.user_id !== session.user.id) {
        return redirect(303, `/contents/${contentId}`);
    }

    return {
        updateForm: await superValidate(contentData, zod(editContentSchema), {
            id: 'update-content',
        }),
        contentId: contentId
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
            const contentId = parseInt(event.params.id);		
            const { error: supabaseError } = await event.locals.supabase
                .from('contents')
                .update({
                    ...data,
                    user_id: userId,
                    file: filePath})
                .eq('id', contentId);

            if (supabaseError) {
                setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                return fail(500, withFiles({ message: supabaseError.message, form }));
            }
            
            // Check if the content is approved before embedding
            const { data: moderationStatus, error: moderationError } = await event.locals.supabase
                .from('latest_contents_moderation') // assumes you use this view
                .select('status')
                .eq('content_id', contentId)
                .single();

            if (moderationError) {
	            console.error('Error checking moderation status for thread', moderationError.message);
            }
            else if (moderationStatus.status === 'approved') {
                // Update knowledge in chatbot
                const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

                const embeddingText = `[Content] ${form.data.title}
                    Tags: ${form.data.tags.join(', ')}
                    Description: ${form.data.description}
                    Link: /content/${contentId}`;

                try {
                    const embeddingResponse = await openai.embeddings.create({
                        model: 'text-embedding-ada-002',
                        input: embeddingText
                    });

                    const embedding = embeddingResponse.data[0].embedding;

                    await event.locals.supabase.from('documents').upsert({
                        content: embeddingText,
                        embedding: embedding,
                        type: 'content',
                        source_id: contentId
                    } as any, { onConflict: 'type, source_id' });
                } catch (e) {
                    console.error('Embedding error:', e);
                }
            }
            return redirect(303, `/contents/${contentId}`);
        }),
};
