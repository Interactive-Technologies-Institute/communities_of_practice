<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ContentForm from '../_components/content-form.svelte';
	import { createContentSchema } from '@/schemas/content';
	export let data;
</script>

<MetaTags
	title="Create Content"
	description="Create a new content for the repository of the community"
/>

<PageHeader title="Create Content" subtitle="Create a new content for the repository of the community" />
<div class="container mx-auto mb-20">
	<ContentForm contentForm={data.createForm} schema={createContentSchema} />
</div>
