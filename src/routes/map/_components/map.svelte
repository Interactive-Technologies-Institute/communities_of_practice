<script lang="ts">
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { setContext } from 'svelte';
	import '../../../app.css';
	import { key, mapboxgl, type MBMapContext } from './mapbox';

	export let lng: number;
	export let lat: number;
	export let zoom: number;

	let map: mapboxgl.Map | undefined;

	setContext<MBMapContext>(key, {
		getMap: () => map,
	});

	function updateProps() {
		if (!map) return;
		zoom = map.getZoom();
		lng = map.getCenter().lng;
		lat = map.getCenter().lat;
	}

	function initialize(node: HTMLElement) {
		map = new mapboxgl.Map({
			container: node,
			style: 'mapbox://styles/mapbox/light-v11',
			center: [lng, lat],
			zoom: zoom,
			minZoom: 1,
			maxZoom: 9,
		});
		map.dragRotate.disable();
		map.touchZoomRotate.disableRotation();
		map.on('move', updateProps);

		return {
			destroy() {
				map?.off('move', updateProps);
				map?.remove();
				map = undefined;
			},
		};
	}
</script>

<div class="h-full w-full" use:initialize>
	{#if map}
		<slot />
	{/if}
</div>

<style>
	:global(.mapboxgl-map) {
		font: inherit;
	}
</style>
