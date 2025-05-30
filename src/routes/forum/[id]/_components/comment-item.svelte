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
	import { Trash, MessageSquare, Pen } from 'lucide-svelte';
	import { cn } from '@/utils';

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

	$: avatarUrl = comment.author.avatar
        ? $page.data.supabase.storage.from('users').getPublicUrl(comment.author.avatar).data.publicUrl
        : '';

</script>
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
			{#if comment.is_reply}
				<p class="text-xs text-muted-foreground mb-2">
					Replying to <span class="font-medium">{comment.parent_author}</span>
				</p>
			{/if}
			<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{comment.content}</p>
			<!--<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>-->
			<div class="flex items-center gap-2">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image src={avatarUrl} alt={comment.author.display_name} />
					<Avatar.Fallback>{firstAndLastInitials(comment.author.display_name)}</Avatar.Fallback>
				</Avatar.Root>
				<p class="text-sm font-medium">{comment.author.display_name}</p>
			</div>
			<div class="mt-2 flex items-center justify-between gap-4 border-t pt-2 text-sm text-muted-foreground">
				<div class="flex gap-4">
					<ThreadCommentLikeButton count={comment.likes_count} data={toggleCommentLikeForms[comment.id]} />
					<Button variant="ghost" size="sm" on:click={() => (replying = !replying)}
						class={cn('flex items-center gap-2', { 'text-orange-500': replying })}>
						<MessageSquare class="h-4 w-4" />
						{replying ? 'Replying' : 'Reply'}
					</Button>
				</div>

				{#if comment.user_id === currentUserId}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 hover:text-red-600">
							<Trash class="h-4 w-4" /> 
							Delete
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Card>
	{#if replying}
		<div class="relative mt-2" style="margin-left: {level * 1.5}rem;">
			{#if level > 0}
				{#each Array(level) as _, i}
					<div
						class="absolute top-0 h-full w-px bg-gray-300"
						style="left: {i * 1.5}rem;"
					></div>
				{/each}
			{/if}
			<div class="relative z-10">
				<ThreadCommentReplyForm parentId={comment.id} data={createForm} bind:open={replying} />
			</div>
		</div>
	{/if}
</div>
<ThreadDeleteCommentDialog commentId={comment.id} data={deleteForm} bind:open={openDeleteDialog} />


{#if comment.replies && comment.replies.length > 0}
    {#each comment.replies as reply}
      <ThreadCommentItem comment={reply} createForm={createForm} deleteForm={deleteForm}
	   toggleCommentLikeForms={toggleCommentLikeForms} currentUserId={currentUserId} currentUserRole={currentUserRole}
	   level={Math.min(level + 1, 2)}/>
    {/each}
{/if}
