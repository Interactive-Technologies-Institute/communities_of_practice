<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { ThreadWithAuthorAndCounters } from '@/types/types';
	import { Tag } from 'lucide-svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';
	import dayjs from 'dayjs';

	export let thread: ThreadWithAuthorAndCounters;

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
				<div class="flex items-center gap-2">
					<Avatar.Root class="h-8 w-8">
						<Avatar.Image src={avatarUrl} alt={thread.author.display_name} />
						<Avatar.Fallback>{firstAndLastInitials(thread.author.display_name)}</Avatar.Fallback>
					</Avatar.Root>
					<p class="text-sm font-medium">{thread.author.display_name}</p>
				</div>
				<p class="line-clamp-4 text-muted-foreground whitespace-pre-wrap break-words">{thread.content}</p>
			</div>

			{#if imageUrl !== ''}
				<AspectRatio ratio={3 / 2}>
					<img src={imageUrl} alt="Thread Cover" class="h-full w-full object-contain" />
					{#if thread.moderation_status !== 'approved'}
						<Badge class="absolute right-2 top-2" variant={thread.moderation_status === 'rejected' ? 'destructive' : 'secondary'}>
							{moderationStatusLabels[thread.moderation_status]}
						</Badge>
					{/if}
				</AspectRatio>
			{/if}
			<div class=" flex flex-wrap mt-2 gap-2">
				{#each thread.tags as tag}
					<Button variant="secondary" size="sm" href="/forum?tags={tag}" class="text-xs px-2 py-1">
						<Tag class="mr-1 h-3 w-3" />
						{tag}
					</Button>
				{/each}
			</div>
			<div class="text-sm text-muted-foreground mt-2 flex gap-4">
				<span>{thread.likes_count} {thread.likes_count === 1 ? 'like' : 'likes'}</span>
				<span>{thread.comments_count} {thread.comments_count === 1 ? 'comment' : 'comments'}</span>
				<span>Published {dayjs(thread.inserted_at).fromNow()}</span>
			</div>
		</div>
	</Card>
</a>
