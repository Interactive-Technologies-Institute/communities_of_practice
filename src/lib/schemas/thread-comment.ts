import { z } from 'zod';

export const createThreadCommentSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'Content must be at least 1 character' })
        .max(5000, { message: 'Content must be less than 5000 characters' }),
    parent_id: z
        .number()
        .optional()
        .nullable()
});

export type CreateThreadCommentSchema = typeof createThreadCommentSchema;

export const deleteThreadCommentSchema = z.object({
    id: z.number(),
});

export type DeleteThreadCommentSchema = typeof deleteThreadCommentSchema;

export const toggleThreadCommentLikeSchema = z.object({
    id: z.number(),
    value: z.boolean(),
});

export type ToggleThreadCommentLikeSchema = typeof toggleThreadCommentLikeSchema;

export const updateThreadCommentSchema = z.object({
	id: z.number(),
	content: z.string()
        .min(1, { message: 'Content must be at least 1 character' })
        .max(5000, { message: 'Content must be less than 5000 characters' }),
});

export type UpdateThreadCommentSchema = typeof updateThreadCommentSchema;