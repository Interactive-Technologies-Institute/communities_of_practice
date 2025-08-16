<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import dayjs from '$lib/dayjs';
	import { Tag, ThumbsUp } from 'lucide-svelte';
	import type { EventWithCounters } from '@/types/types';
	import { onMount } from 'svelte';

	export let event: EventWithCounters;

	let visibleTagIndex = 0;
	const totalTags = event.tags.length;

	onMount(() => {
		const interval = setInterval(() => {
			visibleTagIndex = (visibleTagIndex + 1) % totalTags;
		}, 3000);
		return () => clearInterval(interval);
	});

	const moderationStatusLabels = {
		pending: 'Pendente',
		approved: 'Aprovado',
		changes_requested: 'Alterações Solicitadas',
		rejected: 'Rejeitado',
	};

	const eventStatusLabels = {
		voting_open: 'Votação Aberta',
		no_one_voted: 'Ninguém Votou',
		scheduled: 'Agendado',
		ongoing: 'Em Curso',
		completed: 'Concluído',
	};

	const eventStatusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'warning' | 'success'> = {
		voting_open: 'default',
		no_one_voted: 'destructive',
		scheduled: 'default',
		ongoing: 'warning',
		completed: 'success',
	};

	$: imageUrl = $page.data.supabase.storage.from('events').getPublicUrl(event.image).data.publicUrl;
</script>

<a href="/events/{event.id}" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden hover:bg-accent/50">
		<AspectRatio ratio={3 / 2}>
			{#if imageUrl}
				<img src={imageUrl} alt="Event Cover" class="h-full w-full object-cover" />
				{#if event.moderation_status !== 'approved'}
					<Badge
						class="absolute right-2 top-2"
						variant={event.moderation_status === 'rejected' ? 'destructive' : 'secondary'}
					>
						{moderationStatusLabels[event.moderation_status]}
					</Badge>
				{:else if event.status !== null && event.status !== undefined}
					<Badge
						class="absolute right-2 top-2"
						variant={eventStatusVariants[event.status] ?? 'default'}
					>
						{eventStatusLabels[event.status]}
					</Badge>
				{/if}
			{/if}
		</AspectRatio>
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="mb-5">
				{#if event.date && event.start_time && event.end_time}
					<p class="font-medium line-clamp-1 leading-none">
						{dayjs(`${event.date}T${event.start_time}`).format(
							dayjs(event.date).year() === dayjs().year()
								? 'ddd, DD/MM [às] HH:mm'
								: 'ddd, DD/MM/YYYY [às] HH:mm'
						)}–{dayjs(`${event.date}T${event.end_time}`).format('HH:mm')}
						•
						{event.location}
					</p>
				{:else}
					<p class="font-medium leading-none">Data por decidir • {event.location}</p>
				{/if}
				<h2 class="line-clamp-1 text-lg font-medium mt-2">{event.title}</h2>
				<p class="line-clamp-1 text-muted-foreground">{event.description}</p>
			</div>
			<div class="flex w-full justify-between items-end mt-4 text-sm text-muted-foreground">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<ThumbsUp class="h-4 w-4" />
						<span>{event.interests_count}</span>
					</div>
				</div>
				<div class="flex flex-wrap justify-end gap-x-3 max-w-[68%]">
					{#if event.tags.length > 0}
						<a
							href={`/events?tags=${event.tags[visibleTagIndex]}`}
							class="flex items-center gap-1 hover:underline"
						>
							<Tag class="h-4 w-4" />
							<span>{event.tags[visibleTagIndex]}</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</Card>
</a>
