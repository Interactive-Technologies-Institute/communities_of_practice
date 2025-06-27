<script lang="ts">
	import InteractableImage from '@/components/interactable-image.svelte';
	import { Button, buttonVariants } from '@/components/ui/button';
	import { Calendar } from '@/components/ui/calendar';
	import * as Card from '@/components/ui/card';
	import { FileInput } from '@/components/ui/file-input';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import * as Popover from '@/components/ui/popover';
	import { TagInput } from '@/components/ui/tag-input';
	import { Textarea } from '@/components/ui/textarea';
	import { createThreadSchema, type CreateThreadSchema } from '@/schemas/thread';
	import { cn } from '@/utils';
	import {
		DateFormatter,
		getLocalTimeZone,
		parseAbsolute,
		type DateValue,
	} from '@internationalized/date';
	import { CalendarIcon, Loader2 } from 'lucide-svelte';
	import { fileProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';
	import { OpenAI } from 'openai';

	export let data: SuperValidated<Infer<CreateThreadSchema>>;

	const form = superForm(data, {
		validators: zodClient(createThreadSchema),
		taintedMessage: true,
	});

	const { form: formData, enhance, submitting } = form;

	const image = fileProxy(form, 'image');
	let imageUrl: string | null | undefined = $formData.imageUrl;
	$: {
		if ($image.length > 0) {
			const img = $image.item(0);
			const reader = new FileReader();
			reader.onload = (e) => {
				imageUrl = e.target?.result as string | null | undefined;
			};
			reader.readAsDataURL(img!);
		} else {
			imageUrl = $formData.imageUrl;
		}
	}

	const openai = new OpenAI({ apiKey: PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true});

	let loadingTags = false;
	let loadingSummary = false;

	async function generateSummary(content: string): Promise<string | null> {
		try {
			const response = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'You are an assistant that reduces/summarizes forum threads on a platform for communities of practice clearly and concisely.'
					},
					{
						role: 'user',
						content: `Summarize the following thread content:\n\n${content}`
					}
				],
				temperature: 0.7,
				max_tokens: 300
			});

			return response.choices[0]?.message?.content?.trim() ?? null;

		} catch (error) {
			console.error('Error generating summary:', error);
			return null;
		}
	}

	async function generateTags(content: string): Promise<string[] | null> {
	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: 'You are an assistant that suggests useful tags for discussion forum threads.'
				},
				{
					role: 'user',
					content: `Return a maximum of 5 unique tags (each between 3 and 30 characters, including spaces) that represent the following thread content as a JSON array of strings. Example: ["tag1", "tag2"]\n\nContent:\n${content}`
				}
			],
			temperature: 0.7,
			max_tokens: 100
		});

		const generated = response.choices[0]?.message?.content?.trim();
		if (!generated) return null;

		const tags: string[] = JSON.parse(generated);
		if (Array.isArray(tags)) return tags;

		return null;
	} catch (error) {
		console.error('Error generating tags:', error);
		return null;
	}
}

	async function handleGenerateSummary() {
		loadingSummary = true;

		const summary = await generateSummary($formData.content);

		if (summary) {
			$formData = {
				...$formData,
				summary
			};
		}

		loadingSummary = false;
	}

	async function handleGenerateTags() {
		loadingTags = true;

		const tags = await generateTags($formData.content);

		if (tags) {
			$formData = {
				...$formData,
				tags
			};
		}

		loadingTags = false;
	}

</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="flex flex-col gap-y-10">
	<Card.Root>
		<Card.Header>
			<Card.Title>Information</Card.Title>
			<Card.Description>Add details to this thread</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="title">
				<Form.Control let:attrs>
					<Form.Label>Title*</Form.Label>
					<Input {...attrs} bind:value={$formData.title} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="content">
				<Form.Control let:attrs>
					<Form.Label>Content*</Form.Label>
					<Textarea {...attrs} bind:value={$formData.content} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="tags">
				<Form.Control let:attrs>
					<Form.Label class="flex justify-between items-center">
						Tags*
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateTags}
							disabled={loadingTags}
						>
							{#if loadingTags}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								Generate Tags
							{/if}
						</Button>
					</Form.Label>
					<TagInput {...attrs} bind:value={$formData.tags} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Form.Field {form} name="summary">
				<Form.Control let:attrs>
					<Form.Label class="flex justify-between items-center">
						Summary
						<Button
							type="button"
							size="sm"
							on:click={handleGenerateSummary}
							disabled={loadingSummary}
						>
							{#if loadingSummary}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{:else}
								Generate Summary
							{/if}
						</Button>
					</Form.Label>
					<Textarea {...attrs} bind:value={$formData.summary} disabled={loadingSummary} />
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
				<Form.Field {form} name="image">
					<Form.Control let:attrs>
						<Form.Label>Image</Form.Label>
						<Card.Root class="aspect-[3/2] overflow-hidden">
							{#if imageUrl}
								<InteractableImage
									src={imageUrl}
									alt="Thread Image"
									class="h-full w-full object-cover"
								/>
							{/if}
						</Card.Root>
						<FileInput {...attrs} bind:files={$image} accept="image/*" />
						<input hidden value={$formData.imageUrl} name="imageUrl" />
						<Form.FieldErrors />
					</Form.Control>
				</Form.Field>
			</div>
		</Card.Content>
	</Card.Root>
	<div
		class="sticky bottom-0 flex w-full flex-row items-center justify-center gap-x-10 border-t bg-background/95 py-8 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<Button variant="outline" href="/forum">Cancel</Button>
		<Button type="submit" disabled={$submitting}>
			{#if $submitting}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Submit
		</Button>
	</div>
</form>
