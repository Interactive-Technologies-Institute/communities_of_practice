<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadForm from '../_components/thread-form.svelte';
	export let data;
</script>

<MetaTags
	title="Create Thread"
	description="Create a new thread for the forum of the community"
/>

<PageHeader title="Create Thread" subtitle="Create a new thread for the forum of the community" />
<div class="container mx-auto mb-20">
	<ThreadForm data={data.createForm} />
</div>
