<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import PostForm from '../../_components/post-form.svelte';
	export let data;
</script>

<MetaTags title="Edit Post" description="Edit this post" />

<PageHeader title="Edit Post" subtitle="Edit this post" />
<div class="container mx-auto mb-20">
	<PostForm data={data.updateForm} />
</div>
