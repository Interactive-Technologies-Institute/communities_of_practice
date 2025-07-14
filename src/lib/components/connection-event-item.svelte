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
    export let selectedEventIds: number[];

    $: checked = selectedEventIds.includes(event.id);

	function toggleCheckbox(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		if (checked) {
			selectedEventIds = selectedEventIds.filter(id => id !== event.id);
		} else {
			selectedEventIds = [...selectedEventIds, event.id];
		}
	}

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected',
	};

	const eventStatusLabels = {
		voting_open: 'Voting Open',
		no_one_voted: 'No One Voted',
		scheduled: 'Scheduled',
		ongoing: 'Ongoing',
		completed: 'Completed',
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

<a href="/events/{event.id}" target="_blank" rel="noopener noreferrer" class="h-full">
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
					<p class="font-medium leading-none">Date not decided yet • {event.location}</p>
				{/if}
				<h2 class="line-clamp-2 text-lg font-medium mt-2">{event.title}</h2>
				<p class="line-clamp-2 text-muted-foreground">{event.description}</p>
			</div>
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full mt-auto">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<ThumbsUp class="h-4 w-4" />
						<span>{event.interests_count}</span>
					</div>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					<input
						type="checkbox"
						name="eventIds"
						value={event.id}
						checked={checked}
						on:change={toggleCheckbox}
						class="ml-2"
					/>
				</div>
			</div>
		</div>
	</Card>
</a>
