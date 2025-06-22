<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import {
		voteOnScheduleSchema,
		type VoteOnScheduleSchema,
		type RemoveVotesSchema
	} from '@/schemas/event';
	import { Button } from '@/components/ui/button';
	import type { EventWithAuthor } from '@/types/types';
	import dayjs from 'dayjs';

	export let event: EventWithAuthor;
	export let voteOnSchedule: SuperValidated<Infer<VoteOnScheduleSchema>>;
	export let removeVotes: SuperValidated<Infer<RemoveVotesSchema>>;
	export let votingOptions;
	export let hasVoted: boolean;

	const voteForm = superForm(voteOnSchedule, {
		validators: zodClient(voteOnScheduleSchema),
		taintedMessage: true,
		dataType: 'json'
	});

	const removeForm = superForm(removeVotes, {
		dataType: 'json',
		onResult: ({ result }) => {
			if (result.type === 'success') {
				hasVoted = false;
				$voteFormData.votes_ids = [];
			}
		}
	});

	const {
		form: voteFormData,
		enhance: enhanceVote,
		submitting: submittingVote
	} = voteForm;

	const {
		form: removeFormData,
		enhance: enhanceRemove,
		submitting: submittingRemove
	} = removeForm;

	let votingClosed = false;

	if (event.allow_voting && event.voting_end_date && event.voting_end_time) {
		const votingDeadline = dayjs(`${event.voting_end_date}T${event.voting_end_time}`);
		votingClosed = dayjs().isAfter(votingDeadline);
	}

	function toggleOption(id: number) {
		const list = $voteFormData.votes_ids;
		if (list.includes(id)) {
			$voteFormData.votes_ids = list.filter((x) => x !== id);
		} else {
			$voteFormData.votes_ids = [...list, id];
		}
	}
</script>
{#if votingClosed}
	<p class="text-green-700 font-semibold">Schedule votes are now closed.</p>
{:else}
	{#if hasVoted}
		<p class="text-green-700 font-semibold">You already voted to schedule this event.</p>

		<form method="POST" action="?/removeVotes" use:enhanceRemove>
			<Button type="submit" disabled={$submittingRemove}>
				{#if $submittingRemove}Removing...{/if}
				{#if !$submittingRemove}Remove My Vote{/if}
			</Button>
		</form>
	{:else}
		<form method="POST" action="?/voteOnSchedule" use:enhanceVote>
			<div class="space-y-2">
				{#each votingOptions as option}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							checked={$voteFormData.votes_ids.includes(option.id)}
							on:change={() => toggleOption(option.id)}
						/>
						<span>
							{dayjs(option.date).format('dddd, DD/MM/YYYY')}
						</span>
					</label>
				{/each}
			</div>
			<div class="pt-4">
				<Button type="submit" disabled={$submittingVote}>
					{#if $submittingVote}Submitting...{/if}
					{#if !$submittingVote}Submit Vote{/if}
				</Button>
			</div>
		</form>
	{/if}
{/if}
