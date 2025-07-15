import { deleteEventSchema, toggleEventInterestSchema, voteOnScheduleSchema, removeVotesSchema } from '@/schemas/event';
import type { EventWithAuthor, EventVote, ModerationInfo, ContentWithCounter } from '@/types/types';
import { handleFormAction } from '@/utils';
import { error, fail, redirect } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const load = async (event) => {
	const { user } = await event.locals.safeGetSession();
	const eventId = parseInt(event.params.id);

	async function getEvent(id: number): Promise<EventWithAuthor> {
		const { data: eventData, error: eventError } = await event.locals.supabase
			.from('events_view')
			.select('*, author:profiles_view!inner(*)')
			.eq('id', id)
			.single();

		if (eventError) {
			const errorMessage = 'Error fetching event, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}
		const image = event.locals.supabase.storage.from('events').getPublicUrl(eventData.image);
		return { ...eventData, image: image.data.publicUrl };
	}

	async function getEventModeration(id: number): Promise<ModerationInfo[]> {
		const { data: moderation, error: moderationError } = await event.locals.supabase
			.from('events_moderation')
			.select('*')
			.eq('event_id', id)
			.order('inserted_at', { ascending: false });

		if (moderationError) {
			const errorMessage = 'Error fetching moderation, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		return moderation;
	}

	async function getVotingOptions(id: number) {
		const { data: votingOptions, error: votingError } = await event.locals.supabase
			.from('events_voting_options')
			.select('*')
			.eq('event_id', id);

		if (votingError) {
			const errorMessage = 'Error fetching voting options, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}
	return votingOptions;
	}

	async function getUserVotes(userId: string, eventId: number): Promise<EventVote[]> {
		const { data: userVotes, error } = await event.locals.supabase
			.from('events_votes')
			.select('*')
			.eq('user_id', userId)
			.eq('event_id', eventId);

		if (error) {
			console.error('Failed to fetch user votes:', error);
			return [];
		}

		return userVotes;
	}

	async function getInterestCount(id: string): Promise<{ count: number; userInterested: boolean }> {
		const { data: interested, error: interestedError } = await event.locals.supabase
			.rpc('get_event_interest_count', {
				event_id: parseInt(id),
				user_id: user?.id,
			})
			.single();

		if (interestedError) {
			const errorMessage = 'Error fetching interest count, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}
		return { count: interested.count, userInterested: interested.has_interest };
	}

	async function getConnectedContents(eventId: number): Promise<ContentWithCounter[]> {
		const { data: connectedContents, error: connectedContentsError } = await await event.locals.supabase
			.from('event_contents')
			.select('content:contents_view(*)')
			.eq('event_id', eventId);

		if (connectedContentsError) {
			const errorMessage = 'Error fetching connected contents, please try again later.';
			setFlash({ type: 'error', message: errorMessage }, event.cookies);
			return error(500, errorMessage);
		}

		return connectedContents.map((row) => row.content);
	}

	let hasVoted = false;

	if (user?.id) {
		const userVotes = await getUserVotes(user.id, eventId);
		hasVoted = userVotes.length > 0;
	}
	
	const interestCount = await getInterestCount(event.params.id);

	return {
		event: await getEvent(eventId),
		moderation: await getEventModeration(eventId),
		votingOptions: await getVotingOptions(eventId),
		hasVoted: hasVoted,
		interestCount: interestCount.count,
		connectedContents: await getConnectedContents(eventId),
		deleteForm: await superValidate(zod(deleteEventSchema), {
			id: 'delete-event',
		}),
		toggleInterestForm: await superValidate(
			{ value: interestCount.userInterested },
			zod(toggleEventInterestSchema),
			{
				id: 'toggle-event-interest',
			}
		),
		voteOnScheduleForm: await superValidate(zod(voteOnScheduleSchema), {
			id: 'vote-on-schedule',
		}),
		removeVotesForm: await superValidate(zod(removeVotesSchema), { id: 'remove-votes' }),
	};
};

export const actions = {
	delete: async (event) =>
		handleFormAction(event, deleteEventSchema, 'delete-event', async (event, userId, form) => {
			const { error: supabaseError } = await event.locals.supabase
				.from('events')
				.delete()
				.eq('id', form.data.id);

			if (supabaseError) {
				setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
				return fail(500, { message: supabaseError.message, form });
			}

			return redirect(303, '/events');
		}),
	toggleInterest: async (event) =>
		handleFormAction(
			event,
			toggleEventInterestSchema,
			'toggle-event-interest',
			async (event, userId, form) => {
				if (form.data.value) {
					const { error: supabaseError } = await event.locals.supabase
						.from('events_interested')
						.insert([
							{
								event_id: parseInt(event.params.id),
								user_id: userId,
							},
						]);

					if (supabaseError) {
						setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
						return fail(500, { message: supabaseError.message, form });
					}
				} else {
					const { error: supabaseError } = await event.locals.supabase
						.from('events_interested')
						.delete()
						.eq('event_id', parseInt(event.params.id))
						.eq('user_id', userId);

					if (supabaseError) {
						setFlash({ type: 'error', message: supabaseError.message }, event.cookies);
						return fail(500, { message: supabaseError.message, form });
					}
				}

				return { form };
			}
		),
	voteOnSchedule: async (event) =>
		handleFormAction(
			event,
			voteOnScheduleSchema,
			'vote-on-schedule',
			async (event, userId, form) => {
				const eventId = parseInt(event.params.id);
				const optionIds = form.data.votes_ids;

				console.log("votes:", optionIds);

				// Get all option IDs belonging to this event
				const { data: eventOptionIds, error: optionIdsError } = await event.locals.supabase
					.from('events_voting_options')
					.select('id')
					.eq('event_id', eventId);

				if (optionIdsError) {
					setFlash({ type: 'error', message: optionIdsError.message }, event.cookies);
					return fail(500, { message: optionIdsError.message, form });
				}

				const allOptionIds = eventOptionIds.map((opt) => opt.id);

				// Delete all previous votes for this event by the user
				const { error: deleteError } = await event.locals.supabase
					.from('events_votes')
					.delete()
					.eq('user_id', userId)
					.in('voting_option_id', allOptionIds);

				if (deleteError) {
					setFlash({ type: 'error', message: deleteError.message }, event.cookies);
					return fail(500, { message: deleteError.message, form });
				}

				// Insert new votes
				const { error: insertError } = await event.locals.supabase
					.from('events_votes')
					.insert(
						optionIds.map((id) => ({
							user_id: userId,
							voting_option_id: id,
							event_id: eventId,
						}))
					);

				if (insertError) {
					setFlash({ type: 'error', message: insertError.message }, event.cookies);
					return fail(500, { message: insertError.message, form });
				}

				setFlash({ type: 'success', message: 'Your vote has been recorded.' }, event.cookies);
				return { form };
			}
		),
	removeVotes: (event) =>
		handleFormAction(event, removeVotesSchema, 'remove-votes', async (event, userId, form) => {
			const eventId = parseInt(event.params.id);

			const { error } = await event.locals.supabase
				.from('events_votes')
				.delete()
				.eq('user_id', userId)
				.eq('event_id', eventId);

			if (error) {
				setFlash({ type: 'error', message: 'Could not remove vote.' }, event.cookies);
				return fail(500, { message: error.message });
			}

			setFlash({ type: 'success', message: 'Your vote has been removed.' }, event.cookies);
			return { form };
			}
		),
};
