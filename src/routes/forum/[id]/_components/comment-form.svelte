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

	const form = superForm(data, {
		validators: zodClient(createThreadCommentSchema),
		taintedMessage: true,
	});

	const { form: formData, enhance, submitting } = form;

	$: isSubmitEnabled = $formData.content.length >= 1 && $formData.content.length <= 5000;
</script>

<form method="POST" enctype="multipart/form-data" action="?/createThreadComment" use:enhance class="flex flex-col gap-y-10">
	<Card.Root>
		<Card.Content class="space-y-2">
			<Form.Field {form} name="content">
				<Form.Control let:attrs>
					<Textarea {...attrs} class="w-full rounded border mt-4 px-3 py-2 text-sm max-h-48 overflow-auto" bind:value={$formData.content} />
					<p class="text-xs mt-1 text-muted-foreground">
						{$formData.content.length} / 5000 characters
					</p>
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<div class="flex justify-center">
				<Button type="submit" disabled={$submitting || !isSubmitEnabled}>
					{#if $submitting}
						<Loader2 class="h-4 w-4 animate-spin mr-2" />
					{/if}
					Submit
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
