<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Button } from '@/components/ui/button';
	import dayjs from 'dayjs';
	import { Calendar, MapPin, Pen, Tag, Trash } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EventDeleteDialog from './_components/event-delete-dialog.svelte';
	import EventInterestButton from './_components/event-interest-button.svelte';
	import EventVoteSchedule from './_components/event-vote-schedule.svelte';

	export let data;
	
	let openDeleteDialog = false;
</script>

<MetaTags
	title={data.event.title}
	description={data.event.description}
	openGraph={{
		title: data.event.title,
		description: data.event.description,
		images: [{ url: data.event.image }],
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: data.event.title,
		description: data.event.description,
		image: data.event.image,
	}}
/>

<PageHeader title={data.event.title} subtitle={data.event.description} />
<div class="container mx-auto max-w-3xl mt-10 space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<Card class="mx-auto p-2 space-y-4">
		<AspectRatio ratio={4 / 1}>
			{#if data.event.image}
				<img src={data.event.image} alt="Event Cover" class="h-full w-full object-cover" />
			{/if}
		</AspectRatio>
		<div class="flex flex-1 flex-col px-4 py-3">
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3">{data.event.title}</h1>
			<div class="flex flex-row gap-x-4">
				<div class="flex flex-row items-center gap-x-2">
					<Calendar class="text-muted-foreground" />
					<!-- Fixed date / Voting ended-->
					{#if data.event.date}
						{dayjs(`${data.event.date}T${data.event.start_time}`).format(
							dayjs(data.event.date).year() === dayjs().year()
							? 'ddd, MM/DD [at] HH:mm'
							: 'ddd, MM/DD/YYYY [at] HH:mm'
							)}–{dayjs(`${data.event.date}T${data.event.end_time}`).format('HH:mm')}
					<!-- Allow voting, voting open -->		
					{:else}
						Not decided yet
					{/if}
				</div>

				<div class="flex flex-row items-center gap-x-2">
					<MapPin class="text-muted-foreground" />
					{data.event.location}
				</div>
			</div>
			<!--{#if data.event.image !== null && data.event.image !== undefined}
				<InteractableImage src={data.event.image} class="w-full object-contain rounded mb-3"/>
			{/if}-->
			<p class="whitespace-pre-wrap break-words mb-3 mt-3">{data.event.description}</p>
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<span>{data.interestCount + ' members interested'}</span>
					</div>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					{#each data.event.tags as tag}
						<a href={`/forum?tags=${tag}`} class="flex items-center gap-1 hover:underline">
							<Tag class="h-4 w-4" />
							<span>{tag}</span>
						</a>
					{/each}
				</div>
			</div>
			<div class="mt-4 flex items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
				<div class="flex gap-4">
					<EventInterestButton data={data.toggleInterestForm} />
				</div>

				{#if data.event.user_id === data.user?.id}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" href="/events/{data.event.id}/edit" class="text-blue-500 hover:text-blue-600">
							<Pen class="h-4 w-4" />
							Edit
						</Button>
						<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 hover:text-red-600">
							<Trash class="h-4 w-4" /> 
							Delete
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Card>
	{#if data.event.allow_voting}
		<Card class="mx-auto p-2 space-y-4">
			<h2 class="text-lg font-semibold">Vote for Event Schedule</h2>
			{#if data.votingOptions.length > 1}
				<EventVoteSchedule event={data.event} voteOnSchedule={data.voteOnScheduleForm} removeVotes={data.removeVotesForm} votingOptions={data.votingOptions} hasVoted={data.hasVoted}/>
			{:else}
				<p class="text-muted-foreground">No voting options available.</p>
			{/if}
		</Card>
	{/if}
	<div class="mx-auto flex flex-col gap-y-6 pb-6">
		
	</div>
</div>

<EventDeleteDialog eventId={data.event.id} data={data.deleteForm} bind:open={openDeleteDialog} />
