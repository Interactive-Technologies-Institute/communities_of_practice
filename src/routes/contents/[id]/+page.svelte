<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import ModerationBanner from '@/components/moderation-banner.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import Card from '@/components/ui/card/card.svelte';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import dayjs from 'dayjs';
	import { Tag, FileImage, FileVideo, FileText, File, FileAudio, FileArchive, FileType2, Pen, Trash } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ContentDeleteDialog from './_components/content-delete-dialog.svelte';
	import { cn } from '@/utils';
    import { page } from '$app/stores';
	import ContentDownloadButton from '../_components/content-download-button.svelte';

	export let data;

	function getFileIcon(mimeType: string | null) {
		if (!mimeType) return File;
		if (mimeType.startsWith('image/')) return FileImage;
		if (mimeType.startsWith('video/')) return FileVideo;
		if (mimeType === 'application/pdf') return FileText;
		if (mimeType.startsWith('audio/')) return FileAudio;
		if (mimeType.includes('zip') || mimeType.includes('compressed')) return FileArchive;
		if (mimeType === 'text/plain') return FileText;
		return FileType2;
	}

	function fileTypeDisplay(mimeType: string | null): string {
		if (!mimeType) return 'File';
		if (mimeType.startsWith('image/')) return 'Image';
		if (mimeType.startsWith('video/')) return 'Video';
		if (mimeType.startsWith('audio/')) return 'Audio';
		if (mimeType.startsWith('text/'))  return 'Text';

		switch (mimeType) {
			case 'application/pdf':
				return 'PDF';
			case 'application/zip':
			case 'application/x-7z-compressed':
			case 'application/x-rar-compressed':
			case 'application/x-tar':
				return 'Archive';
			case 'application/json':
				return 'JSON';
			case 'application/msword':
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				return 'Word Doc';
			case 'application/vnd.ms-excel':
			case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				return 'Spreadsheet';
			default:
				return 'File';
		}
	}

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

<div class="container mx-auto max-w-4xl mt-10 space-y-6 pb-10">
	{#if data.moderation[0].status !== 'approved'}
		<ModerationBanner moderation={data.moderation} />
	{/if}
	<Card class="mx-auto p-2 space-y-4">
		<div class="flex flex-1 flex-col px-4 py-3">
			<h1 class="text-2xl font-bold tracking-tight text-foreground mb-3 break-words">
				{data.content.title}
			</h1>
			<div class="flex justify-between gap-6">
				<p class="whitespace-pre-wrap min-w-0 break-words">
					{data.content.description}
				</p>
				<div class="flex flex-col items-center">
					<svelte:component
						this={getFileIcon(data.content.mime_type)}
						class="h-32 w-32 text-muted-foreground"
					/>
					<Badge class="mt-1 text-[15px] font-normal px-1.5 py-0.5">
						{fileTypeDisplay(data.content.mime_type)}
					</Badge>
				</div>
			</div>
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
	<div class="mx-auto flex flex-col gap-y-6 mt-6">
		
	</div>
</div>

<ContentDeleteDialog contentId={data.content.id} data={data.deleteForm} bind:open={openDeleteDialog} />
