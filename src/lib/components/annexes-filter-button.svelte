<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '@/components/ui/button';
	import * as Command from '@/components/ui/command';
	import * as Popover from '@/components/ui/popover';
	import { Check, Filter } from 'lucide-svelte';

	export let typeFilters: string[] | null = [];

	let open = false;

	const itemTypes: { label: string; value: 'content' | 'event' | 'thread' }[] = [
		{ label: 'Conteúdo', value: 'content' },
		{ label: 'Evento', value: 'event' },
		{ label: 'Discussão', value: 'thread' }
	];

	function handleTypeSelect(currentValue: string) {
		if (Array.isArray(typeFilters) && typeFilters.includes(currentValue)) {
			typeFilters = typeFilters.filter((v) => v !== currentValue);
		} else {
			typeFilters = [...(Array.isArray(typeFilters) ? typeFilters : []), currentValue];
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" class="w-10 p-0 md:w-auto md:px-4 md:py-2">
			<div class="relative">
				<Filter class="h-4 w-4 md:mr-2" />
				{#if typeFilters && typeFilters.length > 0}
					<div class="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary md:mr-2" />
				{/if}
			</div>
			<span class="sr-only md:not-sr-only">Filtrar</span>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="mt-2 w-[300px] p-0" align="start" side="bottom">
		<Command.Root class="divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden">
			<Command.List>
				<Command.Empty>Nenhum resultado encontrado.</Command.Empty>
				<Command.Group>
					{#each itemTypes as type}
						<Command.Item
							value={type.value}
							onSelect={() => handleTypeSelect(type.value)}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									typeFilters?.includes(type.value)
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check class="h-4 w-4" />
							</div>
							<span>{type.label}</span>
						</Command.Item>
					{/each}
				</Command.Group>

				{#if typeFilters && typeFilters.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							typeFilters = [];
						}}
					>
						Limpar filtros
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
