<script lang="ts">
    import { Button } from '@/components/ui/button';
    import { toggleThreadCommentLikeSchema } from '@/schemas/thread-comment';
    import { cn } from '@/utils';
    import { ThumbsUp } from 'lucide-svelte';
    import { tick } from 'svelte';
    import { superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';

    export let commentId: number;
    export let isLiked: boolean;

    let isLikedLocal = isLiked;

    const form = superForm(
        { id: commentId, value: isLikedLocal },
        {
            validators: zodClient(toggleThreadCommentLikeSchema),
            invalidateAll: 'force',
        }
    );
    const { form: formData, enhance, submit } = form;

    async function toggleLike() {
        isLikedLocal = !isLikedLocal;
        $formData.value = isLikedLocal;
        await tick();
        await submit();
    }
</script>

<form method="POST" action="?/toggleCommentLike" use:enhance>
    <input type="hidden" name="id" value={commentId} />
    <input type="hidden" name="value" value={isLikedLocal} />
    <Button
        type="button"
        on:click={toggleLike}
        variant="ghost"
        size="sm"
        class={cn('flex items-center gap-2', isLikedLocal ? 'text-orange-500' : 'text-muted-foreground hover:text-foreground')}
    >
        <ThumbsUp class="h-4 w-4" />
        {#if isLikedLocal}
            Liked
        {:else}
            Like
        {/if}
    </Button>
</form>