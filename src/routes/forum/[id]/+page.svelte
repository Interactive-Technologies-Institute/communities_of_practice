<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import Card from '@/components/ui/card/card.svelte';
	import dayjs from 'dayjs';
	import { ChartNoAxesColumn, Clock, Footprints, Pen, Tag, Trash } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import PostDeleteDialog from './_components/post-delete-dialog.svelte';
	import LikeButton from './_components/like-button.svelte';

	export let data;

	let openDeleteDialog = false;
</script>

<MetaTags
	title={data.post.title}
	description={data.post.content}
	openGraph={{
		title: data.post.title,
		description: data.post.content,
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: data.post.title,
		description: data.post.content,
	}}
/>

<PageHeader title={data.post.title} subtitle={""} />
<div class="container mx-auto space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<div class="mx-auto flex max-w-2xl flex-col gap-y-4">
		<p class="whitespace-pre-wrap break-words">{data.post.content}</p>
		<div class=" flex flex-wrap gap-2">
			{#each data.post.tags as tag}
			<Button variant="secondary" size="sm" href="/forum?tags={tag}">
				<Tag class="mr-2 h-4 w-4" />
				{tag}
			</Button>
			{/each}
		</div>
	</div>
	<div class="flex flex-col items-center gap-y-4">
		<div class="flex flex-row items-center justify-center gap-x-4">
			<LikeButton count={data.likesCount} data={data.toggleLikeForm} />
		</div>
	</div>
	<div class="flex flex-col items-center">
		<p class="text-xs text-muted-foreground">
			Published {dayjs(data.post.inserted_at).fromNow()}
			{#if data.post.inserted_at !== data.post.updated_at}
			• Updated {dayjs(data.post.updated_at).fromNow()}
			{/if}
		</p>
		<Button variant="link" size="sm" href="/users/{data.post.author.id}">
			by
			{data.post.author.display_name}
		</Button>
	</div>
	{#if data.post.user_id === data.user?.id}
		<div
			class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
		>
			<Button variant="outline" href="/forum/{data.post.id}/edit">
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

<PostDeleteDialog postId={data.post.id} data={data.deleteForm} bind:open={openDeleteDialog} />
