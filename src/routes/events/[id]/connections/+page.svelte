<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { PlusCircle, Loader2 } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { queryParam } from 'sveltekit-search-params';
	import EventContentItem from '@/components/connection-content-item.svelte';
	import SortButton from '@/components/sort-button.svelte';
	import ContentFilterButton from '@/components/content-filter-button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { connectEventContentSchema } from '@/schemas/connection';

	export let data;

	const form = superForm(data.connectForm, {
		validators: zodClient(connectEventContentSchema),
		taintedMessage: false
	});

	const { form: formData, enhance, submitting } = form;
	
	let selectedContentIds: number[] = data.selectedContentIds;

	$: $formData.contentIds = selectedContentIds;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const fileTypes = queryParam('fileTypes', arrayQueryParam());
	const sortBy = queryParam('sortBy', stringQueryParam());
	const sortOrder = queryParam('sortOrder', stringQueryParam());
	const tags = queryParam('tags', arrayQueryParam());
</script>

<MetaTags title="Event-Contents Connection" description="Connect the event with contents" />

<PageHeader title="Event-Contents Connection" subtitle="Connect the event with contents" />
<form method="POST" use:enhance>
    <div class="container mx-auto max-w-5xl flex flex-row justify-between gap-x-2">
        <div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
            <Input placeholder="Search..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
            <ContentFilterButton tags={data.tags} bind:tagFilters={$tags} bind:typeFilters={$fileTypes} />
            <SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='contents'/>
        </div>
        <Button type="submit" disabled={$submitting} class="w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
			{#if $submitting}
				<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
			<PlusCircle class="h-4 w-4 sm:mr-2" />
			Confirm
		</Button>
    </div>
    <div class="container mx-auto max-w-5xl flex flex-col gap-y-6 py-10">
        {#each data.contents as content}
            <EventContentItem {content} bind:selectedContentIds />
        {/each}
    </div>
</form>