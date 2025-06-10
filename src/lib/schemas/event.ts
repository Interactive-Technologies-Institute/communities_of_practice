import { z } from 'zod';

export const createEventSchema = z
	.object({
		title: z
			.string()
			.min(5, { message: 'Title must be at least 5 characters' })
			.max(100, { message: 'Title must be less than 100 characters' }),
		description: z
			.string()
			.min(5, { message: 'Description must be at least 5 characters' })
			.max(500, { message: 'Description must be less than 500 characters' }),
		imageUrl: z.string().nullish(),
		image: z.instanceof(File).nullish(),
		tags: z
			.array(z.string())
			.refine((tags) => tags.length <= 5, {
				message: 'Must be less than 5 tags',
			})
			.refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique')
			.refine((tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 20), 'Tags must be between 3 and 20 characters'),
		date: z.string().refine((date) => date, { message: 'Date is required' }),
		start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'Start time must be in HH:MM format',
		}),
		end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'End time must be in HH:MM format',
		}),
		location: z.string().min(1, { message: 'Location is required' }),
	})
	.refine((data) => data.image || data.imageUrl, {
		message: 'Image is required',
		path: ['image'],
	})
	.refine((data) => {
		if (!data.start_time || !data.end_time) return true;
		return data.start_time < data.end_time;
	}, {
		message: 'End time must be later than start time',
		path: ['end_time'],
	});

export type CreateEventSchema = typeof createEventSchema;

export const deleteEventSchema = z.object({
	id: z.number(),
});

export type DeleteEventSchema = typeof deleteEventSchema;

export const toggleEventInterestSchema = z.object({
	value: z.boolean(),
});

export type ToggleEventInterestSchema = typeof toggleEventInterestSchema;
