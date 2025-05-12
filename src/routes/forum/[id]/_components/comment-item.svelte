<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { NestedComment } from '@/types/types';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';
	import ThreadCommentLikeButton from './comment-like-button.svelte';
	import { createThreadCommentSchema } from '@/schemas/thread-comment';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import ThreadCommentItem from './comment-item.svelte';
	import ThreadCommentReplyForm from './comment-reply-form.svelte';

	export let comment: NestedComment;
	export let data: SuperValidated<Infer<typeof createThreadCommentSchema>>;
	let replying = false;


	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected'
	};

	$: updatedAt = comment?.updated_at
	? new Date(comment.updated_at).toLocaleString()
	: 'No updates yet';

</script>
{#if !comment.parent_id}
	<hr class="my-1 border-t border-muted" />
{/if}
<Card class="relative flex h-full flex-col overflow-hidden">
	<div class="flex flex-1 flex-col px-4 py-3">
		<div class="mb-5">
			{#if comment.parent_author}
				<p class="text-xs text-muted-foreground mb-2">
					Replying to <span class="font-medium">{comment.parent_author}</span>
				</p>
			{/if}
			<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{comment.content}</p>
			<!--<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>-->
			<div class="flex items-center gap-2">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image src={comment.author.avatar} alt={comment.author.display_name} />
					<Avatar.Fallback>{firstAndLastInitials(comment.author.display_name)}</Avatar.Fallback>
				</Avatar.Root>
				<p class="text-sm font-medium">{comment.author.display_name}</p>
			</div>
			<!--<div class="flex flex-wrap gap-2">
				<ThreadCommentLikeButton count={comment.likes_count} data />
				</div>-->
				<div class="mt-3">
					<button
					type="button"
					class="text-sm text-blue-600 hover:underline"
					on:click={() => (replying = !replying)}
					>
					{replying ? 'Cancel' : 'Reply'}
				</button>
			</div>
			{#if replying}
			<div class="mt-4">
					<ThreadCommentReplyForm parentId={comment.id} data={data} bind:open={replying} />

				</div>
			{/if}
		</div>
	</div>
</Card>

{#if comment.replies && comment.replies.length > 0}
    {#each comment.replies as reply}
      <ThreadCommentItem comment={reply} data={data} />
    {/each}
{/if}
