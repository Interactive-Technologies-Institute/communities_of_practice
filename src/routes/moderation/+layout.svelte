<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '@/components/page-header.svelte';
	import * as Tabs from '@/components/ui/tabs';
	import { MetaTags } from 'svelte-meta-tags';

	$: path = $page.url.pathname.split('/').pop();
</script>

<MetaTags title="Moderação" description="Modera utilizadores e funcionalidades" />

<PageHeader title="Moderação" subtitle="Modera utilizadores e funcionalidades" />
<div class="container mx-auto mb-20">
	<Tabs.Root value={path}>
		<Tabs.List>
			<Tabs.TriggerLink href="/moderation/events" value="events">Eventos</Tabs.TriggerLink>
			<Tabs.TriggerLink href="/moderation/forum" value="forum">Fórum</Tabs.TriggerLink>
			<Tabs.TriggerLink href="/moderation/contents" value="contents">Conteúdos</Tabs.TriggerLink>
			<!--<Tabs.TriggerLink href="/moderation/guides" value="guides">Guias</Tabs.TriggerLink>-->
			<Tabs.TriggerLink href="/moderation/map" value="map">Mapa</Tabs.TriggerLink>
			<Tabs.TriggerLink href="/moderation/users" value="users">Membros</Tabs.TriggerLink>
		</Tabs.List>
		<slot />
	</Tabs.Root>
</div>
