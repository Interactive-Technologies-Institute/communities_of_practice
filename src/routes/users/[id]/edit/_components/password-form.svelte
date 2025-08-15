<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import { PasswordInput } from '@/components/ui/password-input';
	import { updatePasswordSchema, type UpdatePasswordSchema } from '@/schemas/password';
	import { Loader2 } from 'lucide-svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient, type Infer } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<UpdatePasswordSchema>>;

	const form = superForm(data, {
		validators: zodClient(updatePasswordSchema),
		taintedMessage: true,
	});

	const { form: formData, enhance, submitting, isTainted, tainted } = form;
</script>

<form method="POST" action="?/updatePassword" use:enhance>
	<Card.Root id="user-types-form">
		<Card.Header>
			<Card.Title>Alterar Palavra-passe</Card.Title>
			<Card.Description>Altera a tua palavra-passe</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="max-w-2xl space-y-4">
				<Form.Field {form} name="currentPassword">
					<Form.Control let:attrs>
						<Form.Label>Palavra-passe atual*</Form.Label>
						<PasswordInput {...attrs} bind:value={$formData.currentPassword} />
						<Form.FieldErrors />
					</Form.Control>
				</Form.Field>
				<Form.Field {form} name="newPassword">
					<Form.Control let:attrs>
						<Form.Label>Nova palavra-passe*</Form.Label>
						<PasswordInput {...attrs} bind:value={$formData.newPassword} />
						<Form.FieldErrors />
					</Form.Control>
				</Form.Field>
				<Form.Field {form} name="confirmNewPassword">
					<Form.Control let:attrs>
						<Form.Label>Confirma palavra-passe*</Form.Label>
						<PasswordInput {...attrs} bind:value={$formData.confirmNewPassword} />
						<Form.FieldErrors />
					</Form.Control>
				</Form.Field>
			</div>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" disabled={$submitting || !isTainted($tainted)}>
				{#if $submitting}
					<Loader2 class="h-4 w-4 animate-spin" />
				{/if}
				Guardar Configurações
			</Button>
		</Card.Footer>
	</Card.Root>
</form>
