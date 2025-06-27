<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { ThreadWithAuthorAndCounters } from '@/types/types';
	import { Tag, ThumbsUp, MessageSquare} from 'lucide-svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';
	import dayjs from 'dayjs';
	import InteractableImage from '@/components/interactable-image.svelte';

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
			<div class="mb-3">
				<div class="flex items-start gap-2">
					<Avatar.Root class="h-10 w-10">
						<Avatar.Image src={avatarUrl} alt={thread.author.display_name} />
						<Avatar.Fallback>{firstAndLastInitials(thread.author.display_name)}</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<p class="text-sm font-medium">{thread.author.display_name}</p>
						<p class="text-xs text-muted-foreground">{dayjs(thread.inserted_at).fromNow()}
							{#if thread.inserted_at !== thread.updated_at}
								(edited)
							{/if}
						</p>
					</div>
				</div>
				<h2 class="line-clamp-2 text-lg font-medium whitespace-pre-wrap break-words mt-1 mb-1">{thread.title}</h2>
				{#if imageUrl !== ''}
					<InteractableImage src={imageUrl} class="w-full object-contain rounded mt-1 mb-1"/>
				{/if}
				<p class="line-clamp-2 whitespace-pre-wrap break-words">{thread.content}</p>
			</div>
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<ThumbsUp class="h-4 w-4" />
						<span>{thread.likes_count}</span>
					</div>
					<div class="flex items-center gap-1">
						<MessageSquare class="h-4 w-4" />
						<span>{thread.comments_count}</span>
					</div>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					{#each thread.tags as tag}
						<a href={`/forum?tags=${tag}`} class="flex items-center gap-1 hover:underline">
							<Tag class="h-4 w-4" />
							<span>{tag}</span>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</Card>
</a>
