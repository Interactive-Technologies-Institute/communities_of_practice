import { z } from 'zod';

export const updateUserProfileSchema = z.object({
	display_name: z.string().min(1, { message: 'Display name is required' }),
	description: z.string().max(250, { message: 'Description must be less than 250 characters' }).nullish(),
	avatar: z.instanceof(File).nullish(),
	avatarUrl: z.string().nullish(),
    avatarPath: z.string().optional(),
    avatarReset: z.coerce.boolean().optional().default(false),


	date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Date must be in DD/MM/YYYY format' }).nullish(),
	profession: z.string().max(100, { message: 'Profession must be less than 100 characters' }).nullish(),
	website: z.string().regex(/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/,
    { message: 'Invalid website format' }).nullish(),
	gender: z.string().max(50, { message: 'Gender must be less than 50 characters' }).nullish(),
	nationality: z.string().max(100).nullish(),

	interests: z
            .array(z.string())
            .refine((interests) => interests.length <= 5, {
                message: 'Must be less than 5 interests',
            })
            .refine((interests) => {
                return new Set(interests).size === interests.length;
            }, 'Interests must be unique')
            .refine((interests) => {
                return interests.every((interest) => interest.length >= 3 && interest.length <= 30);
            }, 'Interests must be between 3 and 30 characters').default([]),
	skills: z
            .array(z.string())
            .refine((skills) => skills.length <= 5, {
                message: 'Must be less than 5 skills',
            })
            .refine((skills) => {
                return new Set(skills).size === skills.length;
            }, 'Skills must be unique')
            .refine((skills) => {
                return skills.every((skill) => skill.length >= 3 && skill.length <= 30);
            }, 'Skills must be between 3 and 30 characters').default([]),
	education_exps: z
            .array(z.string())
            .refine((education_exps) => education_exps.length <= 5, {
                message: 'Must be less than 5 educational experiences',
            })
            .refine((education_exps) => {
                return new Set(education_exps).size === education_exps.length;
            }, 'Educational experiences must be unique')
            .refine((education_exps) => {
                return education_exps.every((education_exp) => education_exp.length >= 3 && education_exp.length <= 30);
            }, 'Educational experiences must be between 3 and 30 characters').default([]),
	languages: z
            .array(z.string())
            .refine((languages) => languages.length <= 5, {
                message: 'Must be less than 5 languages',
            })
            .refine((languages) => {
                return new Set(languages).size === languages.length;
            }, 'Languages must be unique')
            .refine((languages) => {
                return languages.every((language) => language.length >= 3 && language.length <= 30);
            }, 'Languages must be between 3 and 30 characters').default([]),
});

export type UpdateUserProfileSchema = typeof updateUserProfileSchema;
