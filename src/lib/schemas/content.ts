import { z } from 'zod';

export const createContentSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
    .max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
    .max(5000, { message: 'A descrição deve ter no máximo 5000 caracteres' }),
  fileUrl: z.string().nullish(),
  file: z.instanceof(File, { message: 'É necessário selecionar um ficheiro antes de submeter' }),
  mime_type: z.string().nullish(),
  tags: z
    .array(z.string())
    .refine((tags) => tags.length <= 4, {
      message: 'Deve ter no máximo 4 etiquetas',
    })
    .refine((tags) => new Set(tags).size === tags.length, 'As etiquetas devem ser únicas')
    .refine(
      (tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
      'Cada etiqueta deve ter entre 3 e 30 caracteres'
    ),
});

export type CreateContentSchema = typeof createContentSchema;

export const editContentSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
    .max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
  description: z
    .string()
    .min(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
    .max(5000, { message: 'A descrição deve ter no máximo 5000 caracteres' }),
  fileUrl: z.string().nullish(),
  file: z.instanceof(File).nullish(),
  mime_type: z.string().nullish(),
  tags: z
    .array(z.string())
    .refine((tags) => tags.length <= 4, {
      message: 'Deve ter no máximo 4 etiquetas',
    })
    .refine((tags) => new Set(tags).size === tags.length, 'As etiquetas devem ser únicas')
    .refine(
      (tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
      'Cada etiqueta deve ter entre 3 e 30 caracteres'
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
