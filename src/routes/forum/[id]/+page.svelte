<script lang="ts">
	import { page } from '$app/stores';
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import EventCompactItem from '@/components/event-compact-item.svelte';
	import ThreadCompactItem from '@/components/thread-compact-item.svelte';
	import ContentItem from '@/components/content-item.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import dayjs from 'dayjs';
	import { Pen, Tag, Trash, Text, MessageSquare, Link } from 'lucide-svelte';
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

	let showAnnexes = true;
	let showCommentForm = true;
	let showSummary = true;
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

<div class="container mx-auto max-w-4xl mt-10 space-y-2 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<div class="w-full flex items-center gap-4 text-foreground">
		<hr class="flex-grow border-t border-foreground" />
		<span class="text-sm font-semibold uppercase">Thread</span>
		<hr class="flex-grow border-t border-foreground" />
	</div>
	<Card class="mx-auto p-2 space-y-4">
		<div class="flex flex-1 flex-col px-2 py-3">
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
			<p class="whitespace-pre-wrap break-words">{data.thread.content}</p>
			<div class="flex w-full justify-between items-end mt-4 text-sm text-muted-foreground">
				<div class="flex gap-3">
					<span>{data.likesCount} {data.likesCount === 1 ? 'like' : 'likes'}</span>
					<span>{data.commentsCount} {data.commentsCount === 1 ? 'comment' : 'comments'}</span>
				</div>
				<div class="flex flex-wrap justify-end gap-x-3 max-w-[70%]">
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
					{#if data.annexedContents.length > 0 || data.annexedEvents.length > 0 || data.annexedThreads.length > 0 ||
						data.contentsAnnexedTo.length > 0 || data.eventsAnnexedTo.length > 0 || data.threadsAnnexedTo.length > 0}
						<Button variant="ghost" size="sm" on:click={() => (showAnnexes = !showAnnexes)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showAnnexes })}>
							<Link class="h-4 w-4" />
							Annexes
						</Button>
					{/if}
					{#if data.thread.summary}
						<Button variant="ghost" size="sm" on:click={() => (showSummary = !showSummary)}
							class={cn('flex items-center gap-2', { 'text-orange-500': showSummary })}>
							<Text class="h-4 w-4" />
							Summary
						</Button>
					{/if}
					<Button variant="ghost" size="sm" on:click={() => (showCommentForm = !showCommentForm)}
						class={cn('flex items-center gap-2', { 'text-orange-500': showCommentForm })}>
						<MessageSquare class="h-4 w-4" />
						Comment
					</Button>
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
	<div class="mx-auto flex flex-col space-y-2">
		{#if showAnnexes && (data.annexedContents.length > 0 || data.annexedEvents.length > 0 || data.annexedThreads.length > 0)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Annexes</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#each data.annexedEvents as event}
				<EventCompactItem {event} />
			{/each}
			{#each data.annexedThreads as thread}
				<ThreadCompactItem {thread} />
			{/each}
			{#each data.annexedContents as content}
				<ContentItem {content} />
			{/each}
		{/if}
		{#if showAnnexes && (data.contentsAnnexedTo.length > 0 || data.eventsAnnexedTo.length > 0 || data.threadsAnnexedTo.length > 0)}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Annexed To</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			{#each data.eventsAnnexedTo as event}
				<EventCompactItem {event} />
			{/each}
			{#each data.threadsAnnexedTo as thread}
				<ThreadCompactItem {thread} />
			{/each}
			{#each data.contentsAnnexedTo as content}
				<ContentItem {content} />
			{/each}
		{/if}
		{#if showSummary && data.thread.summary}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Summary</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<Card class="p-4 text-sm">
				<p class="whitespace-pre-wrap">{data.thread.summary}</p>
			</Card>
		{/if}
		{#if showCommentForm}
			<div class="w-full flex items-center gap-4 text-foreground">
				<hr class="flex-grow border-t border-foreground" />
				<span class="text-sm font-semibold uppercase">Comment Form</span>
				<hr class="flex-grow border-t border-foreground" />
			</div>
			<ThreadCommentForm data={data.createThreadCommentForm} />
		{/if}
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Comments</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		<SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='comments'/>
		{#each data.nestedComments as comment(comment.id)}
			<ThreadCommentItem comment={comment} createForm={data.createThreadCommentForm} deleteForm={data.deleteThreadCommentForm} 
			toggleCommentLikeForms={data.toggleCommentLikeForms} currentUserId={data.user?.id} currentUserRole={data.user?.role}
			level={0} editThreadCommentForms={data.editThreadCommentForms}/>
		{/each}
	</div>
</div>

<ThreadDeleteDialog threadId={data.thread.id} data={data.deleteForm} bind:open={openDeleteDialog} />