<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { toggleThreadLikeSchema, type ToggleThreadLikeSchema } from '@/schemas/thread';
	import { cn } from '@/utils';
	import { ThumbsUp } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<ToggleThreadLikeSchema>>;

	const form = superForm(data, {
		validators: zodClient(toggleThreadLikeSchema),
		invalidateAll: 'force',
		onUpdate: ({ result }) => {
			if (result.type === 'failure') {
				$formData.value = !$formData.value;
			}
		},
	});

	const { form: formData, enhance, submit } = form;

	async function toggleLike() {
		$formData.value = !$formData.value;
		await tick();
		submit();
	}
</script>

<form method="POST" action="?/toggleLike" use:enhance>
	<input type="hidden" name="value" value={$formData.value} />
	<Button
		type="button"
		on:click={toggleLike}
		variant="ghost"
		size="sm"
		class={cn('flex items-center gap-2', $formData.value ? 'text-orange-500' : 'text-muted-foreground hover:text-foreground')}
	>
		<ThumbsUp class="h-4 w-4" />
		{#if $formData.value}
			Liked
		{:else}
			Like
		{/if}
	</Button>

</form>
