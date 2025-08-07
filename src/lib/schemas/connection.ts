import { z } from 'zod';

export const createEventConnectionsSchema = z
    .object({
        contentIds: z.array(z.number()).default([]),
    });

export type CreateEventConnectionsSchema = typeof createEventConnectionsSchema;

export const createThreadConnectionsSchema = z.object({
	selectedItems: z.array(
		z.object({
			id: z.number(),
			type: z.enum(['content', 'event', 'thread']),
		})
	),
});

export type CreateThreadConnectionsSchema = typeof createThreadConnectionsSchema;