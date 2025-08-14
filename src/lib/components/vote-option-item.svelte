<script lang="ts">
	import { Card } from '@/components/ui/card';
	import { Calendar, Check } from 'lucide-svelte';
	import dayjs from 'dayjs';
	import type { EventVotingOption } from '@/types/types';

    export let option: EventVotingOption;
    export let votes:number;
    export let selectedItems: number[];
    export let hasVoted: boolean;
    export let userVoted: boolean = false;

    $: checked = selectedItems.some(s => s === option.id);

    function toggleCheckbox() {
		if (checked) {
			selectedItems = selectedItems.filter(s => !(s === option.id));
		} else {
			selectedItems = [...selectedItems, option.id];
		}
	}
</script>

<Card class="relative flex h-full flex-col overflow-hidden">
    <div class="flex flex-1 flex-col px-4 py-3">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="h-8 w-8 flex items-center justify-center text-muted-foreground">
                    <Calendar class="h-8 w-8" />
                </div>
                <p class="text-sm line-clamp-1 break-all font-medium">{dayjs(option.date).format('dddd , DD/MM/YYYY')}
							{#if option.start_time && option.end_time}
								, {option.start_time.slice(0, 5)}–{option.end_time.slice(0, 5)}
							{/if}</p>
            </div>
            <div class="flex items-center gap-2 ml-2">
                <Check class={`h-4 w-4 ${userVoted ? 'text-green-700' : 'text-muted-foreground'}`} />
                <p class={`text-xs whitespace-nowrap overflow-hidden text-ellipsis ${userVoted ? 'text-green-700 font-semibold' : 'text-muted-foreground'}`}>
                {votes}
                </p>

                {#if !hasVoted}
                <input
                    type="checkbox"
                    value={option.id}
                    checked={checked}
                    on:change={toggleCheckbox}
                    class="ml-2"
                />
                {/if}
            </div>
        </div>
    </div>
</Card>


