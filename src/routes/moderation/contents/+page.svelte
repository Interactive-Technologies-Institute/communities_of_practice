<script lang="ts">
	import ContentFilterButton from '@/components/content-filter-button.svelte';
	import { Input } from '@/components/ui/input';
	import * as Tabs from '@/components/ui/tabs';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { queryParam } from 'sveltekit-search-params';
	import ContentsModerationTable from './_components/contents-moderation-table.svelte';

	export let data;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const fileTypes = queryParam('fileTypes', arrayQueryParam());
	const tags = queryParam('tags', arrayQueryParam());
</script>

<Tabs.Content value="contents" class="mt-8 flex flex-col gap-y-4">
	<div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
		<Input placeholder="Search..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
		<ContentFilterButton tags={data.tags} bind:tagFilters={$tags} bind:typeFilters={$fileTypes} />
	</div>
	<ContentsModerationTable contents={data.contents} updateModerationForm={data.updateModerationForm} />
</Tabs.Content>
