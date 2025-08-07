import { z } from 'zod';

export const createConnectionsSchema = z.object({
	selectedItems: z.array(
		z.object({
			id: z.number(),
			type: z.enum(['content', 'event', 'thread']),
		})
	),
});

export type CreateConnectionsSchema = typeof createConnectionsSchema;