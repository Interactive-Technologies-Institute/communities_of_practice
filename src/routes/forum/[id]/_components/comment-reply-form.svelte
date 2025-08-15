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
	import { createThreadCommentSchema, type CreateThreadCommentSchema } from '@/schemas/thread-comment';
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

	export let data: SuperValidated<Infer<CreateThreadCommentSchema>>;
	export let parentId: number | null = null;
    export let open: boolean;

	const form = superForm(data, {
		validators: zodClient(createThreadCommentSchema),
		taintedMessage: true,
		onResult({ result }) {
			if (result.type === 'success') {
				open = false;
			}
		}
	});

	const { form: formData, enhance, submitting } = form;

	$: isSubmitEnabled = $formData.content.length >= 1 && $formData.content.length <= 5000;
</script>

<form method="POST" enctype="multipart/form-data" action="?/createThreadComment" use:enhance class="flex flex-col gap-y-10">
	<input type="hidden" name="parent_id" value={parentId ?? ''} />
	<Card.Root>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="content">
				<Form.Control let:attrs>
					<Form.Label>Escreve uma resposta</Form.Label>
					<Textarea {...attrs} class="w-full rounded border px-3 py-2 text-sm max-h-48 overflow-auto" bind:value={$formData.content} />
					<p class="text-xs mt-1 text-muted-foreground">
						{$formData.content.length} / 5000 caracteres
					</p>
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<Button type="button" variant="outline" on:click={() => (open = false)}>Cancelar</Button>
			<Button type="submit" disabled={$submitting || !isSubmitEnabled}>
				{#if $submitting}
					<Loader2 class="h-4 w-4 animate-spin" />
				{/if}
				Submeter
			</Button>
		</Card.Content>
	</Card.Root>
</form>
