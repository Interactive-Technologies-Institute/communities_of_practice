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
	import { FileImage, FileSpreadsheet, FileVideo, FileJson, FileText, File as FileIcon, FileAudio, FileArchive, FileType2, Presentation, Eye} from 'lucide-svelte';
	import { superForm, fileProxy, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import type { CreateContentSchema, EditContentSchema } from '@/schemas/content';
	import type { ZodSchema } from 'zod';
	import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
	import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
	import * as mammoth from "mammoth";
	import * as XLSX from 'xlsx';
	import JSZip from 'jszip';


	GlobalWorkerOptions.workerSrc = workerUrl;

	export let contentForm: SuperValidated<Infer<CreateContentSchema>> | SuperValidated<Infer<EditContentSchema>>;
	export let schema: ZodSchema;
	export let contentId: number = -1;
	export let showAnnexesButton: boolean = false;

	const form = superForm(contentForm, {
		validators: zodClient(schema),
		taintedMessage: true
	});

	const { form: formData, enhance, submitting } = form;

	const currentMimeType = $formData.mime_type??null;
	const currentFileUrl = $formData.fileUrl??'';
	const isEdit = !!$formData.fileUrl;

	let loadingDescription = false;
	let loadingTags = false;
	const file = fileProxy(form, 'file');

	$: if ($file.length > 0) {
		const f = $file.item(0);
		if (f?.type && f !== null) {
			$formData.mime_type = f.type;
		}
	}

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


	async function extractPdfText(file: File): Promise<string> {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await getDocument({ data: arrayBuffer }).promise;

		let text = '';
		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);
			const content = await page.getTextContent();
			text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
		}
		return text;
	}
	
	async function extractDocxText(file: File): Promise<string> {
		const arrayBuffer = await file.arrayBuffer();
		const { value } = await mammoth.extractRawText({ arrayBuffer });
		return value;
	}

	async function extractSpreadsheetText(file: File): Promise<string> {
		const arrayBuffer = await file.arrayBuffer();
		const workbook = XLSX.read(arrayBuffer, { type: 'array' });
		let text = '';

		workbook.SheetNames.forEach(name => {
			const sheet = workbook.Sheets[name];
			text += XLSX.utils.sheet_to_txt(sheet) + '\n';
		});

		return text;
	}

	function getTextFromNodes(node: Document, tagName: string, namespaceURI: string): string {
		let text = '';
		const textNodes = node.getElementsByTagNameNS(namespaceURI, tagName);
		for (let i = 0; i < textNodes.length; i++) {
			text += textNodes[i].textContent + ' ';
		}
		return text.trim();
	}

	async function extractPptxText(file: File): Promise<string> {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(arrayBuffer);
			const aNamespace = "http://schemas.openxmlformats.org/drawingml/2006/main";

			let text = '';
			let slideIndex = 1;

			while (true) {
				const slideFile = zip.file(`ppt/slides/slide${slideIndex}.xml`);
				if (!slideFile) break;

				const xmlStr = await slideFile.async('text');
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');

				text += getTextFromNodes(xmlDoc, "t", aNamespace) + '\n\n';
				slideIndex++;
			}

			return text.trim();
		} catch (err) {
			console.error('Error extracting text from PPTX:', err);
			return '';
		}
	}
	
	async function getFileContent(file: File): Promise<[string, string] | null> {
		const mimeType = file.type;

		// PDF
		if (mimeType === 'application/pdf') {
			const text = await extractPdfText(file);
			if (text.length < 5) return null; // When extraction does not work properly
			return [text, "PDF"];
		}

		// DOCX
		if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
			const text = await extractDocxText(file);
			if (text.length < 5) return null; // When extraction does not work properly
			return [text, "DOCX"];
		}

		// Plain Text / CSV / Markdown / JSON
		if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'text/markdown' || mimeType === 'application/json') {
			const text = await file.text();
			if (text.length < 5) return null; // When extraction does not work properly
			if (mimeType === 'text/markdown') return [text, "Markdown"];
			if (mimeType === 'text/csv') return [text, "CSV"];
			if (mimeType === 'application/json') return [text, "JSON"];
			return [text, "Plain Text"];
		}

		// EXCEL
		if (mimeType === 'application/vnd.ms-excel' ||
			mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			const text = await extractSpreadsheetText(file);
			if (text.length < 5) return null; // When extraction does not work properly
			return [text, "Excel"];
		}

		// PPTX
		if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
			const text = await extractPptxText(file);
			if (text.length < 5) return null; // When extraction does not work properly
			return [text, "PowerPoint"];
		}
		// Unknown
		return null;
	}

	async function generateFileDescription(content: string, type: string): Promise<string | null> {
		try {
			const response = await fetch('/api/description-ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content, type }) 
			});

			return await response.json();

		} catch (error) {
			console.error('Error generating description:', error);
			return null;
		}
	}

	async function generateTags(content: string): Promise<string[] | null> {
		try {
			const response = await fetch('/api/tags-ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content })
			});

			return await response.json();
		} catch (error) {
			console.error('Error generating tags:', error);
			return null;
		}
	}

	async function handleGenerateDescription() {
		loadingDescription = true;
		const fileToDescribe = $file.item(0);

		if (fileToDescribe) {
			const content = await getFileContent(fileToDescribe);
			if (!content) {
				console.warn('Unsupported file.');
				$formData.description = 'Unsupported file.';
				loadingDescription = false;
				return;
			}
			const description = await generateFileDescription(content[0], content[1]);
			if (!description) {
				$formData.description = 'Failed to generate description. File may be too large or unsupported.';
			} else {
				$formData.description = description;
			}

			console.log('Description result:', description);
		} else {
			console.warn('No file provided to generate description.');
		}
		loadingDescription = false;
	}

	async function handleGenerateTags() {
		loadingTags = true;

		const fileToDescribe = $file.item(0);

		if (fileToDescribe) {
			const content = await getFileContent(fileToDescribe);
			if (!content) {
				console.warn('Unsupported file.');
				$formData.tags = ['unsupported-file'];
				loadingTags = false;
				return;
			}
			const tags = await generateTags(content[0]);
			if (tags) {
				$formData = {
					...$formData,
					tags
				};
			}
		} else {
			console.warn('No file provided to generate description.');
		}

		loadingTags = false;
	}
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col gap-y-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Carregar Conteúdo</Card.Title>
			<Card.Description>Preenche os detalhes e carrega o teu ficheiro</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="title">
				<Form.Control let:attrs>
					<Form.Label>Título*</Form.Label>
					<Input {...attrs} bind:value={$formData.title} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="file">
				<Form.Control let:attrs>
					<Form.Label>{isEdit ? 'Carregar Ficheiro Novo' : 'Carregar Ficheiro*'}</Form.Label>
					<FileInput {...attrs} bind:files={$file} />
					<input hidden value={$formData.fileUrl} name="fileUrl" />
					<input hidden value={$formData.mime_type} name="mime_type" />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control let:attrs>
					<Form.Label class="flex items-center justify-between"
						>Descrição*
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateDescription}
							disabled={loadingDescription || !$file.length}
						>
							{#if loadingDescription}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								Gerar por IA
							{/if}
						</Button>
					</Form.Label>
					<Textarea {...attrs} bind:value={$formData.description} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="tags">
				<Form.Control let:attrs>
					<Form.Label class="flex justify-between items-center">
						Etiquetas*
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateTags}
							disabled={loadingTags || !$file.length}
						>
							{#if loadingTags}
								<Loader2 class="h-4 w-4 animate-spin" />
							{:else}
								Gerar por IA
							{/if}
						</Button>
					</Form.Label>
					<TagInput {...attrs} bind:value={$formData.tags} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			{#if isEdit}
				<div class="space-y-2">
					<h3 class="text-sm font-medium">Ficheiro Atual</h3>
					<div class="flex flex-row items-center gap-4">
						<div class="flex flex-col items-center">
							<svelte:component
								this={getFileIcon(currentMimeType)}
								class="h-10 w-10 text-muted-foreground"
							/>
							<Badge class="mt-1 px-1.5 py-0.5 text-[10px] font-normal">
								{fileTypeDisplay(currentMimeType)}
							</Badge>
						</div>
						<Button
							variant="ghost"
							size="sm"
							aria-label="View file"
							on:click={() => window.open(currentFileUrl, '_blank')}
							class="mt-1 self-start"
						>
							<Eye class="mr-1 h-4 w-4" />
							Visualizar
						</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<div
		class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<Button variant="outline" href="/contents">Cancelar</Button>
		{#if showAnnexesButton}
			<Button variant="outline" href={`/contents/${contentId}/annexes`} target="_blank" rel="noopener noreferrer">
				Anexos
			</Button>
		{/if}
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Submeter
		</Button>
	</div>
</form>
