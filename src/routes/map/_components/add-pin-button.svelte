<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { createMapPinSchema, type CreateMapPinSchema } from '@/schemas/map-pin';
	import { Check, MapPin, XCircle } from 'lucide-svelte';
	import { getContext, onDestroy } from 'svelte';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { key, mapboxgl, type MBMapContext } from './mapbox';

	const { getMap } = getContext<MBMapContext>(key);

	export let data: SuperValidated<Infer<CreateMapPinSchema>>;

	const form = superForm(data, {
		validators: zodClient(createMapPinSchema),
	});

	const { form: formData, enhance } = form;

	let markerElement: HTMLElement;
	let marker: mapboxgl.Marker | undefined;

	function onDragEnd() {
		if (marker) {
			const lngLat = marker.getLngLat();
			$formData.lng = lngLat.lng;
			$formData.lat = lngLat.lat;
		}
	}

	function initializePin() {
		const map = getMap();
		if (map) {
			let lngLat = data.data ?? map.getCenter();
			marker = new mapboxgl.Marker(markerElement, {
				draggable: true,
			})
				.setLngLat(lngLat)
				.addTo(map);
			marker.on('dragend', onDragEnd);
			map?.flyTo({
				center: lngLat,
				zoom: 6,
			});
		}
	}

	function confirmPin() {
		marker?.remove();
		marker = undefined;
	}

	function cancelPin() {
		marker?.remove();
		marker = undefined;
	}

	onDestroy(() => {
		marker?.remove();
		marker = undefined;
	});
</script>

<div bind:this={markerElement} class="flex flex-col items-center gap-y-2">
	{#if marker}
		<form method="POST" use:enhance action="?/create" on:submit={confirmPin}>
			<input type="hidden" name="lng" bind:value={$formData.lng} />
			<input type="hidden" name="lat" bind:value={$formData.lat} />
			<div class="flex flex-row gap-x-2">
				<Button variant="outline" size="icon" on:click={cancelPin}>
					<XCircle class="h-4 w-4" />
				</Button>
				<Button type="submit" size="icon">
					<Check class="h-4 w-4" />
				</Button>
			</div>
		</form>
		<div class="rounded-sm bg-primary px-2 py-1 text-primary-foreground">
			Arrasta o marcador para a tua localização
		</div>
		<div
			class="mb-[5.5rem] flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background"
		>
			<MapPin class="h-5 w-5" />
		</div>
	{/if}
</div>

<Button on:click={initializePin}>
	<MapPin class="mr-2 h-4 w-4" />
	Adicionar o meu marcador
</Button>
