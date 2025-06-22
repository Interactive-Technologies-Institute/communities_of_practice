<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EditEventForm from '../_components/edit-event-form.svelte';

	export let data;
</script>

<MetaTags title="Edit Event" description="Edit this event" />

<PageHeader title="Edit Event" subtitle="Edit this event" />
<div class="container mx-auto mb-20">
	<EditEventForm data={data.updateForm} />
</div>
