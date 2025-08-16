<script lang="ts">
	import { Badge } from '@/components/ui/badge';
	import { Card } from '@/components/ui/card';
	import type { EventWithCounters } from '@/types/types';
	import { Calendar, ThumbsUp } from 'lucide-svelte';
    import dayjs from '$lib/dayjs';

	export let event: EventWithCounters;

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
</script>

<a href="/events/{event.id}" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden hover:bg-accent/50">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 flex items-center justify-center text-muted-foreground">
                        <Calendar class="h-8 w-8" />
                    </div>
					<p class="text-sm line-clamp-1 break-all font-medium">{event.title}</p>
					{#if event.moderation_status !== 'approved'}
						<Badge
							class="text-[10px] font-normal px-1.5 py-0.5"
							variant={event.moderation_status === 'rejected' ? 'destructive' : 'secondary'}
						>
							{moderationStatusLabels[event.moderation_status]}
						</Badge>
					{:else if event.status !== null && event.status !== undefined}
						<Badge
							class="text-[10px] font-normal px-1.5 py-0.5"
							variant={eventStatusVariants[event.status] ?? 'default'}
						>
							{eventStatusLabels[event.status]}
						</Badge>
					{/if}
				</div>
				<div class="flex text-muted-foreground items-center gap-2 ml-2">
                    {#if event.date && event.start_time && event.end_time}
                        <p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{dayjs(`${event.date}T${event.start_time}`).format(
                                dayjs(event.date).year() === dayjs().year()
                                    ? 'DD/MM [às] HH:mm'
                                    : 'DD/MM/YYYY [às] HH:mm'
                            )}–{dayjs(`${event.date}T${event.end_time}`).format('HH:mm')}</p>
                    {:else}
                        <p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">Data por decidir</p>
                    {/if}
					<ThumbsUp class="h-4 w-4" />
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
						{event.interests_count}
					</p>
				</div>
			</div>
		</div>
	</Card>
</a>

