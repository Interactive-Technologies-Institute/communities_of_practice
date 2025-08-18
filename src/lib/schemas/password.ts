import { z } from 'zod';

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, { message: 'A palavra-passe atual é obrigatória' }),
		newPassword: z.string().min(8, { message: 'A nova palavra-passe deve ter no mínimo 8 caracteres' }),
		confirmNewPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "As palavras-passe não coincidem",
		path: ['confirmNewPassword'],
	});

export type UpdatePasswordSchema = typeof updatePasswordSchema;
