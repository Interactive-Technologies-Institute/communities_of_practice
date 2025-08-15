<script lang="ts">
	import PageHeader from '@/components/page-header.svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import EditEventForm from '../_components/edit-event-form.svelte';

	export let data;
</script>

<MetaTags title="Edita Evento" description="Edita este evento" />

<PageHeader title="Edita Evento" subtitle="Edita este evento" />
<div class="container mx-auto mb-20">
	<EditEventForm data={data.updateForm} eventId={data.eventId} showAnnexesButton={true}/>
</div>
