<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { PlusCircle, Loader2 } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { queryParam } from 'sveltekit-search-params';
	import SortButton from '@/components/sort-button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createConnectionsSchema } from '@/schemas/connection';
	import ConnectionsFilterButton from '@/components/connections-filter-button.svelte';
	import ConnectionContentItem from '@/components/connection-content-item.svelte';
	import ConnectionEventItem from '@/components/connection-event-item.svelte';
	import ConnectionThreadItem from '@/components/connection-thread-item.svelte';

	export let data;

	const form = superForm(data.connectForm, {
		validators: zodClient(createConnectionsSchema),
		taintedMessage: false,
		dataType: 'json'
	});

	const { form: formData, enhance, submitting } = form;
	
	let selectedItems = data.connectedItems;
	$: $formData.selectedItems = selectedItems;

	const search = queryParam('search', stringQueryParam(), { debounceHistory: 500 });
	const typeFilters = queryParam('types', arrayQueryParam());
	const sortBy = queryParam('sortBy', stringQueryParam());
	const sortOrder = queryParam('sortOrder', stringQueryParam());
</script>

<MetaTags title="Event-Contents Connection" description="Connect the event with contents" />

<PageHeader title="Event-Contents Connection" subtitle="Connect the event with contents" />
<form method="POST" use:enhance>
    <div class="container mx-auto max-w-4xl flex flex-row justify-between gap-x-2">
        <div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
            <Input placeholder="Search..." class="flex-1 sm:max-w-64" bind:value={$search} />
            <ConnectionsFilterButton bind:typeFilters={$typeFilters} />
            <SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='connections'/>
        </div>
        <Button type="submit" disabled={$submitting} class="w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
			{#if $submitting}
				<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
			<PlusCircle class="h-4 w-4 sm:mr-2" />
			Confirm
		</Button>
    </div>
    <div class="container mx-auto max-w-4xl flex flex-col gap-y-6 py-10">
		{#each data.items as item}
			{#if item.type === 'content'}
				<ConnectionContentItem content={item} bind:selectedItems />
			{:else if item.type === 'event'}
				<ConnectionEventItem event={item} bind:selectedItems />
			{:else if item.type === 'thread'}
				<ConnectionThreadItem thread={item} bind:selectedItems />
			{/if}
		{/each}
	</div>
</form>