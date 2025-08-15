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
			<AlertDialog.Title>Tens a certeza absoluta?</AlertDialog.Title>
			<AlertDialog.Description>
				Esta ação não pode ser anulada. Isto vai apagar permanentemente este conteúdo e remover os respetivos dados dos nossos servidores.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
			<AlertDialog.Action on:click={form.submit}>Continuar</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
