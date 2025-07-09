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
	import { queryParam } from 'sveltekit-search-params';
	import { stringQueryParam } from '@/utils';
	import SortButton from '@/components/sort-button.svelte';

	export let data;

	let showCommentForm = false;
	let showSummary = false;
	let openDeleteDialog = false;

	const sortBy = queryParam('sortBy', stringQueryParam());
	const sortOrder = queryParam('sortOrder', stringQueryParam());

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

<div class="container mx-auto max-w-3xl mt-10 space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<Card class="mx-auto p-2 space-y-4">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-start mb-3 gap-2">
				<Avatar.Root class="h-10 w-10">
					<Avatar.Image src={avatarUrl} alt={data.thread.author.display_name} />
					<Avatar.Fallback>
						{firstAndLastInitials(data.thread.author.display_name)}
					</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<p class="text-sm font-medium">{data.thread.author.display_name}</p>
					<p class="text-xs text-muted-foreground">{dayjs(data.thread.inserted_at).fromNow()}
						{#if data.thread.inserted_at !== data.thread.updated_at}
								(edited)
							{/if}
					</p>
				</div>
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3 break-words">{data.thread.title}</h1>
			{#if data.thread.image !== null && data.thread.image !== undefined}
				<InteractableImage src={data.thread.image} class="w-full object-contain rounded mb-3"/>
			{/if}
			<p class="whitespace-pre-wrap break-words mb-3">{data.thread.content}</p>
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
				<div class="flex items-center gap-5">
					<div class="flex items-center gap-1">
						<span>{data.likesCount} {data.likesCount === 1 ? 'like' : 'likes'}</span>
					</div>
					<div class="flex items-center gap-1">
						<span>{data.commentsCount} {data.commentsCount === 1 ? 'comment' : 'comments'}</span>
					</div>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					{#each data.thread.tags as tag}
						<a href={`/forum?tags=${tag}`} class="flex items-center gap-1 hover:underline">
							<Tag class="h-4 w-4" />
							<span>{tag}</span>
						</a>
					{/each}
				</div>
			</div>
			<div class="mt-4 flex items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
				<div class="flex gap-4">
					<ThreadLikeButton data={data.toggleLikeForm} />
					<Button variant="ghost" size="sm" on:click={() => (showCommentForm = !showCommentForm)}
						class={cn('flex items-center gap-2', { 'text-orange-500': showCommentForm })}>
						<MessageSquare class="h-4 w-4" />
						Comment
					</Button>
					{#if data.thread.summary}
						<Button variant="ghost" size="sm" on:click={() => (showSummary = !showSummary)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showSummary })}>
							<Text class="h-4 w-4" />
							Summary
						</Button>
					{/if}
				</div>

				{#if data.thread.user_id === data.user?.id}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" href="/forum/{data.thread.id}/edit" class="text-blue-500 gap-2 hover:text-blue-600">
							<Pen class="h-4 w-4" />
							Edit
						</Button>
						<Button variant="ghost" size="sm" on:click={() => (openDeleteDialog = true)} class="text-red-500 gap-2 hover:text-red-600">
							<Trash class="h-4 w-4" /> 
							Delete
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Card>
	<div class="mx-auto flex flex-col gap-y-6 pb-6">
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
		<SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='comments'/>
		{#each data.nestedComments as comment}
			<ThreadCommentItem comment={comment} createForm={data.createThreadCommentForm} deleteForm={data.deleteThreadCommentForm} 
			toggleCommentLikeForms={data.toggleCommentLikeForms} currentUserId={data.user?.id} currentUserRole={data.user?.role}
			level={0} editThreadCommentForms={data.editThreadCommentForms}/>
		{/each}
	</div>
</div>

<ThreadDeleteDialog threadId={data.thread.id} data={data.deleteForm} bind:open={openDeleteDialog} />