import { z } from 'zod';

export const updateUserTypesSchema = z.object({
	types: z
		.array(z.string().min(4, { message: 'O tipo deve ter no mínimo 4 caracteres' }))
		.min(1, { message: 'É necessário pelo menos um tipo' }),
	default: z.string(),
});

export type UpdateUserTypesSchema = typeof updateUserTypesSchema;
