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
	import dayjs from '$lib/dayjs';
	import { onMount } from 'svelte';

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
	let expanded = false;
	let showToggle = false;
	let pRef: HTMLParagraphElement;

	function updateClampState() {
		if (!expanded && pRef) {
			showToggle = pRef.scrollHeight > pRef.clientHeight;
		}
	}

	onMount(updateClampState);

	$: comment.content, updateClampState();

	const isCommentValid = () => editedContent.length >= 1 && editedContent.length <= 5000;

	const moderationStatusLabels = {
		pending: 'Pendente',
		approved: 'Aprovado',
		changes_requested: 'Alterações Solicitadas',
		rejected: 'Rejeitado'
	};

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
	{#if comment.is_deleted}
        <Card class="relative flex h-full flex-col overflow-hidden" style="margin-left: {level * 1.5}rem;">
            <div class="flex flex-1 flex-col px-4 py-3">
                <p class="text-muted-foreground italic">Comentário eliminado</p>
            </div>
        </Card>
    {:else}
		<Card class="relative flex h-full flex-col overflow-hidden" style="margin-left: {level * 1.5}rem;">
			<div class="flex flex-1 flex-col px-4 py-3">
				{#if comment.is_reply}
					<p class="text-xs text-muted-foreground mb-2">
						A responder a <span class="font-medium">{comment.parent_author}</span>
					</p>
					{/if}
					<div class="flex items-start mb-3 gap-2">
						<Avatar.Root class="h-10 w-10">
							<Avatar.Image src={avatarUrl} alt={comment.author.display_name} />
							<Avatar.Fallback>
								{firstAndLastInitials(comment.author.display_name)}
							</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<p class="text-sm font-medium">{comment.author.display_name}</p>
							<p class="text-xs text-muted-foreground">{dayjs(comment.inserted_at).fromNow()}
								{#if comment.inserted_at !== comment.updated_at}
									(editado)
								{/if}
							</p>
						</div>
					</div>
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
							{editedContent.length} / 5000 caracteres
						</p>

						{#if editedContent.length < 1}
							<p class="text-sm mt-1 font-medium text-destructive">O conteúdo tem de ter pelo menos 1 carácter.</p>
						{:else if editedContent.length > 5000}
							<p class="text-sm mt-1 font-medium text-destructive">O conteúdo não pode exceder 5000 caracteres.</p>
						{/if}
				{:else}
					<p bind:this={pRef} class="whitespace-pre-wrap break-words" class:line-clamp-4={!expanded}>
						{comment.content}
					</p>
					{#if showToggle}
						<button on:click={() => (expanded = !expanded)}
							class="mt-1 text-sm font-medium text-blue-600 hover:underline focus:outline-none">
							{expanded ? 'Mostrar menos' : 'Mostrar mais'}
						</button>
					{/if}
				{/if}
				<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
					<div class="flex items-center gap-1">
						<span>{comment.likes_count} {comment.likes_count === 1 ? 'gosto' : 'gostos'}</span>
					</div>
				</div>
				<div class="mt-2 flex items-center justify-between gap-4 border-t pt-2 text-sm text-muted-foreground">
					<div class="flex gap-4">
						<ThreadCommentLikeButton
							commentId={comment.id}
							isLiked={toggleCommentLikeForms[comment.id]?.data?.value ?? false}
						/>
						<Button variant="ghost" size="sm" on:click={() => (replying = !replying)}
							class={cn('flex items-center gap-2', { 'text-orange-500': replying })}>
							<MessageSquare class="h-4 w-4" />
							Responder
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
										Guardar
									</Button>
								</form>
								<Button
									variant="ghost"
									size="sm"
									on:click={() => { editing = false; editedContent = comment.content }}
									class="text-red-500 hover:text-red-600"
								>
									<X class="h-4 w-4" />
									Cancelar
								</Button>
							{:else}
								<Button variant="ghost" size="sm" on:click={() => (editing = true)} class="text-blue-500 hover:text-blue-600">
									<Pen class="h-4 w-4" />
									Editar
								</Button>
								<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 hover:text-red-600">
									<Trash class="h-4 w-4" />
									Eliminar
								</Button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</Card>
		{#if replying}
			<div class="relative mt-2" style="margin-left: {level * 1.5}rem;">
				<div class="relative z-10">
					<ThreadCommentReplyForm parentId={comment.id} data={createForm} bind:open={replying} />
				</div>
			</div>
		{/if}
	{/if}
</div>
{#if !comment.is_deleted}
    <ThreadDeleteCommentDialog commentId={comment.id} data={deleteForm} bind:open={openDeleteDialog} />
{/if}


{#if comment.replies && comment.replies.length > 0}
    {#each comment.replies as reply}
      <ThreadCommentItem comment={reply} createForm={createForm} deleteForm={deleteForm}
	   toggleCommentLikeForms={toggleCommentLikeForms} currentUserId={currentUserId} currentUserRole={currentUserRole}
	   editThreadCommentForms={editThreadCommentForms} level={Math.min(level + 1, 2)}/>
    {/each}
{/if}
