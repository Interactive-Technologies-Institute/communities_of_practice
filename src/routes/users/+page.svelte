<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import TagFilterButton from '@/components/tag-filter-button.svelte';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { PlusCircle } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { queryParam } from 'sveltekit-search-params';
	import UserItem from './_components/user-item.svelte';
	import SortButton from '@/components/sort-button.svelte';
	import RoleFilterButton from '@/components/role-filter-button.svelte';

	export let data;

	const search = queryParam('s', stringQueryParam(), {
		debounceHistory: 500,
	});
	const roles = queryParam('roles', arrayQueryParam());
	const sortBy = queryParam('sortBy', stringQueryParam());
	const sortOrder = queryParam('sortOrder', stringQueryParam());
</script>

<MetaTags title="Members" description="View all the members of the community" />

<PageHeader title="Members" subtitle="View all the members of the community" />
<div class="container mx-auto max-w-4xl flex flex-row justify-between gap-x-2">
	<div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
		<Input placeholder="Search..." class="flex-1 sm:max-w-64" bind:value={$search}></Input>
		<RoleFilterButton bind:filterValues={$roles} />
		<SortButton bind:sortBy={$sortBy} bind:sortOrder={$sortOrder} section='members'/>
	</div>
</div>
<div class="container mx-auto max-w-4xl flex flex-col gap-y-6 py-10">
	{#each data.user_profiles as user}
		<UserItem {user} />
	{/each}
</div>
