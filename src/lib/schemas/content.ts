import { z } from 'zod';

export const createContentSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(5000, { message: 'Description must be less than 5000 characters' }),
  fileUrl: z.string().nullish(),
  file: z.instanceof(File, { message: 'A file must be selected before submitting.' }),
  mime_type: z.string().nullish(),
  tags: z
    .array(z.string())
    .refine((tags) => tags.length <= 5, {
      message: 'Must be less than 5 tags',
    })
    .refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique')
    .refine(
      (tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
      'Tags must be between 3 and 30 characters'
    ),
});

export type CreateContentSchema = typeof createContentSchema;

export const editContentSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(5000, { message: 'Description must be less than 5000 characters' }),
  fileUrl: z.string().nullish(),
  file: z.instanceof(File).nullish(),
  mime_type: z.string().nullish(),
  tags: z
    .array(z.string())
    .refine((tags) => tags.length <= 5, {
      message: 'Must be less than 5 tags',
    })
    .refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique')
    .refine(
      (tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
      'Tags must be between 3 and 30 characters'
    ),
});

export type EditContentSchema = typeof editContentSchema;

export const deleteContentSchema = z.object({
  id: z.number(),
});

export type DeleteContentSchema = typeof deleteContentSchema;

export const downloadContentSchema = z.object({
  value: z.boolean(),
  file: z.string(),
});

export type DownloadContentSchema = typeof downloadContentSchema;
