<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { deleteContentSchema, type DeleteContentSchema } from '@/schemas/content';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let open = false;
	export let contentId: number;
	export let data: SuperValidated<Infer<DeleteContentSchema>>;

	const form = superForm(data, {
		validators: zodClient(deleteContentSchema),
	});

	const { enhance } = form;
</script>

<AlertDialog.Root bind:open>
	<form method="POST" action="?/delete" use:enhance class="hidden">
		<input type="hidden" name="id" value={contentId} />
	</form>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete this content and remove its data
				from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={form.submit}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
