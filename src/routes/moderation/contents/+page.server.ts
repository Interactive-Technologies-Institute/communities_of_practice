import { updateModerationInfoSchema } from '@/schemas/moderation-info.js';
import type { ContentWithModeration } from '@/types/types';
import { arrayQueryParam, handleFormAction, stringQueryParam, handleSignInRedirect } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

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

    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const fileTypes = arrayQueryParam().decode(event.url.searchParams.get('fileTypes'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getContents(): Promise<ContentWithModeration[]> {
        let query = event.locals.supabase
            .from('contents_view')
            .select('*, moderation:latest_contents_moderation!inner(status, inserted_at, comment)');
        
        if (sortBy === 'date_inserted') {
            query = query.order('inserted_at', { ascending: sortOrder === 'asc' });
        }
        else if (sortBy === 'downloads') {
            query = query.order('downloads_count', { ascending: sortOrder === 'asc' });
        } 
        else if (sortBy === 'title') {
			query = query.order('title', { ascending: sortOrder === 'asc' });
		}
        else {
            query = query.order('updated_at', { ascending: false });
        }
        
        if (search) {
            query = query.textSearch('fts', search, { config: 'simple', type: 'websearch' });
        }

        if (tags && tags.length) {
            query = query.overlaps('tags', tags);
        }

        if (fileTypes && fileTypes.length) {
            const validTypes = [
                'Image',
                'Video',
                'Audio',
                'PDF',
                'Text',
                'CSV',
                'Markdown',
                'Archive',
                'JSON',
                'Spreadsheet',
                'Word Doc',
                'Presentation',
                'File'
            ];
            const allValid = fileTypes.every((r) => validTypes.includes(r));
            if (allValid) {
                query = query.in('file_type', fileTypes); 
            }
        }

        const { data: contents, error: contentsError } = await query;

        if (contentsError) {
            const errorMessage = 'Error fetching contents, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        return contents;
    }

    async function getTags(): Promise<Map<string, number>> {
        const { data: tags, error: tagsError } = await event.locals.supabase
            .from('contents_tags')
            .select();

        if (tagsError) {
            const errorMessage = 'Error fetching tags, please try again later.';
            setFlash({ type: 'error', message: errorMessage }, event.cookies);
            return error(500, errorMessage);
        }

        const tagMap = new Map<string, number>();
        if (tags) {
            tags.forEach((tag) => {
                const { count, tag: tagName } = tag;
                if (count !== null && tagName !== null) {
                    tagMap.set(tagName, count);
                }
            });
        }

        return tagMap;
    }

    return {
        contents: await getContents(),
        tags: await getTags(),
        updateModerationForm: await superValidate(zod(updateModerationInfoSchema), {
            id: 'update-moderation',
        }),
    };
};

export const actions = {
    default: async (event) =>
        handleFormAction(
            event,
            updateModerationInfoSchema,
            'update-moderation',
            async (event, userId, form) => {
                const { error: supabaseError } = await event.locals.supabase
                    .from('contents_moderation')
                    .insert({
                        content_id: form.data.ref_id,
                        user_id: form.data.user_id,
                        status: form.data.status,
                        comment: form.data.comment,
                    });

                if (supabaseError) {
                    setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
                    return fail(500, { message: supabaseError.message, form });
                }

                // Add knowledge to chatbot if content is approved
                if (form.data.status === 'approved') {
					const { data: approvedContent, error: contentError } = await event.locals.supabase
						.from('contents')
						.select('id, title, tags, description')
						.eq('id', form.data.ref_id)
						.single();

					if (contentError || !approvedContent) {
						console.error('Could not fetch content for embedding:', contentError?.message);
					} else {
						const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

						const embeddingText = `[Content] ${approvedContent.title}
                            Tags: ${approvedContent.tags.join(', ')}
                            Description: ${approvedContent.description}
                            Link: /content/${approvedContent.id}`;

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
								source_id: approvedContent.id
							} as any, {
								onConflict: 'type, source_id'  // TODO: As any
							});
						} catch (e) {
							console.error('Embedding error (content approval):', e);
						}
					}
				}
                    

                return { form };
            }
        ),
};
