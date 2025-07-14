<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { Button } from '@/components/ui/button';
	import { Input } from '@/components/ui/input';
	import { arrayQueryParam, stringQueryParam } from '@/utils';
	import { PlusCircle, Loader2 } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { queryParam } from 'sveltekit-search-params';
	import ConnectionContentItem from '@/components/connection-content-item.svelte';
	import SortButton from '@/components/sort-button.svelte';
	import ContentFilterButton from '@/components/content-filter-button.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createEventConnectionsSchema } from '@/schemas/connection';
	import EventFilterButton from '@/components/event-filter-button.svelte';
	import ConnectionEventItem from '@/components/connection-event-item.svelte';

	export let data;

	const form = superForm(data.connectForm, {
		validators: zodClient(createEventConnectionsSchema),
		taintedMessage: false
	});

	const { form: formData, enhance, submitting } = form;
	
	let selectedContentIds: number[] = data.connectedContentIds;
    let selectedEventIds: number[] = data.connectedEventIds;

	$: $formData.contentIds = selectedContentIds;

	const contentsSearch = queryParam('cs', stringQueryParam(), {
		debounceHistory: 500,
	});
	const fileTypes = queryParam('fileTypes', arrayQueryParam());
	const contentsSortBy = queryParam('contentsSortBy', stringQueryParam());
	const contentsSortOrder = queryParam('contentsSortOrder', stringQueryParam());
	const contentsTags = queryParam('contentsTags', arrayQueryParam());
    const eventsSearch = queryParam('es', stringQueryParam(), {
		debounceHistory: 500,
	});
	const eventsTags = queryParam('eventsTags', arrayQueryParam());
    const statuses = queryParam('statuses', arrayQueryParam());
</script>

<MetaTags title="Thread Connections" description="Connect the thread with contents and events" />

<PageHeader title="Thread Connections" subtitle="Connect the thread with contents and events" />
<form method="POST" use:enhance>
	<div class="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
		<div class="basis-1/2 flex flex-col gap-y-4">
			<div class="flex flex-row gap-x-2 sm:gap-x-4">
				<Input
					placeholder="Search contents..."
					class="flex-1 sm:max-w-64"
					bind:value={$contentsSearch}
				/>
				<ContentFilterButton
					tags={data.contentsTags}
					bind:tagFilters={$contentsTags}
					bind:typeFilters={$fileTypes}
				/>
				<SortButton
					bind:sortBy={$contentsSortBy}
					bind:sortOrder={$contentsSortOrder}
					section="contents"
				/>
			</div>
			<div class="flex flex-col gap-y-4 py-2">
				{#each data.contents as content}
					<ConnectionContentItem {content} bind:selectedContentIds />
				{/each}
			</div>
		</div>

		<div class="basis-1/2 flex flex-col gap-y-4">
			<div class="container mx-auto px-0 flex flex-row justify-between gap-x-2">
                <div class="flex flex-1 flex-row gap-x-2 sm:gap-x-4 md:flex-auto">
                    <Input
                        placeholder="Search events..."
                        class="flex-1 sm:max-w-64"
                        bind:value={$eventsSearch}
                    />
                    <EventFilterButton
                        tags={data.eventsTags}
                        bind:tagFilters={$eventsTags}
                        bind:statusFilters={$statuses}
                    />
                </div>
                <Button type="submit" disabled={$submitting} class="w-10 p-0 sm:w-auto sm:px-4 sm:py-2">
                    {#if $submitting}
                        <Loader2 class="h-4 w-4 animate-spin" />
                    {/if}
                    <PlusCircle class="h-4 w-4 sm:mr-2" />
                    Confirm
                </Button>
            </div>
			<div class="grid grid-cols-1 gap-6 py-2 md:grid-cols-2 xl:grid-cols-2">
				{#each data.events as event}
					<ConnectionEventItem {event} bind:selectedEventIds />
				{/each}
			</div>
		</div>
	</div>
</form>

