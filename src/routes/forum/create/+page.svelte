<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import PostForm from '../_components/post-form.svelte';
	export let data;
</script>

<MetaTags
	title="Create Post"
	description="Create a new post for the forum of the community"
/>

<PageHeader title="Create Event" subtitle="Create a new post for the forum of the community" />
<div class="container mx-auto mb-20">
	<PostForm data={data.createForm} />
</div>
