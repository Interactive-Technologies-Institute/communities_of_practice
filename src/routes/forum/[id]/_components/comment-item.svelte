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
	import { createThreadCommentSchema, deleteThreadCommentSchema, toggleThreadCommentLikeSchema } from '@/schemas/thread-comment';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import ThreadCommentItem from './comment-item.svelte';
	import ThreadCommentReplyForm from './comment-reply-form.svelte';
	import ThreadDeleteCommentDialog from './comment-delete-dialog.svelte';
	import { Trash } from 'lucide-svelte';

	export let comment: NestedComment;
	export let createForm: SuperValidated<Infer<typeof createThreadCommentSchema>>;
	export let deleteForm: SuperValidated<Infer<typeof deleteThreadCommentSchema>>;
	export let toggleCommentLikeForms: Record<string, SuperValidated<Infer<typeof toggleThreadCommentLikeSchema>>>;
	export let currentUserId: string | undefined;
	export let currentUserRole: string | undefined;
	export let level: number = 0;

	let replying = false;
	let openDeleteDialog = false;


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
{#if !comment.is_reply}
    <hr class="my-1 border-t border-muted" />
{/if}
<div class="relative mt-4" style="min-height: 100%;">
    {#if level > 0}
        {#each Array(level) as _, i}
            <div
                class="absolute top-0 h-full w-px bg-gray-300"
                style="left: {i * 1.5}rem;"
            ></div>
        {/each}
    {/if}
    <Card class="relative flex h-full flex-col overflow-hidden" style="margin-left: {level * 1.5}rem;">
        <div class="flex flex-1 flex-col px-4 py-3">
            <div class="mb-5">
                {#if comment.is_reply}
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
				<div class="flex flex-wrap gap-2">
					<ThreadCommentLikeButton count={comment.likes_count} data={toggleCommentLikeForms[comment.id]} />
				</div>
				<div class="mt-3 flex gap-x-2">
					<Button type="button" on:click={() => (replying = !replying)}>
						{replying ? 'Cancel' : 'Reply'}
					</Button>

					{#if comment.author.id === currentUserId || currentUserRole === 'admin' || currentUserRole === 'moderator'}
						<Button variant="destructive" on:click={() => (openDeleteDialog = true)}>
							<Trash class="mr-2 h-4 w-4" />
							Delete
						</Button>
					{/if}
				</div>
				{#if replying}
					<div class="mt-4">
						<ThreadCommentReplyForm parentId={comment.id} data={createForm} bind:open={replying} />
					</div>
				{/if}
			</div>
		</div>
	</Card>
</div>
<ThreadDeleteCommentDialog commentId={comment.id} data={deleteForm} bind:open={openDeleteDialog} />


{#if comment.replies && comment.replies.length > 0}
    {#each comment.replies as reply}
      <ThreadCommentItem comment={reply} createForm={createForm} deleteForm={deleteForm}
	   toggleCommentLikeForms={toggleCommentLikeForms} currentUserId={currentUserId} currentUserRole={currentUserRole}
	   level={Math.min(level + 1, 2)}/>
    {/each}
{/if}
