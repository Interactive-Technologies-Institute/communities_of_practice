<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Button } from '@/components/ui/button';
	import dayjs from 'dayjs';
	import { Calendar, MapPin, Pen, Tag, Trash, Download } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ContentDeleteDialog from './_components/content-delete-dialog.svelte';
	import { cn } from '@/utils';
    import { page } from '$app/stores';
	import ContentDownloadButton from '../_components/content-download-button.svelte';

	export let data;

	let openDeleteDialog = false;
</script>

<MetaTags
	title={data.content.title}
	description={data.content.description}
	openGraph={{
		title: data.content.title,
		description: data.content.description,
	}}
	twitter={{
		cardType: 'summary_large_image',
		title: data.content.title,
		description: data.content.description,
	}}
/>

<div class="container mx-auto max-w-3xl mt-10 space-y-10 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<Card class="mx-auto p-2 space-y-4">
		<div class="flex flex-1 flex-col px-4 py-3">
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3">{data.content.title}</h1>
			<p class="whitespace-pre-wrap break-words mb-3 mt-3">{data.content.description}</p>
			{#if data.downloadForm.data.value}
				<div class="text-base text-muted-foreground">
					<span>You’ve already downloaded this file.</span>
				</div>
			{/if}
			<div class="text-base text-muted-foreground flex flex-wrap items-center justify-between w-full">
				<span>{data.downloadCount + ' members downloaded'}</span>
				<div class="flex items-center gap-3 flex-wrap">
					{#each data.content.tags as tag}
						<a href={`/contents?tags=${tag}`} class="flex items-center gap-1 hover:underline">
							<Tag class="h-4 w-4" />
							<span>{tag}</span>
						</a>
					{/each}
				</div>
			</div>
			<div class="mt-4 flex items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
				<div class="flex gap-4">
					<ContentDownloadButton data={data.downloadForm} />
				</div>
				{#if data.content.user_id === data.user?.id}
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" href="/contents/{data.content.id}/edit" class="text-blue-500 gap-2 hover:text-blue-600">
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
		
	</div>
</div>

<ContentDeleteDialog contentId={data.content.id} data={data.deleteForm} bind:open={openDeleteDialog} />
