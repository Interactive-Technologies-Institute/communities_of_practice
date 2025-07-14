import { z } from 'zod';

export const createEventConnectionsSchema = z
    .object({
        contentIds: z.array(z.number()).default([]),
    });

export type CreateEventConnectionsSchema = typeof createEventConnectionsSchema;

export const createThreadConnectionsSchema = z
    .object({
        contentIds: z.array(z.number()).default([]),
        eventIds: z.array(z.number()).default([]),
    });

export type CreateThreadConnectionsSchema = typeof createThreadConnectionsSchema;