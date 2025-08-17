<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import { Textarea } from '@/components/ui/textarea';
	import { createThreadCommentSchema, type CreateThreadCommentSchema } from '@/schemas/thread-comment';
	import { Loader2 } from 'lucide-svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
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
						{$formData.content.length} / 5000 caracteres
					</p>
					<Form.FieldErrors />
				</Form.Control>
			</Form.Field>
			<div class="flex justify-center">
				<Button type="submit" disabled={$submitting || !isSubmitEnabled}>
					{#if $submitting}
						<Loader2 class="h-4 w-4 animate-spin mr-2" />
					{/if}
					Submeter
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</form>
