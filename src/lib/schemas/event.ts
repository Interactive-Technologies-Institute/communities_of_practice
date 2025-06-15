import { z } from 'zod';

export const votingOptionSchema = z
	.object({
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
		start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'Start time must be in HH:MM format',
		}),
		end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'End time must be in HH:MM format',
		}),
	})
	.refine((opt) => opt.start_time < opt.end_time, {
		message: 'End time must be after start time',
		path: ['end_time'],
	});

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
		location: z.string().min(1, { message: 'Location is required' }),
		allow_voting: z.boolean(),
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').nullish(),
		start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'Start time must be in HH:MM format',
		}).nullish(),
		end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'End time must be in HH:MM format',
		}).nullish(),
		voting_options: z.array(votingOptionSchema).default([]),
		voting_end_date: z.string().nullish().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid vote end date'),
		voting_end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'End time must be in HH:MM format',
		}).nullish(),
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
	})
	.refine((data) => {
		if (!data.voting_end_date || !data.voting_end_time) return true;
		const deadline = new Date(`${data.voting_end_date}T${data.voting_end_time}`);
		return deadline > new Date();
	}, {
		message: 'Voting deadline must be in the future',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return data.voting_options && data.voting_options.length > 1;
		} else {
			return data.date && data.start_time && data.end_time;
		}
	}, {
		message: 'You must either provide a date and time or at least two voting options',
		path: ['voting_options'],
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
