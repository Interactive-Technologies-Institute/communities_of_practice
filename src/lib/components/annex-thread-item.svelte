<script lang="ts">
	import { Card } from '@/components/ui/card';
	import type { ThreadWithCounters } from '@/types/types';
	import { Calendar, ThumbsUp, MessageSquare, MessagesSquare } from 'lucide-svelte';
    import dayjs from '$lib/dayjs';

	export let thread: ThreadWithCounters & { type: 'thread' };
    export let selectedItems: { id: number; type: 'content' | 'event' | 'thread' }[];

	$: checked = selectedItems.some(s => s.id === thread.id && s.type === 'thread');

	function toggleCheckbox(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		if (checked) {
			selectedItems = selectedItems.filter(s => !(s.id === thread.id && s.type === 'thread'));
		} else {
			selectedItems = [...selectedItems, { id: thread.id, type: 'thread' }];
		}
	}
</script>

<a href="/forum/{thread.id}" target="_blank" rel="noopener noreferrer" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="h-8 w-8 flex items-center justify-center text-muted-foreground">
                        <MessagesSquare class="h-8 w-8" />
                    </div>
					<p class="text-sm line-clamp-1 break-all font-medium">{thread.title}</p>
				</div>
				<div class="flex text-muted-foreground items-center gap-2 ml-2">
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{dayjs(`${thread.inserted_at}`).format(
						dayjs(thread.inserted_at).year() === dayjs().year()
							? 'DD/MM'
							: 'DD/MM/YYYY'
					)}</p>
					<ThumbsUp class="h-4 w-4" />
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
						{thread.likes_count}
					</p>
					<MessageSquare class="h-4 w-4" />
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
						{thread.comments_count}
					</p>
					<input
						type="checkbox"
						value={thread.id}
						checked={checked}
						on:change={toggleCheckbox}
						class="ml-2"
					/>
				</div>
			</div>
		</div>
	</Card>
</a>

