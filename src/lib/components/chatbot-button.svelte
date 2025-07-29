<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { Separator } from '@/components/ui/separator';
	import type { Conversation, UserWithRole, Speaker } from '@/types/types';
	import dayjs from 'dayjs';
	import { BotMessageSquare, SendHorizontal, Loader2 } from 'lucide-svelte';
    import { Input } from '@/components/ui/input';
	import { onMount } from 'svelte';

	export let conversations: Conversation[] = [];

	console.log('conversations', conversations);

	let open = false;
	beforeNavigate(() => {
		open = false;
	});

    let message = '';

	let loadingAI = false;

	async function askQuestion() {
		loadingAI = true;
		try {
			let tempId = Math.floor(Math.random() * 1_000_000_000);
			if (conversations.some(c => c.id === tempId)) {
				tempId = Math.floor(Math.random() * 1_000_000_000);
			}

			// Local save to instantly show the user's message, attributes are placeholders
			const userMessage = {
				id: tempId,
				speaker: 'user' as Speaker,
				entry: message,
				inserted_at: new Date().toISOString(),
				user_id: ''
			};

			conversations = [...conversations, userMessage];

			const response = await fetch('/api/ask-ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query: message })
			});

			const result = await response.json();
			message = '';

			tempId = Math.floor(Math.random() * 1_000_000_000);
			if (conversations.some(c => c.id === tempId)) {
				tempId = Math.floor(Math.random() * 1_000_000_000);
			}

			// Local save to instantly show the AI's message, attributes are placeholders
			const aiMessage = {
				id: tempId,
				speaker: 'ai' as Speaker,
				entry: result.text || result.result || result.error,
				inserted_at: new Date().toISOString(),
				user_id: ''
			};

			conversations = [...conversations, aiMessage];
			console.log('AI response:', result.text || result.result || result.error);
		} catch (err) {
			console.error('Error asking question:', err);
		}
		loadingAI = false
	}
</script>


<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button variant="outline" size="icon-lg" builders={[builder]}>
			<div class="relative">
				<BotMessageSquare class="h-8 w-8" />
			</div>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[28rem] max-h-[85vh] overflow-hidden p-0 flex flex-col" align="end">
		<div class="p-2 border-b">
			AI Assistant
		</div>
		<Separator />
		<div class="flex-1 overflow-y-auto">
			<ScrollArea class="flex flex-col gap-y-2 p-2">
				{#if conversations?.length}
					{#each conversations as conversation (conversation.id)}
						<div class="flex flex-col gap-1">
							<p class="text-xs font-medium text-muted-foreground">
								{conversation.speaker === 'user' ? 'You' : 'AI'} · {dayjs(conversation.inserted_at).fromNow()}
							</p>
							<p class="text-sm text-foreground whitespace-pre-line">
								{conversation.entry}
							</p>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-muted-foreground text-center">Ask me something...</p>
				{/if}
			</ScrollArea>
		</div>

		<Separator />

		<div class="flex items-center gap-2 p-2 border-t">
			<Input
				name="message"
				placeholder="Type your question..."
				class="flex-1"
				bind:value={message}
				disabled={loadingAI}
			/>
			<Button type="button" on:click={askQuestion} disabled={message.trim().length <= 0 || loadingAI} size="icon-lg">
				{#if loadingAI}
					<Loader2 class="h-6 w-6 animate-spin" />
				{:else}
					<SendHorizontal class="h-6 w-6" />
				{/if}
			</Button>
		</div>
	</Popover.Content>

</Popover.Root>
