<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { ThreadWithLikes } from '@/types/types';
	import { Tag } from 'lucide-svelte';

	export let thread: ThreadWithLikes;

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected'
	};

	$: updatedAt = thread?.updated_at
	? new Date(thread.updated_at).toLocaleString()
	: 'No updates yet';

</script>

<a href={`/forum/${thread.id}`} class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="mb-5">
				<h2 class="line-clamp-2 text-lg font-medium whitespace-pre-wrap break-words">{thread.title}</h2>
				<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{thread.content}</p>
				<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>

				<div class="flex flex-wrap gap-2">
					<Button variant="secondary" size="sm">{thread.likes_count}</Button>
				</div> 
			</div>

			{#if Array.isArray(thread.tags) && thread.tags.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each thread.tags as tag}
						<Button variant="secondary" size="sm" href={`/forum?tags=${tag}`}>
							<Tag class="mr-2 h-4 w-4" />
							{tag}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	</Card>
</a>
