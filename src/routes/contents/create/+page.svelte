<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ContentForm from '../_components/content-form.svelte';
	import { createContentSchema } from '@/schemas/content';
	export let data;
</script>

<MetaTags
	title="Cria Conteúdo"
	description="Cria um novo conteúdo para o repositório da comunidade"
/>

<PageHeader title="Cria Conteúdo" subtitle="Cria um novo conteúdo para o repositório da comunidade" />
<div class="container mx-auto mb-20">
	<ContentForm contentForm={data.createForm} schema={createContentSchema} />
</div>
