<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadForm from '../../_components/thread-form.svelte';
	
	export let data;
</script>

<MetaTags title="Edita Tópico de Discussão" description="Edita este tópico de discussão" />

<PageHeader title="Edita Tópico de Discussão" subtitle="Edita este tópico de discussão" />
<div class="container mx-auto mb-20">
	<ThreadForm data={data.updateForm} threadId={data.threadId} showAnnexesButton={true}/>
</div>
