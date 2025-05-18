<script lang="ts">
    import { Button } from '@/components/ui/button';
    import { toggleThreadCommentLikeSchema, type ToggleThreadCommentLikeSchema } from '@/schemas/thread-comment';
    import { cn } from '@/utils';
    import { ThumbsUp } from 'lucide-svelte';
    import { tick } from 'svelte';
    import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';

    export let count: number;
    export let data: SuperValidated<Infer<ToggleThreadCommentLikeSchema>>;
		
	// Local state for optimistic UI updates
    let localCount = count;
    let localLiked = data.data?.value ?? false;
    let submitting = false;
    // Whenever not submitting, sync local state with latest props from parent
    $: if (!submitting) {
        localCount = count;
        localLiked = data.data?.value ?? false;
    }

    const form = superForm(data, {
        validators: zodClient(toggleThreadCommentLikeSchema),
        invalidateAll: 'force',
        onUpdate: ({ result }) => {
            submitting = false; // After server responds, allow new submissions
        }
    });

    const { form: formData, enhance, submit } = form;

    async function toggleLike() {
        if (submitting) return; // Prevent double clicks
        submitting = true;
        localLiked = !localLiked;
		// Only allow 1 like per user, never negative
        localCount = localLiked ? count + 1 : Math.max(0, count - 1);
        $formData.value = localLiked;
        await tick();
        submit();
    }
</script>

<form method="POST" action="?/toggleCommentLike" use:enhance>
    <input type="hidden" name="id" value={$formData.id} />
    <input type="hidden" name="value" value={localLiked} />
    <Button type="button" on:click={toggleLike} variant="outline" size="sm" disabled={submitting}>
        <ThumbsUp class={cn('mr-2 h-4 w-4', { 'fill-foreground': localLiked })} />
        {#if localLiked}
            Liked
        {:else}
            Like
        {/if}
        <span class="ml-4 font-mono text-xs">{localCount}</span>
    </Button>
</form>