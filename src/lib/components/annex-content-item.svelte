<script lang="ts">
	import { Badge } from '@/components/ui/badge';
	import { Card } from '@/components/ui/card';
	import type { ContentWithCounter } from '@/types/types';
	import dayjs from '$lib/dayjs';
	import { FileSpreadsheet, FileImage, FileVideo, Presentation, FileJson, FileText, File as FileIcon, FileAudio, FileArchive, FileType2, Download } from 'lucide-svelte';

	export let content: ContentWithCounter & { type: 'content' };
	export let selectedItems: { id: number; type: 'content' | 'event' | 'thread' }[];

	$: checked = selectedItems.some(s => s.id === content.id && s.type === 'content');

	function toggleCheckbox(event: Event) {
		event.stopPropagation();
		event.preventDefault();
		if (checked) {
			selectedItems = selectedItems.filter(s => !(s.id === content.id && s.type === 'content'));
		} else {
			selectedItems = [...selectedItems, { id: content.id, type: 'content' }];
		}
	}

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected',
	};

	function getFileIcon(mimeType: string | null) {
		if (!mimeType) return FileIcon;
		if (mimeType.startsWith('image/')) return FileImage;
		if (mimeType.startsWith('video/')) return FileVideo;
		if (mimeType === 'application/pdf' || mimeType === 'application/msword' ||
			mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
			mimeType === 'text/plain') return FileText;
		if (mimeType === 'application/json') return FileJson;
		if (mimeType.startsWith('audio/')) return FileAudio;
		if (mimeType.includes('zip') || mimeType === 'application/x-tar' ||
			mimeType.includes('compressed')) return FileArchive;
		if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			return FileSpreadsheet;
		if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
			return Presentation;

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
			case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
				return 'Presentation';
			case 'text/csv':
				return 'CSV';
			case 'text/markdown':
				return 'Markdown';
			default:
				return 'File';
		}
	}
</script>

<a href="/contents/{content.id}" target="_blank" rel="noopener noreferrer" class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<svelte:component this={getFileIcon(content.mime_type)} class="h-8 w-8 text-muted-foreground" />
					<p class="text-sm line-clamp-1 break-all font-medium">{content.title}</p>
					<Badge class="text-[10px] font-normal px-1.5 py-0.5">
						{fileTypeDisplay(content.mime_type)}
					</Badge>
					{#if content.moderation_status !== 'approved'}
						<Badge class="text-[10px] font-normal px-1.5 py-0.5"
							variant={content.moderation_status === 'rejected' ? 'destructive' : 'secondary'}
						>
							{moderationStatusLabels[content.moderation_status]}
						</Badge>
					{/if}
				</div>
				<div class="flex text-muted-foreground items-center gap-2 ml-2">
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{dayjs(`${content.inserted_at}`).format(
							dayjs(content.inserted_at).year() === dayjs().year()
								? 'DD/MM'
								: 'DD/MM/YYYY'
						)}</p>
					<Download class="h-4 w-4" />
					<p class="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
						{content.downloads_count}
					</p>
                    <input
                        type="checkbox"
                        value={content.id}
                        checked={checked}
						on:change={toggleCheckbox}
                        class="ml-2"
                    />
				</div>
			</div>
		</div>
	</Card>
</a>

