import { z } from 'zod';

export const createThreadCommentSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'O comentário deve ter no mínimo 1 carácter' })
        .max(5000, { message: 'O comentário deve ter no máximo 5000 caracteres' }),
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
        .min(1, { message: 'O comentário deve ter no mínimo 1 carácter' })
        .max(5000, { message: 'O comentário deve ter no máximo 5000 caracteres' }),
});

export type UpdateThreadCommentSchema = typeof updateThreadCommentSchema;