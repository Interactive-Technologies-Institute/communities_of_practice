<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { toggleEventInterestSchema, type ToggleEventInterestSchema } from '@/schemas/event';
	import { cn } from '@/utils';
	import { ThumbsUp } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<ToggleEventInterestSchema>>;

	const form = superForm(data, {
		validators: zodClient(toggleEventInterestSchema),
		invalidateAll: 'force',
		onUpdate: ({ result }) => {
			if (result.type === 'failure') {
				$formData.value = !$formData.value;
			}
		},
	});

	const { form: formData, enhance, submit } = form;

	async function toggleInterest() {
		$formData.value = !$formData.value;
		await tick();
		submit();
	}
</script>

<form method="POST" action="?/toggleInterest" use:enhance>
	<input type="hidden" name="value" value={$formData.value} />
	<Button type="button" 
		on:click={toggleInterest}
		variant="ghost"
		size="sm"
		class={cn('flex items-center gap-2', $formData.value ? 'text-orange-500' : 'text-muted-foreground hover:text-foreground')}
	>
		<ThumbsUp class="h-4 w-4" />
		{#if $formData.value}
			Interested
		{:else}
			Interest
		{/if}
	</Button>
</form>
