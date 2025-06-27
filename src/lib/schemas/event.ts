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
			.refine((tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30), 'Tags must be between 3 and 30 characters'),
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
		voting_end_date: z.string().nullish().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid vote deadline date'),
		voting_end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'End time must be in HH:MM format',
		}).nullish(),
	})
	.refine((data) => data.image || data.imageUrl, {
		message: 'Image is required',
		path: ['image'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time && !!data.end_time && data.start_time < data.end_time;
		}
		return true;
	}, {
		message: 'End time must be later than start time',
		path: ['end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting || !data.voting_end_date) return true;

		const deadlineDate = new Date(data.voting_end_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return deadlineDate >= today;
	}, {
		message: 'Voting deadline date must be today or later',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (!data.allow_voting || !data.voting_end_date || !data.voting_end_time) return true;

		const now = new Date();
		const todayStr = now.toISOString().slice(0, 10); // 'YYYY-MM-DD'

		if (data.voting_end_date === todayStr) {
			const nowTimeStr = now.toTimeString().slice(0, 5); // 'HH:MM'
			return data.voting_end_time > nowTimeStr;
		}

		return true;
	}, {
		message: 'The voting deadline time must be in the future',
		path: ['voting_end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) return true;

		const seen = new Set<string>();

		for (const opt of data.voting_options) {
			if (!opt.date || !opt.start_time || !opt.end_time) continue;

			const key = `${opt.date}-${opt.start_time}-${opt.end_time}`;
			if (seen.has(key)) return false;
			seen.add(key);
		}

		return true;
	}, {
		message: 'Voting options must be unique',
		path: ['voting_options'],
	})

	.refine((data) => {
		if (data.allow_voting) {
			return data.voting_options.length >= 2;
		}
		return true;
	}, {
		message: 'You must provide at least two voting options',
		path: ['voting_options'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.date;
		}
		return true;
	}, {
		message: 'Date is required',
		path: ['date'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time;
		}
		return true;
	}, {
		message: 'Start time is required',
		path: ['start_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.end_time;
		}
		return true;
	}, {
		message: 'End time is required',
		path: ['end_time'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_date;
		}
		return true;
	}, {
		message: 'Voting deadline date is required',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_time;
		}
		return true;
	}, {
		message: 'Voting end time is required',
		path: ['voting_end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) return true;

		const deadlineDate = data.voting_end_date;
		if (!deadlineDate) return true;

		return data.voting_options.every((opt) => {
			if (!opt.date) return true;
			return opt.date >= deadlineDate;
		});
	}, {
		message: 'Voting deadline date must be before or on the dates of voting options',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (!data.allow_voting) return true;

		const deadlineDate = data.voting_end_date;
		const deadlineTime = data.voting_end_time;

		if (!deadlineDate || !deadlineTime) return true;

		return data.voting_options.every((opt) => {
			if (!opt.date || !opt.start_time) return true;
			if (opt.date !== deadlineDate) return true;

			return opt.start_time > deadlineTime;
		});
	}, {
		message: 'Voting end time must be before voting options start times',
		path: ['voting_end_time'],
	});

export type CreateEventSchema = typeof createEventSchema;

export const editEventSchema = z
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
			.refine(
				(tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
				'Tags must be between 3 and 30 characters'
			),
		location: z.string().min(1, { message: 'Location is required' }),
		allow_voting: z.boolean(),
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').nullish(),
		start_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'Start time must be in HH:MM format',
			})
			.nullish(),
		end_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'End time must be in HH:MM format',
			})
			.nullish(),
		voting_options: z.array(votingOptionSchema).default([]),
		voting_end_date: z
			.string()
			.nullish()
			.refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid vote deadline date'),
		voting_end_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'End time must be in HH:MM format',
			})
			.nullish(),
	})
	.refine((data) => data.image || data.imageUrl, {
		message: 'Image is required',
		path: ['image'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time && !!data.end_time && data.start_time < data.end_time;
		}
		return true;
	}, {
		message: 'End time must be later than start time',
		path: ['end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.date;
		}
		return true;
	}, {
		message: 'Date is required',
		path: ['date'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time;
		}
		return true;
	}, {
		message: 'Start time is required',
		path: ['start_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.end_time;
		}
		return true;
	}, {
		message: 'End time is required',
		path: ['end_time'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_date;
		}
		return true;
	}, {
		message: 'Voting deadline date is required',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_time;
		}
		return true;
	}, {
		message: 'Voting end time is required',
		path: ['voting_end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) return true;

		const deadlineDate = data.voting_end_date;
		if (!deadlineDate) return true;

		return data.voting_options.every((opt) => {
			if (!opt.date) return true;
			return opt.date >= deadlineDate;
		});
	}, {
		message: 'Voting deadline date must be before or on the dates of voting options',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (!data.allow_voting) return true;

		const deadlineDate = data.voting_end_date;
		const deadlineTime = data.voting_end_time;

		if (!deadlineDate || !deadlineTime) return true;

		return data.voting_options.every((opt) => {
			if (!opt.date || !opt.start_time) return true;
			if (opt.date !== deadlineDate) return true;

			return opt.start_time > deadlineTime;
		});
	}, {
		message: 'Voting end time must be before voting options start times',
		path: ['voting_end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting || data.date || !data.voting_end_date) return true;

		const deadlineDate = new Date(data.voting_end_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return deadlineDate >= today;
	}, {
		message: 'Voting deadline date has passed and no date was set.',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (!data.allow_voting || data.date || !data.voting_end_date || !data.voting_end_time) return true;

		const deadline = new Date(`${data.voting_end_date}T${data.voting_end_time}`);
		return deadline > new Date();
	}, {
		message: 'Voting deadline time has passed and no date was set.',
		path: ['voting_end_time'],
	});

export type EditEventSchema = typeof editEventSchema;

export const deleteEventSchema = z.object({
	id: z.number(),
});

export type DeleteEventSchema = typeof deleteEventSchema;

export const toggleEventInterestSchema = z.object({
	value: z.boolean(),
});

export type ToggleEventInterestSchema = typeof toggleEventInterestSchema;

export const voteOnScheduleSchema = z.object({
	votes_ids: z.array(z.number()).default([]),
});

export type VoteOnScheduleSchema = typeof voteOnScheduleSchema;

export const removeVotesSchema = z.object({});

export type RemoveVotesSchema = typeof removeVotesSchema;

