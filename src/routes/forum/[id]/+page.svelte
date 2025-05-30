<script lang="ts">
	import { page } from '$app/stores';
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import Card from '@/components/ui/card/card.svelte';
	import dayjs from 'dayjs';
	import { ChartNoAxesColumn, Clock, Footprints, Pen, Tag, Trash, Text, MessageSquare, Pencil } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadDeleteDialog from './_components/thread-delete-dialog.svelte';
	import ThreadLikeButton from '../_components/thread-like-button.svelte';
	import ThreadCommentForm from './_components/comment-form.svelte';
	import ThreadCommentItem from './_components/comment-item.svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';
	import { cn } from '@/utils';

	export let data;

	let showCommentForm = false;
	let showSummary = false;
	let openDeleteDialog = false;

	$: avatarUrl = data.thread.author.avatar
        ? $page.data.supabase.storage.from('users').getPublicUrl(data.thread.author.avatar).data.publicUrl
        : '';
</script>

<MetaTags
	title={data.thread.title}
	description={data.thread.content}
	openGraph={{
		title: data.thread.title,
		description: data.thread.content,
		images: [{ url: data.thread.image ?? ''}],
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: data.thread.title,
		description: data.thread.content,
		image: data.thread.image,
	}}
/>

<div class="container mx-auto mt-10 space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<Card class="mx-auto max-w-2xl p-6 space-y-4">
		<h1 class="text-2xl font-bold tracking-tight text-foreground">{data.thread.title}</h1>
		<div class="mx-auto flex max-w-2xl flex-col gap-y-4">
			<div class="flex items-center gap-3 text-sm text-muted-foreground">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image src={avatarUrl} alt={data.thread.author.display_name} />
					<Avatar.Fallback>
						{firstAndLastInitials(data.thread.author.display_name)}
					</Avatar.Fallback>
				</Avatar.Root>
				<Button variant="link" size="sm" href={`/users/${data.thread.author.id}`} class="p-0 h-auto">
					{data.thread.author.display_name}
				</Button>
			</div>
		</div>
		{#if data.thread.image !== null && data.thread.image !== undefined}
			<InteractableImage src={data.thread.image} class="w-full object-contain rounded"/>
		{/if}
		<p class="whitespace-pre-wrap break-words">{data.thread.content}</p>
		<div class=" flex flex-wrap gap-2">
			{#each data.thread.tags as tag}
				<Button
					variant="secondary"
					size="sm"
					href="/forum?tags={tag}"
					class="text-xs px-2 py-1"
				>
					<Tag class="mr-1 h-3 w-3" />
					{tag}
				</Button>
			{/each}
		</div>
		<div class="text-sm text-muted-foreground mt-2 flex gap-4">
			<span>{data.likesCount} {data.likesCount === 1 ? 'like' : 'likes'}</span>
			<span>{data.commentsCount} {data.commentsCount === 1 ? 'comment' : 'comments'}</span>
			<span>Published {dayjs(data.thread.inserted_at).fromNow()}</span>
			<span>{#if data.thread.inserted_at !== data.thread.updated_at}
				Edited {dayjs(data.thread.updated_at).fromNow()}
			{/if}
			</span>

		</div>
		<div class="mt-4 flex items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
			<div class="flex gap-4">
				<ThreadLikeButton data={data.toggleLikeForm} />
				<Button variant="ghost" size="sm" on:click={() => (showCommentForm = !showCommentForm)}
					class={cn('flex items-center gap-2', { 'text-orange-500': showCommentForm })}>
					<MessageSquare class="h-4 w-4" />
					{showCommentForm ? 'Commenting' : 'Comment'}
				</Button>
				{#if data.thread.summary}
					<Button variant="ghost" size="sm" on:click={() => (showSummary = !showSummary)}
						class={cn('flex items-center gap-2', { 'text-orange-500': showSummary })}>
						<Text class="h-4 w-4" />
						{showSummary ? 'Summary Open' : 'Summary'}
					</Button>
				{/if}
			</div>

			{#if data.thread.user_id === data.user?.id}
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" href="/forum/{data.thread.id}/edit" class="text-blue-500 hover:text-blue-600">
						<Pen class="h-4 w-4" />
						Edit
					</Button>
					<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 hover:text-red-600">
						<Trash class="h-4 w-4" /> 
						Delete
					</Button>
				</div>
			{/if}
		</div>
	</Card>
	<div class="mx-auto flex max-w-2xl flex-col gap-y-6 pb-6">
		{#if showSummary && data.thread.summary}
			<Card class="p-4 text-sm">
				<h2 class="mb-2 text-base font-semibold text-foreground">Summary</h2>
				<p class="whitespace-pre-wrap">{data.thread.summary}</p>
			</Card>
		{/if}

		{#if showCommentForm}
			<ThreadCommentForm data={data.createThreadCommentForm} />
		{/if}

		<hr class="my-1 border-t border-muted" />
		{#each data.nestedComments as comment}
			<ThreadCommentItem comment={comment} createForm={data.createThreadCommentForm} deleteForm={data.deleteThreadCommentForm} 
			toggleCommentLikeForms={data.toggleCommentLikeForms} currentUserId={data.user?.id} currentUserRole={data.user?.role}
			level={0}/>
		{/each}
	</div>
</div>

<ThreadDeleteDialog threadId={data.thread.id} data={data.deleteForm} bind:open={openDeleteDialog} />
