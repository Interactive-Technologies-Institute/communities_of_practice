<script lang="ts">
	import TagFilterButton from '@/components/tag-filter-button.svelte';
	import { Input } from '@/components/ui/input';
	import * as Tabs from '@/components/ui/tabs';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { queryParam } from 'sveltekit-search-params';
	import ForumModerationTable from './_components/forum-moderation-table.svelte';
	import SortButton from '@/components/sort-button.svelte';
	
	export let data;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const tags = queryParam('tags', arrayQueryParam());
	const sortBy = queryParam('sortBy', stringQueryParam());
	const sortOrder = queryParam('sortOrder', stringQueryParam());
</script>

<Tabs.Content value="forum" class="mt-8 flex flex-col gap-y-4">
	<div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
		<Input placeholder="Pesquisar..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
		<TagFilterButton tags={data.tags} bind:filterValues={$tags} />
		<SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='forum'/>
	</div>
	<ForumModerationTable contents={data.threads} updateModerationForm={data.updateModerationForm} />
</Tabs.Content>
