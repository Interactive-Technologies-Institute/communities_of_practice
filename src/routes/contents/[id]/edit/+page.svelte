<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ContentForm from '../../_components/content-form.svelte';
	import { editContentSchema } from '@/schemas/content';
	
	export let data;
</script>

<MetaTags title="Edita Conteúdo" description="Edita este conteúdo" />

<PageHeader title="Edita Conteúdo" subtitle="Edita este conteúdo" />
<div class="container mx-auto mb-20">
	<ContentForm contentForm={data.updateForm} schema={editContentSchema}
		contentId={data.contentId} showAnnexesButton={true} />
</div>
