<script lang="ts">
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import {
		voteOnScheduleSchema,
		type VoteOnScheduleSchema,
		type RemoveVotesSchema
	} from '@/schemas/event';
	import { Button } from '@/components/ui/button';
	import type { EventVotingOption, VoteCount, EventWithAuthor } from '@/types/types';
	import dayjs from '$lib/dayjs';
	import VoteOptionItem from '@/components/vote-option-item.svelte';

	export let event: EventWithAuthor;
	export let voteOnSchedule: SuperValidated<Infer<VoteOnScheduleSchema>>;
	export let removeVotes: SuperValidated<Infer<RemoveVotesSchema>>;
	export let votingOptions: EventVotingOption[];
	export let userVoteIds: number[] = [];
	export let voteCounts: VoteCount[];

	const voteForm = superForm(voteOnSchedule, {
		validators: zodClient(voteOnScheduleSchema),
		taintedMessage: true,
		dataType: 'json'
	});

	$: hasVoted = userVoteIds.length > 0;

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

	let selectedItems = $voteFormData.votes_ids;
	$: $voteFormData.votes_ids = selectedItems;

	$: votesByOption = new Map<number, number>(
		(voteCounts ?? []).map((vc) => [vc.voting_option_id, vc.vote_count])
	);
</script>
{#if votingClosed}
	<p class="text-green-700 font-semibold">A votação do horário está encerrada.</p>
{:else}
<p class="text-green-700 font-semibold">Votação encerra {dayjs(`${event.voting_end_date}T${event.voting_end_time}`).format('DD/MM/YYYY [às] HH:mm')}</p>
	{#if hasVoted}
		<div class="space-y-2">
				{#each votingOptions as option}
					<VoteOptionItem option={option} votes={votesByOption.get(option.id) ?? 0} hasVoted userVoted={userVoteIds.includes(option.id)} bind:selectedItems/>
				{/each}
			</div>
		<form method="POST" action="?/removeVotes" use:enhanceRemove>
			<Button type="submit" disabled={$submittingRemove}>
				{#if $submittingRemove}A remover...{/if}
				{#if !$submittingRemove}Remover voto{/if}
			</Button>
		</form>
	{:else}
		<form method="POST" action="?/voteOnSchedule" use:enhanceVote>
			<div class="space-y-2">
				{#each votingOptions as option}
					<VoteOptionItem option={option} votes={votesByOption.get(option.id) ?? 0} hasVoted={hasVoted} bind:selectedItems/>
				{/each}
			</div>
			<div class="pt-4">
				<Button type="submit" disabled={$submittingVote}>
					{#if $submittingVote}A submeter...{/if}
					{#if !$submittingVote}Submeter voto{/if}
				</Button>
			</div>
		</form>
	{/if}
{/if}
