<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import * as Select from '@/components/ui/select';
	import { updateUserTypesSchema, type UpdateUserTypesSchema } from '@/schemas/user-types';
	import { Loader2, X } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<UpdateUserTypesSchema>>;

	const form = superForm(data, {
		validators: zodClient(updateUserTypesSchema),
		taintedMessage: true,
		resetForm: false,
	});

	const { form: formData, enhance, submitting, isTainted, tainted } = form;

	$: selectedDefault = $formData.default
		? {
				value: $formData.default,
				label: $formData.default,
			}
		: undefined;

	function addType() {
		$formData.types = [...$formData.types, ''];

		tick().then(() => {
			const urlInputs = Array.from(
				document.querySelectorAll<HTMLElement>("#user-types-form input[name='types']")
			);
			const lastInput = urlInputs[urlInputs.length - 1];
			lastInput?.focus();
		});
	}

	$: if (!$formData.types.includes($formData.default)) {
		$formData.default = $formData.types[0];
	}
</script>

<form method="POST" action="?/updateUserTypes" use:enhance>
	<Card.Root id="user-types-form">
		<Card.Header>
			<Card.Title>Tipos de Utilizador</Card.Title>
			<Card.Description>Crie tipos para categorizar os utilizadores</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="max-w-2xl space-y-4">
				<div>
					<Form.Fieldset {form} name="types">
						<Form.Legend class="mb-1">Tipos*</Form.Legend>
						{#each $formData.types as _, i}
							<Form.ElementField {form} name="types[{i}]">
								<Form.Control let:attrs>
									<div class="flex flex-row">
										<Input {...attrs} bind:value={$formData.types[i]} />
										{#if $formData.types.length > 1}
											<Button
												variant="outline"
												size="icon"
												class="ml-2"
												on:click={() => {
													$formData.types = $formData.types.filter((_, index) => index !== i);
												}}
											>
												<X class="h-4 w-4" />
											</Button>
										{/if}
									</div>
								</Form.Control>
								<Form.FieldErrors />
							</Form.ElementField>
						{/each}
						<Form.FieldErrors />
					</Form.Fieldset>
					<Button type="button" variant="outline" size="sm" class="mt-2" on:click={addType}>
						Adicionar Tipo
					</Button>
				</div>
				<Form.Field {form} name="default">
					<Form.Control let:attrs>
						<Form.Label>Tipo Padrão*</Form.Label>
						<Select.Root
							{...attrs}
							selected={selectedDefault}
							onSelectedChange={(v) => {
								if (v) {
									$formData.default = v.value;
								}
							}}
						>
							<Select.Trigger {...attrs}>
								<Select.Value placeholder="Select" />
							</Select.Trigger>
							<Select.Content>
								{#each $formData.types as type}
									<Select.Item value={type} label={type} />
								{/each}
							</Select.Content>
						</Select.Root>
						<input type="hidden" name="default" value={$formData.default} />
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
