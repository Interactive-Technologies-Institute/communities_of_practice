import { z } from 'zod';

export const updateBrandingSchema = z.object({
	name: z
		.string()
		.min(1, { message: 'O nome é obrigatório' })
		.max(25, { message: 'O nome deve ter no máximo 25 caracteres' }),
	slogan: z
		.string()
		.min(1, { message: 'O slogan é obrigatório' })
		.max(50, { message: 'O slogan deve ter no máximo 50 caracteres' }),
	color_theme: z.string(),
	radius: z.number(),
	logoUrl: z.string().nullish(),
	logo: z.instanceof(File).nullish(),
});

export type UpdateBrandingSchema = typeof updateBrandingSchema;
