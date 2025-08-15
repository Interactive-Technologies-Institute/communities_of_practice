<script lang="ts">
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import * as Form from '@/components/ui/form';
	import { Switch } from '@/components/ui/switch';
	import { updateFeaturesSchema, type UpdateFeaturesSchema } from '@/schemas/features';
	import { Loader2 } from 'lucide-svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<UpdateFeaturesSchema>>;

	const form = superForm(data, {
		validators: zodClient(updateFeaturesSchema),
		taintedMessage: true,
		resetForm: false,
	});

	const { form: formData, enhance, isTainted, tainted, submitting } = form;
</script>

<form method="POST" action="?/updateFeatures" use:enhance>
	<Card.Root>
		<Card.Header>
			<Card.Title>Funcionalidades</Card.Title>
			<Card.Description>Ativar ou desativar funcionalidades da plataforma</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="max-w-2xl space-y-4">
				<Form.Field
					{form}
					name="guides"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Guias</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para permitir que os utilizadores criem e partilhem guias.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.guides} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="events"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Eventos</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para permitir que os utilizadores criem e partilhem eventos.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.events} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="map"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Mapa</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para criar um mapa da sua comunidade.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.map} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="forum_threads"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Fórum</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para permitir que os utilizadores criem tópicos de discussão.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.forum_threads} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="contents"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Conteúdos</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para permitir que os utilizadores criem conteúdos.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.contents} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="users"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Membros</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para visualizar todos os membros da comunidade.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.users} />
					</Form.Control>
				</Form.Field>
				<Form.Field
					{form}
					name="docs"
					class="flex flex-row items-center justify-between rounded-lg border p-4"
				>
					<Form.Control let:attrs>
						<div class="space-y-0.5">
							<Form.Label>Docs</Form.Label>
							<Form.Description>
								Ative esta funcionalidade para criar e partilhar documentação.
							</Form.Description>
						</div>
						<Switch includeInput {...attrs} bind:checked={$formData.docs} />
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
