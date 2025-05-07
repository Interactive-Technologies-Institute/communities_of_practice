<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { PostWithLikes } from '@/types/types';
	import { Tag } from 'lucide-svelte';

	export let post: PostWithLikes;

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected'
	};

	$: updatedAt = post?.updated_at
	? new Date(post.updated_at).toLocaleString()
	: 'No updates yet';

</script>

<a href={`/forum/${post.id}`} class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="mb-5">
				<h2 class="line-clamp-2 text-lg font-medium whitespace-pre-wrap break-words">{post.title}</h2>
				<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{post.content}</p>
				<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>

				<div class="flex flex-wrap gap-2">
					<Button variant="secondary" size="sm">{post.likes_count}</Button>
				</div> 
			</div>

			{#if Array.isArray(post.tags) && post.tags.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each post.tags as tag}
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
