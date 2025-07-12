<script lang="ts">
	import { FileInput } from '@/components/ui/file-input';
	import { Input } from '@/components/ui/input';
	import { Textarea } from '@/components/ui/textarea';
	import { Button } from '@/components/ui/button';
	import { Badge } from '@/components/ui/badge';
	import * as Form from '@/components/ui/form';
	import * as Card from '@/components/ui/card';
	import { TagInput } from '@/components/ui/tag-input';
	import { Loader2 } from 'lucide-svelte';
	import { FileImage, FileVideo, FileText, File, FileAudio, FileArchive, FileType2, Eye} from 'lucide-svelte';
	import { superForm, fileProxy, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import type { CreateContentSchema, EditContentSchema } from '@/schemas/content';
	import type { ZodSchema } from 'zod';

	export let contentForm: SuperValidated<Infer<CreateContentSchema>> | SuperValidated<Infer<EditContentSchema>>;
	export let schema: ZodSchema;

	const form = superForm(contentForm, {
		validators: zodClient(schema),
		taintedMessage: true
	});

	const { form: formData, enhance, submitting } = form;

	const currentMimeType = $formData.mime_type??null;
	const currentFileUrl = $formData.fileUrl??'';
	const isEdit = !!$formData.fileUrl;

	const file = fileProxy(form, 'file');

	$: if ($file.length > 0) {
		const f = $file.item(0);
		if (f?.type && f !== null) {
			$formData.mime_type = f.type;
		}
	}

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
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col gap-y-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Upload Content</Card.Title>
			<Card.Description>Fill in details and upload your file</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="title">
				<Form.Control let:attrs>
					<Form.Label>Title*</Form.Label>
					<Input {...attrs} bind:value={$formData.title} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control let:attrs>
					<Form.Label>Description*</Form.Label>
					<Textarea {...attrs} bind:value={$formData.description} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="tags">
				<Form.Control let:attrs>
					<Form.Label>Tags*</Form.Label>
					<TagInput {...attrs} bind:value={$formData.tags} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			{#if isEdit}
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Current File</h3>
					<div class="flex flex-row items-center gap-4">
						<div class="flex flex-col items-center">
							<svelte:component
								this={getFileIcon(currentMimeType)}
								class="h-10 w-10 text-muted-foreground"
							/>
							<Badge class="mt-1 text-[10px] font-normal px-1.5 py-0.5">
								{fileTypeDisplay(currentMimeType)}
							</Badge>
						</div>
						<Button
							variant="ghost"
							size="sm"
							aria-label="View file"
							on:click={() => window.open(currentFileUrl, '_blank')}
							class="self-start mt-1"
						>
							<Eye class="h-4 w-4 mr-1" />
							View
						</Button>
					</div>
				</div>
			{/if}
			<Form.Field {form} name="file">
				<Form.Control let:attrs>
					<Form.Label>{isEdit ? 'Upload New File' : 'Upload File*'}</Form.Label>
					<FileInput {...attrs} bind:files={$file} />
                    <input hidden value={$formData.fileUrl} name="fileUrl" />
					<input hidden value={$formData.mime_type} name="mime_type" />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
		</Card.Content>
	</Card.Root>

    <div
		class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>		<Button variant="outline" href="/contents">Cancel</Button>
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Submit
		</Button>
	</div>
</form>
