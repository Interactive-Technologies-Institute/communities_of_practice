import { z } from 'zod';

export const connectEventContentSchema = z
    .object({
        contentIds: z.array(z.number()).default([]),
    });

export type ConnectEventContentSchema = typeof connectEventContentSchema;