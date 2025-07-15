<script lang="ts">
	import { Card } from '@/components/ui/card';
	import type { Event } from '@/types/types';
	import { Calendar, Download } from 'lucide-svelte';
    import dayjs from 'dayjs';

	export let event: Event;
</script>

<a href="/events/{event.id}" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 flex items-center justify-center text-muted-foreground">
                        <Calendar class="h-8 w-8" />
                    </div>
					<p class="text-sm line-clamp-1 break-all font-medium">{event.title}</p>
				</div>
				<div class="flex items-center gap-2 ml-2">
                    {#if event.date && event.start_time && event.end_time}
                        <p class="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{dayjs(`${event.date}T${event.start_time}`).format(
                                dayjs(event.date).year() === dayjs().year()
                                    ? 'DD/MM [at] HH:mm'
                                    : 'DD/MM/YYYY [at] HH:mm'
                            )}–{dayjs(`${event.date}T${event.end_time}`).format('HH:mm')}</p>
                    {:else}
                        <p class="text-xs text-muted-foreground">Date not decided</p>
                    {/if}
				</div>
			</div>
		</div>
	</Card>
</a>

