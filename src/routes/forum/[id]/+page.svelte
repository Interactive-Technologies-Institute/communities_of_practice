<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import Card from '@/components/ui/card/card.svelte';
	import dayjs from 'dayjs';
	import { ChartNoAxesColumn, Clock, Footprints, Pen, Tag, Trash } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadDeleteDialog from './_components/thread-delete-dialog.svelte';
	import ThreadLikeButton from '../_components/thread-like-button.svelte';
	import ThreadCommentForm from './_components/comment-form.svelte';
	import ThreadCommentItem from './_components/comment-item.svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';

	export let data;

	let openDeleteDialog = false;
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

<PageHeader title={data.thread.title} subtitle={""} />
<div class="container mx-auto space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<div class="mx-auto flex max-w-2xl flex-col gap-y-4">
		<p class="whitespace-pre-wrap break-words">{data.thread.content}</p>
		{#if data.thread.image !== ''}
			<InteractableImage
				src={data.thread.image}
				class="aspect-[3/2] h-auto w-full rounded-md object-cover"
			/>
		{/if}
		<div class=" flex flex-wrap gap-2">
			{#each data.thread.tags as tag}
			<Button variant="secondary" size="sm" href="/forum?tags={tag}">
				<Tag class="mr-2 h-4 w-4" />
				{tag}
			</Button>
			{/each}
		</div>
	</div>
	<div class="mx-auto flex max-w-2xl flex-col gap-y-4">
		<div class="flex items-center gap-2 self-start">
			<Avatar.Root class="h-8 w-8">
				<Avatar.Image src={data.thread.author.avatar} alt={data.thread.author.display_name} />
				<Avatar.Fallback>
					{firstAndLastInitials(data.thread.author.display_name)}
				</Avatar.Fallback>
			</Avatar.Root>
			<Button variant="link" size="sm" href={`/users/${data.thread.author.id}`} class="p-0 h-auto">
				{data.thread.author.display_name}
			</Button>
		</div>
	</div>
	<div class="flex flex-col items-center gap-y-4">
		<div class="flex flex-row items-center justify-center gap-x-4">
			<ThreadLikeButton count={data.likesCount} data={data.toggleLikeForm} />
		</div>
	</div>
	<div class="mx-auto flex max-w-2xl flex-col gap-y-6 pb-6">
		<ThreadCommentForm data={data.createThreadCommentForm} />
		{#each data.nestedComments as comment}
			<ThreadCommentItem comment={comment} createForm={data.createThreadCommentForm} deleteForm={data.deleteThreadCommentForm} currentUserId={data.user?.id} currentUserRole={data.user?.role}/>
		{/each}
	</div>
	<div class="flex flex-col items-center">
		<p class="text-xs text-muted-foreground">
			Published {dayjs(data.thread.inserted_at).fromNow()}
			{#if data.thread.inserted_at !== data.thread.updated_at}
			• Updated {dayjs(data.thread.updated_at).fromNow()}
			{/if}
		</p>
	</div>
	{#if data.thread.user_id === data.user?.id}
		<div
			class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
		>
			<Button variant="outline" href="/forum/{data.thread.id}/edit">
				<Pen class="mr-2 h-4 w-4" />
				Edit
			</Button>
			<Button variant="destructive" on:click={() => (openDeleteDialog = true)}>
				<Trash class="mr-2 h-4 w-4" />
				Delete
			</Button>
		</div>
	{/if}
</div>

<ThreadDeleteDialog threadId={data.thread.id} data={data.deleteForm} bind:open={openDeleteDialog} />
