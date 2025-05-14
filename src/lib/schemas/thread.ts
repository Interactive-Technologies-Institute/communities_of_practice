import { z } from 'zod';

export const createThreadSchema = z
    .object({
        title: z
            .string()
            .min(5, { message: 'Title must be at least 5 characters' })
            .max(100, { message: 'Title must be less than 100 characters' }),

        content: z
            .string()
            .min(10, { message: 'Content must be at least 10 characters' })
            .max(5000, { message: 'Content must be less than 5000 characters' }),
        imageUrl: z.string().nullish(),
        image: z.instanceof(File).nullish(),
        tags: z
            .array(z.string())
            .refine((tags) => tags.length <= 5, {
                message: 'Must be less than 5 tags',
            })
            .refine((tags) => {
                return new Set(tags).size === tags.length;
            }, 'Tags must be unique')
            .refine((tags) => {
                return tags.every((tag) => tag.length >= 3 && tag.length <= 20);
            }, 'Tags must be between 3 and 20 characters'),
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