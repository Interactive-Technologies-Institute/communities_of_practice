<script lang="ts">
	import EventFilterButton from '@/components/event-filter-button.svelte';
	import { Input } from '@/components/ui/input';
	import * as Tabs from '@/components/ui/tabs';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { queryParam } from 'sveltekit-search-params';
	import EventsModerationTable from './_components/events-moderation-table.svelte';

	export let data;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const tags = queryParam('tags', arrayQueryParam());
	const statuses = queryParam('statuses', arrayQueryParam());
</script>

<Tabs.Content value="events" class="mt-8 flex flex-col gap-y-4">
	<div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
		<Input placeholder="Pesquisar..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
		<EventFilterButton tags={data.tags} bind:tagFilters={$tags} bind:statusFilters={$statuses} />
	</div>
	<EventsModerationTable events={data.events} updateModerationForm={data.updateModerationForm} />
</Tabs.Content>
