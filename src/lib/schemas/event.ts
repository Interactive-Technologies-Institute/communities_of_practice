import { z } from 'zod';

export const votingOptionSchema = z
	.object({
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida'),
		start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'A hora de início deve estar no formato HH:MM',
		}),
		end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'A hora de fim deve estar no formato HH:MM',
		}),
	})
	.refine((opt) => opt.start_time < opt.end_time, {
		message: 'A hora de fim deve ser posterior à hora de início',
		path: ['end_time'],
	});

export const createEventSchema = z
	.object({
		title: z
			.string()
			.min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
			.max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
		description: z
			.string()
			.min(5, { message: 'A descrição deve ter no mínimo 5 caracteres' })
			.max(5000, { message: 'A descrição deve ter no máximo 5000 caracteres' }),
		imageUrl: z.string().nullish(),
		image: z.instanceof(File).nullish(),
		tags: z
			.array(z.string())
			.refine((tags) => tags.length <= 4, {
				message: 'Deve ter no máximo 4 etiquetas',
			})
			.refine((tags) => new Set(tags).size === tags.length, 'As etiquetas devem ser únicas')
			.refine((tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30), 'Cada etiqueta deve ter entre 3 e 30 caracteres'),
		location: z.string()
					.min(1, { message: 'A localização é obrigatória' })
					.max(90, { message: 'A localização deve ter no máximo 90 caracteres' }),
		allow_voting: z.boolean(),
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida').nullish(),
		start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'A hora de início deve estar no formato HH:MM',
		}).nullish(),
		end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'A hora de fim deve estar no formato HH:MM',
		}).nullish(),
		voting_options: z.array(votingOptionSchema).default([]),
		voting_end_date: z.string().nullish().refine((val) => !val || !isNaN(Date.parse(val)), 'Data limite de votação inválida'),
		voting_end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
			message: 'A hora limite de votação deve estar no formato HH:MM',
		}).nullish(),
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time && !!data.end_time && data.start_time < data.end_time;
		}
		return true;
	}, {
		message: 'A hora de fim deve ser posterior à hora de início',
		path: ['end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting || !data.voting_end_date) return true;

		const deadlineDate = new Date(data.voting_end_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return deadlineDate >= today;
	}, {
		message: 'A data limite de votação deve ser hoje ou depois',
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
		message: 'A hora limite da votação deve ser no futuro',
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
		message: 'As opções de votação devem ser únicas',
		path: ['voting_options'],
	})

	.refine((data) => {
		if (data.allow_voting) {
			return data.voting_options.length >= 2;
		}
		return true;
	}, {
		message: 'Deve fornecer pelo menos duas opções de votação',
		path: ['voting_options'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.date;
		}
		return true;
	}, {
		message: 'A data é obrigatória',
		path: ['date'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time;
		}
		return true;
	}, {
		message: 'A hora de início é obrigatória',
		path: ['start_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.end_time;
		}
		return true;
	}, {
		message: 'A hora de fim é obrigatória',
		path: ['end_time'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_date;
		}
		return true;
	}, {
		message: 'A data limite de votação é obrigatória',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_time;
		}
		return true;
	}, {
		message: 'A hora limite de votação é obrigatória',
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
		message: 'A data limite de votação deve ser anterior ou coincidir com as datas das opções de votação',
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
		message: 'A hora limite da votação deve ser anterior às horas de início das opções de votação',
		path: ['voting_end_time'],
	});

export type CreateEventSchema = typeof createEventSchema;

export const editEventSchema = z
	.object({
		title: z
			.string()
			.min(5, { message: 'O título deve ter no mínimo 5 caracteres' })
			.max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
		description: z
			.string()
			.min(5, { message: 'A descrição deve ter no mínimo 5 caracteres' })
			.max(5000, { message: 'A descrição deve ter no máximo 5000 caracteres' }),
		imageUrl: z.string().nullish(),
		image: z.instanceof(File).nullish(),
		tags: z
			.array(z.string())
			.refine((tags) => tags.length <= 4, {
				message: 'Deve ter no máximo 4 etiquetas',
			})
			.refine((tags) => new Set(tags).size === tags.length, 'As etiquetas devem ser únicas')
			.refine(
				(tags) => tags.every((tag) => tag.length >= 3 && tag.length <= 30),
				'As etiquetas devem ter entre 3 e 30 caracteres'
			),
		location: z.string().min(1, { message: 'A localização é obrigatória' })
				.max(90, { message: 'A localização deve ter no máximo 90 caracteres' }),
		recording_link: z.string().nullish(),
		transcription: z.string().nullish(),
		summary: z.string().nullish(),
		allow_voting: z.boolean(),
		date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Data inválida').nullish(),
		start_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'A hora de início deve estar no formato HH:MM',
			})
			.nullish(),
		end_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'A hora de fim deve estar no formato HH:MM',
			})
			.nullish(),
		voting_options: z.array(votingOptionSchema).default([]),
		voting_end_date: z
			.string()
			.nullish()
			.refine((val) => !val || !isNaN(Date.parse(val)), 'Data limite de votação inválida'),
		voting_end_time: z
			.string()
			.regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
				message: 'A hora limite de votação deve estar no formato HH:MM',
			})
			.nullish(),
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time && !!data.end_time && data.start_time < data.end_time;
		}
		return true;
	}, {
		message: 'A hora de fim deve ser posterior à hora de início',
		path: ['end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.date;
		}
		return true;
	}, {
		message: 'A data é obrigatória',
		path: ['date'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.start_time;
		}
		return true;
	}, {
		message: 'A hora de início é obrigatória',
		path: ['start_time'],
	})
	.refine((data) => {
		if (!data.allow_voting) {
			return !!data.end_time;
		}
		return true;
	}, {
		message: 'A hora de fim é obrigatória',
		path: ['end_time'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_date;
		}
		return true;
	}, {
		message: 'A data limite de votação é obrigatória',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (data.allow_voting) {
			return !!data.voting_end_time;
		}
		return true;
	}, {
		message: 'A hora limite de votação é obrigatória',
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
		message: 'A data limite de votação deve ser anterior ou coincidir com as datas das opções de votação',
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
		message: 'A hora limite da votação deve ser anterior às horas de início das opções de votação',
		path: ['voting_end_time'],
	})
	.refine((data) => {
		if (!data.allow_voting || data.date || !data.voting_end_date) return true;

		const deadlineDate = new Date(data.voting_end_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return deadlineDate >= today;
	}, {
		message: 'A data limite de votação já passou e nenhuma data foi definida',
		path: ['voting_end_date'],
	})
	.refine((data) => {
		if (!data.allow_voting || data.date || !data.voting_end_date || !data.voting_end_time) return true;

		const deadline = new Date(`${data.voting_end_date}T${data.voting_end_time}`);
		return deadline > new Date();
	}, {
		message: 'A hora limite de votação já passou e nenhuma data foi definida',
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

