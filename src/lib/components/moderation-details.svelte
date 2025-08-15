<script lang="ts">
	import type { ModerationInfo } from '@/types/types';
	import dayjs from '$lib/dayjs';
	import { Info } from 'lucide-svelte';
	import * as Alert from './ui/alert';
	import * as Sheet from './ui/sheet';

	export let moderation: ModerationInfo[];
	export let open = false;
</script>

<Sheet.Root bind:open>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Detalhes de Moderação</Sheet.Title>
			<Sheet.Description>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-col gap-y-4 py-6">
			{#each moderation as item}
				{@const variant = item.status === 'rejected' ? 'destructive' : 'default'}
				<div>
					<p class="mb-1 text-xs text-muted-foreground">
						{dayjs(item.inserted_at).format('DD-MM-YYYY HH:mm:ss')}
					</p>
					<Alert.Root {variant} class="mx-auto max-w-xl">
						<Info class="mr-2 h-4 w-4" />
						<Alert.Title>
							{#if item.status === 'rejected'}
								Rejeitado (marcado para eliminação)
							{:else if item.status === 'pending'}
								Moderação Pendente
							{:else if item.status === 'changes_requested'}
								Alterações Solicitadas
							{/if}
						</Alert.Title>
						<Alert.Description>{item.comment}</Alert.Description>
					</Alert.Root>
				</div>
			{/each}
		</div>
	</Sheet.Content>
</Sheet.Root>
