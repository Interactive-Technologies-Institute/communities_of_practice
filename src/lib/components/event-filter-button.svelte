<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '@/components//ui/button';
	import * as Command from '@/components//ui/command';
	import * as Popover from '@/components//ui/popover';
	import { Check, Filter, ThumbsUp, Bookmark } from 'lucide-svelte';

	export let tagFilters: string[] | null = [];
	export let statusFilters: string[] | null = [];
	export let tags: Map<string, number> = new Map();

	let open = false;

    const eventStatuses: { label: string; value: string }[] = [
		{ label: 'Voting Open', value: 'voting_open' },
		{ label: 'No One Voted', value: 'no_one_voted' },
		{ label: 'Scheduled', value: 'scheduled' },
		{ label: 'Ongoing', value: 'ongoing' },
		{ label: 'Completed', value: 'completed' }
	];

    function handleStatusSelect(currentValue: string) {
		if (Array.isArray(statusFilters) && statusFilters.includes(currentValue)) {
			statusFilters = statusFilters.filter((v) => v !== currentValue);
		} else {
			statusFilters = [...(Array.isArray(statusFilters) ? statusFilters : []), currentValue];
		}
	}

	function handleTagsSelect(currentValue: string) {
		if (Array.isArray(tagFilters) && tagFilters.includes(currentValue)) {
			tagFilters = tagFilters.filter((v) => v !== currentValue);
		} else {
			tagFilters = [...(Array.isArray(tagFilters) ? tagFilters : []), currentValue];
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" class="w-10 p-0 md:w-auto md:px-4 md:py-2">
			<div class="relative">
				<Filter class="h-4 w-4 md:mr-2"></Filter>
				{#if (tagFilters && tagFilters.length > 0) || (statusFilters && statusFilters.length > 0)}
					<div class="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary md:mr-2"></div>
				{/if}
			</div>
			<span class="sr-only md:not-sr-only">Filtrar</span>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="mt-2 w-[300px] p-0" align="start" side="bottom">
		<Command.Root class="divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden">
			<Command.Input placeholder="Filtrar por" />
			<Command.List>
				<Command.Empty>Nenhum resultado encontrado.</Command.Empty>
                <span class="text-muted-foreground px-3 pb-2 pt-4 text-xs">Estado</span>
				<Command.Group>
					{#each eventStatuses as s}
						<Command.Item
							value={s.value}
							onSelect={() => handleStatusSelect(s.value)}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									statusFilters?.includes(s.value)
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check class="h-4 w-4" />
							</div>
							<span>{s.label}</span>
						</Command.Item>
					{/each}
				</Command.Group>
				<span class="text-muted-foreground px-3 pb-2 pt-4 text-xs">Etiquetas</span>
				<Command.Group>
					{#each tags as tag}
						<Command.Item
							value={tag[0]}
							onSelect={(currentValue) => {
								handleTagsSelect(currentValue);
							}}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									tagFilters?.includes(tag[0])
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check class="h-4 w-4" />
							</div>
							<span>
								{tag[0]}
							</span>
							<span class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
								{tag[1]}
							</span>
						</Command.Item>
					{/each}
				</Command.Group>
				{#if (tagFilters && tagFilters.length > 0) || (statusFilters && statusFilters.length > 0)}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							tagFilters = [];
							statusFilters = [];
						}}
					>
						Limpar filtros
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
