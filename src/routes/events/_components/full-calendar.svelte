<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Calendar } from '@fullcalendar/core';
	import type { Event } from '@/types/types';
	import type { EventMountArg } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';

	export let events: Event[] = [];

	const transformedEvents = events.map(event => ({
		title: event.title,
		start: new Date(`${event.date}T${event.start_time}`),
		url: `/events/${event.id}`,
	}));

	let calendarEl: HTMLDivElement;
	let calendar: Calendar;

	onMount(() => {
		calendar = new Calendar(calendarEl, {
			plugins: [dayGridPlugin],
			initialView: 'dayGridMonth',
			events: transformedEvents,
			aspectRatio: 2.25,
			showNonCurrentDates: false,
			fixedWeekCount: false,
			eventTimeFormat: {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			},
			eventDidMount: (info: EventMountArg) => {
				info.el.setAttribute('title', info.event.title); // optional tooltip
			}
		});
		calendar.render();
	});

	onDestroy(() => {
		calendar?.destroy();
	});
</script>

<div bind:this={calendarEl}></div>
