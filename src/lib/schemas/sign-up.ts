import { z } from 'zod';

export const signUpSchema = z
	.object({
		displayName: z
			.string()
			.min(3, { message: 'O nome de exibição deve ter no mínimo 3 caracteres' })
			.max(25, { message: 'O nome de exibição deve ter no máximo 25 caracteres' }),
		email: z.string().email({ message: 'Por favor, introduza um endereço de email válido' }),
		password: z.string().min(8, { message: 'A palavra-passe deve ter no mínimo 8 caracteres' }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As palavras-passe não coincidem',
		path: ['confirmPassword'],
	});

export type SignUpSchema = typeof signUpSchema;
