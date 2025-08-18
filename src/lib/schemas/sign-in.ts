import { z } from 'zod';

export const signInSchema = z.object({
	email: z.string().email({ message: 'Por favor, introduza um endereço de email válido' }),
	password: z.string().min(1, { message: 'A palavra-passe é obrigatória' }),
});

export type SignInSchema = typeof signInSchema;
