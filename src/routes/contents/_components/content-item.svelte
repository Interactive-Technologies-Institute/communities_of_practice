<script lang="ts">
	import { page } from '$app/stores';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { Content } from '@/types/types';
	import { Tag, FileImage, FileVideo, FileText, File, FileAudio, FileArchive, FileType2, Download } from 'lucide-svelte';

	export let content: Content;

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

	async function handleDownload(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		const { data, error } = await $page.data.supabase.storage.from('contents').download(content.file);

		if (error) {
			console.error('Download failed:', error.message);
			alert('Could not download file.');
			return;
		}
		const url = URL.createObjectURL(data);
		const a = Object.assign(document.createElement('a'), {
			href: url,
			download: content.file
		});
		a.click();
		URL.revokeObjectURL(url);
	}

</script>

<a href="/contents/{content.id}" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<svelte:component this={getFileIcon(content.mime_type)} class="h-8 w-8 text-muted-foreground" />
					<p class="text-sm font-medium">{content.title}</p>
					<Badge class="text-[10px] font-normal px-1.5 py-0.5">
						{fileTypeDisplay(content.mime_type)}
					</Badge>
				</div>
				<div class="flex items-center gap-2">
					<p class="text-xs text-muted-foreground">{"Inserted at " + new Date(content.inserted_at).toLocaleDateString()}</p>
					<Button variant="ghost" size="sm" on:click={handleDownload} aria-label="Download">
						<Download class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</Card>
</a>

