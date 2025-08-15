<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { MapPin } from '@/types/types';
	import { LocateFixed } from 'lucide-svelte';
	import { getContext } from 'svelte';
	import { key, type MBMapContext } from './mapbox';

	const { getMap } = getContext<MBMapContext>(key);

	export let pin: MapPin;
</script>

<Button
	on:click={() => {
		const map = getMap();
		map?.flyTo({
			center: [pin.lng, pin.lat],
			zoom: 10,
		});
	}}
>
	<LocateFixed class="mr-2 h-4 w-4" />O meu marcador
</Button>
