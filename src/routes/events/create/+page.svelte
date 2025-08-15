<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EventForm from '../_components/event-form.svelte';
	export let data;
</script>

<MetaTags
	title="Cria Evento"
	description="Cria um novo evento e partilha-o com a comunidade"
/>

<PageHeader title="Cria Evento" subtitle="Cria um novo evento e partilha-o com a comunidade" />
<div class="container mx-auto mb-20">
	<EventForm data={data.createForm} />
</div>
