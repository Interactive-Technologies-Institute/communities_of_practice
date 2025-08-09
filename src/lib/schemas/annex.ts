import { z } from 'zod';

export const createAnnexesSchema = z.object({
	selectedItems: z.array(
		z.object({
			id: z.number(),
			type: z.enum(['content', 'event', 'thread']),
		})
	),
});

export type CreateAnnexesSchema = typeof createAnnexesSchema;