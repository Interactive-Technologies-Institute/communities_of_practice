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
	import { createThreadCommentSchema, deleteThreadCommentSchema, toggleThreadCommentLikeSchema, updateThreadCommentSchema } from '@/schemas/thread-comment';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import ThreadCommentItem from './comment-item.svelte';
	import ThreadCommentReplyForm from './comment-reply-form.svelte';
	import ThreadDeleteCommentDialog from './comment-delete-dialog.svelte';
	import { Trash, MessageSquare, Pen, Check, X } from 'lucide-svelte';
	import { cn } from '@/utils';

	export let comment: NestedComment;
	export let createForm: SuperValidated<Infer<typeof createThreadCommentSchema>>;
	export let deleteForm: SuperValidated<Infer<typeof deleteThreadCommentSchema>>;
	export let toggleCommentLikeForms: Record<string, SuperValidated<Infer<typeof toggleThreadCommentLikeSchema>>>;
	export let currentUserId: string | undefined;
	export let currentUserRole: string | undefined;
	export let level: number = 0;
	export let editThreadCommentForms: Record<string, SuperValidated<Infer<typeof updateThreadCommentSchema>>>;

	let replying = false;
	let editing = false;
	let editedContent = comment.content;
	let openDeleteDialog = false;

	const isCommentValid = () => editedContent.length >= 1 && editedContent.length <= 5000;

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

	function handleEditSubmit(event: Event) {
        event.preventDefault();
        if (isCommentValid()) {
            const form = event.currentTarget as HTMLFormElement;
            form.submit();
        }
    }

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
			{#if editing}
					<textarea
						bind:value={editedContent}
						rows="3"
						minlength="1"
						maxlength="5000"
						class="w-full rounded border px-3 py-2 text-sm max-h-48 overflow-auto"
						required
					/>

					<p class="text-xs mt-1 text-muted-foreground">
						{editedContent.length} / 5000 characters
					</p>

					{#if editedContent.length < 1}
						<p class="text-sm mt-1 font-medium text-destructive">Content must be at least 1 character.</p>
					{:else if editedContent.length > 5000}
						<p class="text-sm mt-1 font-medium text-destructive">Content must not exceed 5000 characters.</p>
					{/if}
			{:else}
				<p class="line-clamp-2 whitespace-pre-wrap break-words">{comment.content}</p>
			{/if}
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
						Reply
					</Button>
				</div>

				{#if comment.user_id === currentUserId}
					<div class="flex gap-2 mt-2">
						{#if editing}
							<form method="POST" action="?/editThreadComment" class="flex gap-2" on:submit={handleEditSubmit}>
								<input type="hidden" name="id" value={comment.id} />
								<input type="hidden" name="content" value={editedContent} />
								<Button type="submit" variant="ghost" size="sm" disabled={!isCommentValid()} class="text-blue-500 hover:text-blue-600" >
									<Check class="h-4 w-4" />
									Save
								</Button>
							</form>
							<Button
								variant="ghost"
								size="sm"
								on:click={() => { editing = false; editedContent = comment.content }}
								class="text-red-500 hover:text-red-600"
							>
								<X class="h-4 w-4" />
								Cancel
							</Button>
						{:else}
							<!-- Normal Edit/Delete buttons -->
							<Button variant="ghost" size="sm" on:click={() => (editing = true)} class="text-blue-500 hover:text-blue-600">
								<Pen class="h-4 w-4" />
								Edit
							</Button>
							<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 hover:text-red-600">
								<Trash class="h-4 w-4" />
								Delete
							</Button>
						{/if}
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
	   editThreadCommentForms={editThreadCommentForms} level={Math.min(level + 1, 2)}/>
    {/each}
{/if}
