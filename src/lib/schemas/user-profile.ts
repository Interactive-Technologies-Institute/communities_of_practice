import { z } from 'zod';

export const updateUserProfileSchema = z.object({
	display_name: z.string().min(1, { message: 'O nome de exibição é obrigatório' }),
	description: z.string().max(250, { message: 'A descrição deve ter no máximo 250 caracteres' }).nullish(),
	avatar: z.instanceof(File).nullish(),
	avatarUrl: z.string().nullish(),
    avatarPath: z.string().optional(),
    avatarReset: z.coerce.boolean().optional().default(false),

    date: z.union([z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
            z.literal(""),]).nullish(),
	profession: z.string().max(100, { message: 'A profissão deve ter no máximo 100 caracteres' }).nullish(),
	website: z.union([z.string().regex(/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/),
            z.literal(""),]).nullish(),
	gender: z.string().max(50, { message: 'O género deve ter no máximo 50 caracteres' }).nullish(),
	nationality: z.string().max(100).nullish(),

	interests: z
            .array(z.string())
            .refine((interests) => interests.length <= 6, {
                message: 'Deve ter no máximo 6 interesses',
            })
            .refine((interests) => {
                return new Set(interests).size === interests.length;
            }, 'Os interesses devem ser únicos')
            .refine((interests) => {
                return interests.every((interest) => interest.length >= 3 && interest.length <= 30);
            }, 'Cada interesse deve ter entre 3 e 30 caracteres').default([]),
	skills: z
            .array(z.string())
            .refine((skills) => skills.length <= 6, {
                message: 'Deve ter no máximo 6 competências',
            })
            .refine((skills) => {
                return new Set(skills).size === skills.length;
            }, 'As competências devem ser únicas')
            .refine((skills) => {
                return skills.every((skill) => skill.length >= 3 && skill.length <= 30);
            }, 'Cada competência deve ter entre 3 e 30 caracteres').default([]),
	education: z
            .array(z.string())
            .refine((education) => education.length <= 6, {
                message: 'Deve ter no máximo 6 experiências educativas',
            })
            .refine((education) => {
                return new Set(education).size === education.length;
            }, 'As experiências educativas devem ser únicas')
            .refine((education) => {
                return education.every((education_exp) => education_exp.length >= 3 && education_exp.length <= 30);
            }, 'Cada experiência educativa deve ter entre 3 e 30 caracteres').default([]),
	languages: z
            .array(z.string())
            .refine((languages) => languages.length <= 6, {
                message: 'Deve ter no máximo 6 línguas',
            })
            .refine((languages) => {
                return new Set(languages).size === languages.length;
            }, 'As línguas devem ser únicas')
            .refine((languages) => {
                return languages.every((language) => language.length >= 3 && language.length <= 30);
            }, 'Cada língua deve ter entre 3 e 30 caracteres').default([]),
});

export type UpdateUserProfileSchema = typeof updateUserProfileSchema;
