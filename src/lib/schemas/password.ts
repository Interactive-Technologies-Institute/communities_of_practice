import { z } from 'zod';

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, { message: 'Current password is required' }),
		newPassword: z.string().min(8, { message: 'New password must be at least 8 characters' }),
		confirmNewPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords don't match",
		path: ['confirmNewPassword'],
	});

export type UpdatePasswordSchema = typeof updatePasswordSchema;
