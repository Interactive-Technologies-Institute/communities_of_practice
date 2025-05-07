<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadForm from '../../_components/thread-form.svelte';
	export let data;
</script>

<MetaTags title="Edit Thread" description="Edit this thread" />

<PageHeader title="Edit Thread" subtitle="Edit this thread" />
<div class="container mx-auto mb-20">
	<ThreadForm data={data.updateForm} />
</div>
