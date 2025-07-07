import { arrayQueryParam, stringQueryParam } from '@/utils';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import type { Content } from '@/types/types';

export const load = async (event) => {
    const search = stringQueryParam().decode(event.url.searchParams.get('s'));
    const fileTypes = arrayQueryParam().decode(event.url.searchParams.get('fileTypes'));
    const tags = arrayQueryParam().decode(event.url.searchParams.get('tags'));
    const sortBy = stringQueryParam().decode(event.url.searchParams.get('sortBy'));
    const sortOrder = stringQueryParam().decode(event.url.searchParams.get('sortOrder'));

    async function getContents(): Promise<Content[]> {
        let query = event.locals.supabase
            .from('contents_view')
            .select('*')
            .order('moderation_status', { ascending: true });

        if (sortBy === 'date_inserted') {
            query = query.order('inserted_at', { ascending: sortOrder === 'asc' });
        } 
        else if (sortBy === 'title') {
			query = query.order('title', { ascending: sortOrder === 'asc' });
		}
        else {
            query = query.order('inserted_at', { ascending: false });
        }

        if (search?.trim()) {
            query = query.ilike('title', `%${search.trim()}%`);
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
                'Archive',
                'JSON',
                'Spreadsheet',
                'Word Doc',
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
    };
};
