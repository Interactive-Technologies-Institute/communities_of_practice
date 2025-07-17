<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Button } from '@/components/ui/button';
	import ContentItem  from '@/components/content-item.svelte';
	import ThreadCompactItem  from '@/components/thread-compact-item.svelte';
	import dayjs from 'dayjs';
	import { Calendar, MapPin, Pen, Tag, Trash, Text, Video, Link } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EventDeleteDialog from './_components/event-delete-dialog.svelte';
	import EventInterestButton from './_components/event-interest-button.svelte';
	import EventVoteSchedule from './_components/event-vote-schedule.svelte';
	import { cn } from '@/utils';

	export let data;

	let showConnections = true;
	let showSummary = true;
	let showRecording = true;
	let showTranscription = false;

	function getGoogleDriveEmbedUrl(url: string): string | null {
		const match = url.match(/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
		if (match && match[1]) {
			return `https://drive.google.com/file/d/${match[1]}/preview`;
		}
		return null;
	}

	
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

<div class="container mx-auto max-w-4xl mt-10 space-y-2 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<div class="w-full flex items-center gap-4 text-foreground">
		<hr class="flex-grow border-t border-foreground" />
		<span class="text-sm font-semibold uppercase">Event</span>
		<hr class="flex-grow border-t border-foreground" />
	</div>
	<Card class="mx-auto">
		<AspectRatio ratio={4 / 1}>
			{#if data.event.image}
				<img src={data.event.image} alt="Event Cover" class="h-full w-full object-cover" />
			{/if}
		</AspectRatio>
		<div class="flex flex-1 flex-col px-4 py-3">
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3 break-words">{data.event.title}</h1>
			<div class="flex flex-row gap-x-4">
				<div class="flex flex-row items-center gap-x-2">
					<Calendar class="text-muted-foreground" />
					<!-- Fixed date / Voting ended-->
					{#if data.event.date}
						{dayjs(`${data.event.date}T${data.event.start_time}`).format(
							dayjs(data.event.date).year() === dayjs().year()
							? 'DD/MM [at] HH:mm'
							: 'DD/MM/YYYY [at] HH:mm'
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
					{#if data.connectedContents.length > 0}
						<Button variant="ghost" size="sm" on:click={() => (showConnections = !showConnections)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showConnections })}>
							<Link class="h-4 w-4" />
							Connections
						</Button>
					{/if}
					{#if data.event.recording_link}
						<Button variant="ghost" size="sm" on:click={() => (showRecording = !showRecording)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showRecording })}>
							<Video class="h-4 w-4" />
							Recording
						</Button>
					{/if}
					{#if data.event.summary}
						<Button variant="ghost" size="sm" on:click={() => (showSummary = !showSummary)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showSummary })}>
							<Text class="h-4 w-4" />
							Summary
						</Button>
					{/if}
				</div>
				{#if data.event.user_id === data.user?.id}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" href="/events/{data.event.id}/edit" class="text-blue-500 gap-2 hover:text-blue-600">
							<Pen class="h-4 w-4" />
							Edit
						</Button>
						<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 gap-2 hover:text-red-600">
							<Trash class="h-4 w-4" /> 
							Delete
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Card>
	<div class="mx-auto flex flex-col space-y-2">
		{#if data.event.moderation_status === "approved" && data.event.allow_voting}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Vote Schedule</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<Card class="mx-auto p-2 space-y-4">
				{#if data.votingOptions.length > 1}
					<EventVoteSchedule event={data.event} voteOnSchedule={data.voteOnScheduleForm} removeVotes={data.removeVotesForm} votingOptions={data.votingOptions} hasVoted={data.hasVoted}/>
				{:else}
					<p class="text-muted-foreground">No voting options available.</p>
				{/if}
			</Card>
		{/if}
		{#if showConnections && (data.connectedContents.length > 0 || data.connectedThreads.length > 0)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Connections</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#each data.connectedContents as content}
				<div class="text-sm">
					<ContentItem {content} />
				</div>
			{/each}
			{#each data.connectedThreads as thread}
				<div class="text-sm">
					<ThreadCompactItem {thread} />
				</div>
			{/each}
		{/if}
		{#if showRecording && (data.event.recording_link || data.event.transcription)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Recording</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<Card class="p-4 text-sm">
				{#if data.event.recording_link}
					<iframe
						class="w-full aspect-video rounded"
						src={getGoogleDriveEmbedUrl(data.event.recording_link)}
						title={`Recording of event: ${data.event.title}`}
						allowfullscreen
					></iframe> 
				{/if}
				{#if data.event.transcription}
					<div class="mt-2 flex justify-center">
						<button on:click={() => (showTranscription = !showTranscription)}
							class="mt-2 text-sm font-medium text-blue-600 hover:underline focus:outline-none">
							{showTranscription ? 'Hide Transcription' : 'Show Transcription'}
						</button>
					</div>
					{#if showTranscription}
						<p class="whitespace-pre-wrap">{data.event.transcription}</p>
					{/if}
				{/if}
			</Card>
		{/if}
		{#if showSummary && data.event.summary}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Summary</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<Card class="p-4 text-sm">
				<p class="whitespace-pre-wrap">{data.event.summary}</p>
			</Card>
		{/if}
	</div>
</div>

<EventDeleteDialog eventId={data.event.id} data={data.deleteForm} bind:open={openDeleteDialog} />
