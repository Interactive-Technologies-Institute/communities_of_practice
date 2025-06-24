<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import dayjs from 'dayjs';
	import { Tag, ThumbsUp } from 'lucide-svelte';
	import type { EventWithCounters } from '@/types/types';

	export let event: EventWithCounters;

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected',
	};

	$: imageUrl = $page.data.supabase.storage.from('events').getPublicUrl(event.image).data.publicUrl;
</script>

<a href="/events/{event.id}" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
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
				{/if}
			{/if}
		</AspectRatio>
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="mb-5">
				{#if event.date && event.start_time && event.end_time}
					<p class="font-medium leading-none">
						{dayjs(`${event.date}T${event.start_time}`).format(
							dayjs(event.date).year() === dayjs().year()
								? 'ddd, MM/DD [at] HH:mm'
								: 'ddd, MM/DD/YYYY [at] HH:mm'
						)}–{dayjs(`${event.date}T${event.end_time}`).format('HH:mm')}
						•
						{event.location}
					</p>
				{:else}
					<p class="font-medium leading-none text-muted-foreground">Not decided yet • {event.location}</p>
				{/if}
				<h2 class="line-clamp-2 text-lg font-medium">{event.title}</h2>
				<p class="line-clamp-2 text-muted-foreground">{event.description}</p>
			</div>
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<ThumbsUp class="h-4 w-4" />
						<span>{event.interests_count}</span>
					</div>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					{#each event.tags as tag}
						<a href={`/events?tags=${tag}`} class="flex items-center gap-1 hover:underline">
							<Tag class="h-4 w-4" />
							<span>{tag}</span>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</Card>
</a>
