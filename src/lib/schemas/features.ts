import { z } from 'zod';

export const updateFeaturesSchema = z.object({
	guides: z.boolean(),
	events: z.boolean(),
	map: z.boolean(),
	docs: z.boolean(),
	forum_threads: z.boolean(),
	contents: z.boolean(),
	users: z.boolean(),
});

export type UpdateFeaturesSchema = typeof updateFeaturesSchema;
