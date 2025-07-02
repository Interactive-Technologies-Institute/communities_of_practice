<script lang="ts">
	import Logo from '@/components/logo.svelte';
	import ThemeWrapper from '@/components/theme-wrapper.svelte';
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import { FileInput } from '@/components/ui/file-input';
	import * as Form from '@/components/ui/form';
	import { Input } from '@/components/ui/input';
	import { updateBrandingSchema, type UpdateBrandingSchema } from '@/schemas/branding';
	import { themes } from '@/themes';
	import { cn } from '@/utils';
	import { Check, Loader2 } from 'lucide-svelte';
	import { mode } from 'mode-watcher';
	import { fileProxy, superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<UpdateBrandingSchema>>;

	const form = superForm(data, {
		validators: zodClient(updateBrandingSchema),
		taintedMessage: true,
		resetForm: false,
	});

	const { form: formData, enhance, submitting, isTainted, tainted } = form;

	const logo = fileProxy(form, 'logo');
	let logoUrl: string | null | undefined = $formData.logoUrl;
	$: {
		if ($logo.length > 0) {
			const img = $logo.item(0);
			const reader = new FileReader();
			reader.onload = (e) => {
				logoUrl = e.target?.result as string | null | undefined;
			};
			reader.readAsDataURL(img!);
		} else {
			logoUrl = $formData.logoUrl;
		}
	}
</script>

<ThemeWrapper theme={$formData.color_theme} radius={$formData.radius}>
	<form method="POST" enctype="multipart/form-data" action="?/updateBranding" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Branding</Card.Title>
				<Card.Description>Configure the platform branding</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="max-w-2xl space-y-4">
					<Form.Field {form} name="name">
						<Form.Control let:attrs>
							<Form.Label>Name*</Form.Label>
							<Input {...attrs} bind:value={$formData.name} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="slogan">
						<Form.Control let:attrs>
							<Form.Label>Slogan*</Form.Label>
							<Input {...attrs} bind:value={$formData.slogan} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="logo">
						<Form.Control let:attrs>
							<Form.Label>Logo</Form.Label>
							<Card.Root class="flex aspect-[3/2] items-center justify-center">
								{#if logoUrl}
									<Logo {logoUrl} class="h-20 w-20" />
								{/if}
							</Card.Root>
							<FileInput {...attrs} bind:files={$logo} accept="image/*" />
							<input hidden value={$formData.logoUrl} name="logoUrl" />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="color_theme">
						<Form.Control let:attrs>
							<Form.Label>Color Theme*</Form.Label>
							<div class="grid grid-cols-2 gap-2 md:grid-cols-3">
								{#each themes as theme (theme.name)}
									{@const isActive = $formData.color_theme === theme.name}
									<Button
										variant="outline"
										size="sm"
										on:click={() => {
											$formData.color_theme = theme.name;
										}}
										class={cn('justify-start', isActive && 'border-2 border-primary')}
										style="--theme-primary: hsl({theme.activeColor[$mode ?? 'dark']})"
									>
										<span
											class="mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]"
										>
											{#if isActive}
												<Check class="h-4 w-4 text-white" />
											{/if}
										</span>
										{theme.label}
									</Button>
								{/each}
							</div>
							<input {...attrs} hidden bind:value={$formData.color_theme} />
							<Form.FieldErrors />
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="radius">
						<Form.Control let:attrs>
							<Form.Label>Radius*</Form.Label>
							<div class="grid grid-cols-5 gap-2">
								{#each ['0', '0.3', '0.5', '0.75', '1.0'] as value, _ (value)}
									{@const valueFloat = Number.parseFloat(value)}
									<Button
										variant="outline"
										size="sm"
										on:click={() => {
											$formData.radius = valueFloat;
										}}
										class={cn($formData.radius === valueFloat && 'border-2 border-primary')}
									>
										{value}
									</Button>
								{/each}
							</div>
							<input {...attrs} hidden bind:value={$formData.radius} />
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
					Save Settings
				</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</ThemeWrapper>
