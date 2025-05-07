<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { togglePostLikeSchema, type TogglePostLikeSchema } from '@/schemas/post';
	import { cn } from '@/utils';
	import { ThumbsUp } from 'lucide-svelte';
	import { tick } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let count: number;
	export let data: SuperValidated<Infer<TogglePostLikeSchema>>;

	const form = superForm(data, {
		validators: zodClient(togglePostLikeSchema),
		invalidateAll: 'force',
		onUpdate: ({ result }) => {
			if (result.type === 'failure') {
				$formData.value = !$formData.value;
				count += $formData.value ? 1 : -1;
			}
		},
	});

	const { form: formData, enhance, submit } = form;

	async function toggleLike() {
		$formData.value = !$formData.value;
		count += $formData.value ? 1 : -1;
		await tick();
		submit();
	}
</script>

<form method="POST" action="?/toggleLike" use:enhance>
	<input type="hidden" name="value" value={$formData.value} />
	<Button type="button" on:click={toggleLike} variant="outline" size="sm">
		<ThumbsUp class={cn('mr-2 h-4 w-4', { 'fill-foreground': $formData.value })} />
		{#if $formData.value}
			Liked this post
		{:else}
			Like this post
		{/if}
		<span class="ml-4 font-mono text-xs">{count}</span>
	</Button>
</form>
