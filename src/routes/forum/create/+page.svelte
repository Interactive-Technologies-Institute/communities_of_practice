<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import ThreadForm from '../_components/thread-form.svelte';
	export let data;
</script>

<MetaTags
	title="Cria Tópico de Discussão"
	description="Cria um novo tópico de discussão para o fórum da comunidade"
/>

<PageHeader title="Cria Tópico de Discussão" subtitle="Cria um novo tópico de discussão para o fórum da comunidade" />
<div class="container mx-auto mb-20">
	<ThreadForm data={data.createForm} />
</div>
