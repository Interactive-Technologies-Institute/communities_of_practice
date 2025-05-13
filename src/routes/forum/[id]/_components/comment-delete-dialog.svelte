<script lang="ts">
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import { deleteThreadCommentSchema, type DeleteThreadCommentSchema } from '@/schemas/thread-comment';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let open = false;
	export let commentId: number;
	export let data: SuperValidated<Infer<DeleteThreadCommentSchema>>;

	const form = superForm(data, {
		validators: zodClient(deleteThreadCommentSchema),
	});

	const { enhance } = form;
</script>

<AlertDialog.Root bind:open>
	<form method="POST" action="?/deleteThreadComment" use:enhance class="hidden">
		<input type="hidden" name="id" value={commentId} />
	</form>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete this comment and remove its data
				from our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={form.submit}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
