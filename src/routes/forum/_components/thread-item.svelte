<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { ThreadWithAuthorAndLikes } from '@/types/types';
	import { Tag } from 'lucide-svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';

	export let thread: ThreadWithAuthorAndLikes;

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected'
	};

	$: updatedAt = thread?.updated_at
	? new Date(thread.updated_at).toLocaleString()
	: 'No updates yet';

	$: imageUrl = thread.image
	? $page.data.supabase.storage.from('forum_threads').getPublicUrl(thread.image).data.publicUrl
	: '';

	$: avatarUrl = thread.author.avatar
        ? $page.data.supabase.storage.from('users').getPublicUrl(thread.author.avatar).data.publicUrl
        : '';

</script>


<a href={`/forum/${thread.id}`} class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="mb-5">
				<h2 class="line-clamp-2 text-lg font-medium whitespace-pre-wrap break-words">{thread.title}</h2>
				<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{thread.content}</p>
				<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>
				<div class="flex items-center gap-2">
					<Avatar.Root class="h-8 w-8">
						<Avatar.Image src={avatarUrl} alt={thread.author.display_name} />
						<Avatar.Fallback>{firstAndLastInitials(thread.author.display_name)}</Avatar.Fallback>
					</Avatar.Root>
					<p class="text-sm font-medium">{thread.author.display_name}</p>
					</div>

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
		{#if imageUrl !== ''}
			<AspectRatio ratio={3 / 2}>
					<img src={imageUrl} alt="Thread Cover" class="h-full w-full object-cover" />
					{#if thread.moderation_status !== 'approved'}
						<Badge
							class="absolute right-2 top-2"
							variant={thread.moderation_status === 'rejected' ? 'destructive' : 'secondary'}
						>
							{moderationStatusLabels[thread.moderation_status]}
						</Badge>
					{/if}
				</AspectRatio>
			{/if}
		</Card>
</a>
