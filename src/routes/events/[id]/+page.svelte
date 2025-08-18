<script lang="ts">
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Button } from '@/components/ui/button';
	import ContentItem  from '@/components/content-item.svelte';
	import EventCompactItem from '@/components/event-compact-item.svelte';
	import ThreadCompactItem  from '@/components/thread-compact-item.svelte';
	import dayjs from '$lib/dayjs';
	import { Calendar, MapPin, Pen, Tag, Trash, Text, Video, Link } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EventDeleteDialog from './_components/event-delete-dialog.svelte';
	import EventInterestButton from './_components/event-interest-button.svelte';
	import EventVoteSchedule from './_components/event-vote-schedule.svelte';
	import { cn } from '@/utils';

	export let data;

	let showAnnexes = true;
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
		images: [{ url: data.event.image ?? ''}],
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
		<span class="text-sm font-semibold uppercase">Evento</span>
		<hr class="flex-grow border-t border-foreground" />
	</div>
	<Card class="mx-auto">
		<AspectRatio ratio={4 / 1}>
			{#if data.event.image !== null && data.event.image !== undefined}
				<img src={data.event.image} alt="Event Cover" class="h-full w-full object-cover" />
			{:else}
				<div class="h-full w-full bg-primary flex items-center justify-center"></div>
			{/if}
		</AspectRatio>
		<div class="flex flex-1 flex-col px-4 py-3">
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3 break-words">{data.event.title}</h1>
			<div class="flex flex-col gap-y-2">
				<div class="flex flex-row items-center gap-x-2">
					<Calendar class="text-muted-foreground" />
					<!-- Fixed date / Voting ended-->
					{#if data.event.date}
						{dayjs(`${data.event.date}T${data.event.start_time}`).format(
							dayjs(data.event.date).year() === dayjs().year()
							? 'DD/MM [às] HH:mm'
							: 'DD/MM/YYYY [às] HH:mm'
							)}–{dayjs(`${data.event.date}T${data.event.end_time}`).format('HH:mm')}
					<!-- Allow voting, voting open -->		
					{:else}
						Por decidir
					{/if}
				</div>

				<div class="flex flex-row items-center break-all gap-x-2">
					<MapPin class="text-muted-foreground" />
					{data.event.location}
				</div>
			</div>
			<p class="whitespace-pre-wrap break-words mb-3 mt-3">{data.event.description}</p>
			<div class="flex w-full justify-between items-end mt-4 text-sm text-muted-foreground">
				<span>{data.interestCount} {data.interestCount === 1 ? 'membro interessado' : ' membros interessados'}</span>
				<div class="flex flex-wrap justify-end gap-x-3 max-w-[70%]">
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
					{#if data.annexedContents.length > 0 || data.annexedEvents.length > 0 || data.annexedThreads.length > 0 ||
						data.contentsAnnexedTo.length > 0 || data.eventsAnnexedTo.length > 0 || data.threadsAnnexedTo.length > 0}
						<Button variant="ghost" size="sm" on:click={() => (showAnnexes = !showAnnexes)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showAnnexes })}>
							<Link class="h-4 w-4" />
							Anexos
						</Button>
					{/if}
					{#if data.event.recording_link}
						<Button variant="ghost" size="sm" on:click={() => (showRecording = !showRecording)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showRecording })}>
							<Video class="h-4 w-4" />
							Gravação
						</Button>
					{/if}
					{#if data.event.summary}
						<Button variant="ghost" size="sm" on:click={() => (showSummary = !showSummary)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showSummary })}>
							<Text class="h-4 w-4" />
							Sumário
						</Button>
					{/if}
				</div>
				{#if data.event.user_id === data.user?.id}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" href="/events/{data.event.id}/edit" class="text-blue-500 gap-2 hover:text-blue-600">
							<Pen class="h-4 w-4" />
							Editar
						</Button>
						<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 gap-2 hover:text-red-600">
							<Trash class="h-4 w-4" /> 
							Eliminar
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Card>
	<div class="mx-auto flex flex-col space-y-2">
		{#if data.event.moderation_status === "approved" && data.event.allow_voting && data.event.voting_end_date && data.event.voting_end_time}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Votar Horário</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#if data.votingOptions.length > 1}
				<EventVoteSchedule event={data.event} voteOnSchedule={data.voteOnScheduleForm} removeVotes={data.removeVotesForm}
					votingOptions={data.votingOptions} userVoteIds={data.userVoteIds} voteCounts={data.voteCounts}/>
			{:else}
				<Card class="w-full mx-auto p-2 space-y-4">
					<p class="text-muted-foreground">Não há opções de voto disponíveis.</p>
				</Card>
			{/if}
			
		{/if}
		{#if showAnnexes && (data.annexedContents.length > 0 || data.annexedEvents.length > 0 || data.annexedThreads.length > 0)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Anexos</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#each data.annexedEvents as event}
				<EventCompactItem {event} />
			{/each}
			{#each data.annexedThreads as thread}
				<ThreadCompactItem {thread} />
			{/each}
			{#each data.annexedContents as content}
				<ContentItem {content} />
			{/each}
		{/if}
		{#if showAnnexes && (data.contentsAnnexedTo.length > 0 || data.eventsAnnexedTo.length > 0 || data.threadsAnnexedTo.length > 0)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Anexado A</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#each data.eventsAnnexedTo as event}
				<EventCompactItem {event} />
			{/each}
			{#each data.threadsAnnexedTo as thread}
				<ThreadCompactItem {thread} />
			{/each}
			{#each data.contentsAnnexedTo as content}
				<ContentItem {content} />
			{/each}
		{/if}
		{#if showRecording && (data.event.recording_link || data.event.transcription)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Gravação</span>
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
							{showTranscription ? 'Ocultar transcrição' : 'Mostrar transcrição'}
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
				<span class="text-sm font-semibold uppercase">Sumário</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<Card class="p-4 text-sm">
				<p class="whitespace-pre-wrap">{data.event.summary}</p>
			</Card>
		{/if}
	</div>
</div>

<EventDeleteDialog eventId={data.event.id} data={data.deleteForm} bind:open={openDeleteDialog} />
