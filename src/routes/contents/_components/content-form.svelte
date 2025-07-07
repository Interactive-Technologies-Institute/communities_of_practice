<script lang="ts">
	import { FileInput } from '@/components/ui/file-input';
	import { Input } from '@/components/ui/input';
	import { Textarea } from '@/components/ui/textarea';
	import { Button } from '@/components/ui/button';
	import * as Form from '@/components/ui/form';
	import * as Card from '@/components/ui/card';
	import { TagInput } from '@/components/ui/tag-input';
	import { Loader2 } from 'lucide-svelte';

	import { superForm, fileProxy, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';
	import { createContentSchema, type CreateContentSchema } from '@/schemas/content';

	export let data: SuperValidated<Infer<CreateContentSchema>>;
	const form = superForm(data, {
		validators: zodClient(createContentSchema),
		taintedMessage: true
	});

	const { form: formData, enhance, submitting } = form;

	const file = fileProxy(form, 'file');

	$: {if ($file.length) {
			const f = $file.item(0);
			$formData = { ...$formData, mimeType: f?.type ?? '' };
		} else {
			$formData = { ...$formData, mimeType: '' };
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
			<Form.Field {form} name="file">
				<Form.Control let:attrs>
					<Form.Label>Upload File*</Form.Label>
					<FileInput {...attrs} bind:files={$file} />
                    <input hidden value={$formData.fileUrl} name="fileUrl" />
					<input hidden value={$formData.mimeType} name="mimeType" />
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
