<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Button } from '@/components//ui/button';
	import * as Command from '@/components//ui/command';
	import * as Popover from '@/components//ui/popover';
	import { Check, Filter} from 'lucide-svelte';

	export let filterValues: string[] | null = [];

	let open = false;

    const types: { label: string; value: string }[] = [
		{ label: 'Image',        value: 'Image' },
		{ label: 'Video',        value: 'Video' },
		{ label: 'Audio',        value: 'Audio' },
		{ label: 'PDF',          value: 'PDF' },
		{ label: 'Text',         value: 'Text' },
		{ label: 'Archive',      value: 'Archive' },
		{ label: 'JSON',         value: 'JSON' },
		{ label: 'Spreadsheet',  value: 'Spreadsheet' },
		{ label: 'Word Doc',     value: 'Word Doc' },
		{ label: 'Other',        value: 'File' }
	];

	function handleSelect(currentValue: string) {
		if (Array.isArray(filterValues) && filterValues.includes(currentValue)) {
			filterValues = filterValues.filter((v) => v !== currentValue);
		} else {
			filterValues = [...(Array.isArray(filterValues) ? filterValues : []), currentValue];
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" class="w-10 p-0 md:w-auto md:px-4 md:py-2">
			<div class="relative">
				<Filter class="h-4 w-4 md:mr-2"></Filter>
				{#if filterValues && filterValues.length > 0}
					<div class="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary md:mr-2"></div>
				{/if}
			</div>
			<span class="sr-only md:not-sr-only">Filter</span>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="mt-2 w-[250px] p-0" align="start" side="bottom">
		<Command.Root class="divide-border border-muted bg-background flex h-full w-full flex-col divide-y self-start overflow-hidden">
			<Command.List>
				<Command.Empty>No types found.</Command.Empty>
				<span class="text-muted-foreground px-3 pb-2 pt-4 text-xs">Type</span>
				<Command.Group>
					{#each types as type}
						<Command.Item
							value={type.value}
							onSelect={() => handleSelect(type.value)}
						>
							<div
								class={cn(
									'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
									filterValues?.includes(type.value)
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
				{#if filterValues && filterValues.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => (filterValues = [])}
					>
						Clear filters
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>