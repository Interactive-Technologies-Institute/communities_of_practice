<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { ThreadCommentWithLikes } from '@/types/types';

	export let comment: ThreadCommentWithLikes;

	const moderationStatusLabels = {
		pending: 'Pending',
		approved: 'Approved',
		changes_requested: 'Changes Requested',
		rejected: 'Rejected'
	};

	$: updatedAt = comment?.updated_at
	? new Date(comment.updated_at).toLocaleString()
	: 'No updates yet';

</script>
<Card class="relative flex h-full flex-col overflow-hidden">
	<div class="flex flex-1 flex-col px-4 py-3">
		<div class="mb-5">
			<p class="line-clamp-2 text-muted-foreground whitespace-pre-wrap break-words">{comment.content}</p>
			<!--<p class="mt-2 text-sm text-muted-foreground">Updated at: {updatedAt}</p>-->
			<div class="flex flex-wrap gap-2">
				<Button variant="secondary" size="sm">{comment.likes_count}</Button>
			</div> 
		</div>
	</div>
</Card>
