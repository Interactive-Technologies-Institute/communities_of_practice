<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import TagFilterButton from '@/components/tag-filter-button.svelte';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { PlusCircle } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { queryParam } from 'sveltekit-search-params';
	import EventItem from './_components/event-item.svelte';
	import FullCalendar from './_components/full-calendar.svelte';

	export let data;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const tags = queryParam('tags', arrayQueryParam());
</script>

<MetaTags title="Events" description="Find & share community events" />

<PageHeader title="Events" subtitle="Find & share community events" />
<div class="container mx-auto flex flex-row justify-between gap-x-2">
	<div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
		<Input placeholder="Search..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
		<TagFilterButton tags={data.tags} bind:filterValues={$tags} />
		<!-- <SortButton /> -->
	</div>
	<Button href="/events/create" class="w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
		<PlusCircle class="h-4 w-4 sm:mr-2" />
		<span class="sr-only sm:not-sr-only">Create Event</span>
	</Button>
</div>
<div class="container mx-auto py-10">
	<FullCalendar events={data.events} />
</div>
<div class="container mx-auto grid grid-cols-1 gap-6 py-10 md:grid-cols-2 lg:grid-cols-3">
	{#each data.events as event}
		<EventItem {event}></EventItem>
	{/each}
</div>
