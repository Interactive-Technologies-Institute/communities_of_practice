import { z } from 'zod';

export const createGuideSchema = z
	.object({
		title: z
			.string()
			.min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
			.max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
		description: z
			.string()
			.min(5, { message: 'A descrição deve ter no mínimo 5 caracteres' })
			.max(500, { message: 'A descrição deve ter no máximo 500 caracteres' }),
		imageUrl: z.string().nullish(),
		image: z.instanceof(File).nullish(),
		tags: z
			.array(z.string())
			.refine((tags) => tags.length <= 4, {
				message: 'Deve ter no máximo 4 etiquetas',
			})
			.refine((tags) => {
				return new Set(tags).size === tags.length;
			}, 'As etiquetas devem ser únicas')
			.refine((tags) => {
				return tags.every((tag) => tag.length >= 3 && tag.length <= 30);
			}, 'As etiquetas devem ter entre 3 e 30 caracteres'),
		difficulty: z.enum(['easy', 'medium', 'hard']),
		duration: z.enum(['short', 'medium', 'long']),
		steps: z
			.array(
				z
					.object({
						title: z
							.string()
							.min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
							.max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
						description: z
							.string()
							.min(5, { message: 'A descrição deve ter no mínimo 5 caracteres' })
							.max(500, { message: 'A descrição deve ter no máximo 500 caracteres' }),
						imageUrl: z.string().nullish(),
						image: z.instanceof(File).nullish(),
					})
					.refine((data) => data.image || data.imageUrl, {
						message: 'A imagem é obrigatória',
						path: ['image'],
					})
			)
			.min(3, { message: 'São necessários pelo menos 3 passos' })
			.default([
				{
					title: '',
					description: '',
				},
				{
					title: '',
					description: '',
				},
				{
					title: '',
					description: '',
				},
			]),
	})
	.refine((data) => data.image || data.imageUrl, {
		message: 'A imagem é obrigatória',
		path: ['image'],
	});

export type CreateGuideSchema = typeof createGuideSchema;

export const deleteGuideSchema = z.object({
	id: z.number(),
});

export type DeleteGuideSchema = typeof deleteGuideSchema;

export const toggleGuideUsefulSchema = z.object({
	value: z.boolean(),
});

export type ToggleGuideUsefulSchema = typeof toggleGuideUsefulSchema;

export const toggleGuideBookmarkSchema = z.object({
	value: z.boolean(),
});

export type ToggleGuideBookmarkSchema = typeof toggleGuideBookmarkSchema;
