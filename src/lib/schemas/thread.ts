import { z } from 'zod';

export const createThreadSchema = z
    .object({
        title: z
            .string()
            .min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
            .max(100, { message: 'O título deve ter no máximo 100 caracteres' }),

        content: z
            .string()
            .min(10, { message: 'O conteúdo deve ter no mínimo 10 caracteres' })
            .max(5000, { message: 'O conteúdo deve ter no máximo 5000 caracteres' }),
        imageUrl: z.string().nullish(),
        image: z.instanceof(File).nullish(),
        summary: z.string().nullish(),
        tags: z
            .array(z.string())
            .refine((tags) => tags.length <= 4, {
                message: 'Máximo de 4 etiquetas',
            })
            .refine((tags) => {
                return new Set(tags).size === tags.length;
            }, 'As etiquetas devem ser únicas')
            .refine((tags) => {
                return tags.every((tag) => tag.length >= 3 && tag.length <= 30);
            }, 'As etiquetas devem ter entre 3 e 30 caracteres'),
    });

export type CreateThreadSchema = typeof createThreadSchema;

export const deleteThreadSchema = z.object({
    id: z.number(),
});

export type DeleteThreadSchema = typeof deleteThreadSchema;

export const toggleThreadLikeSchema = z.object({
    value: z.boolean(),
});

export type ToggleThreadLikeSchema = typeof toggleThreadLikeSchema;