<script lang="ts">
    import Logo from '@/components/logo.svelte';
    import { MetaTags } from 'svelte-meta-tags';
	import { fade } from 'svelte/transition';

    export let data;
    $: ({ branding } = data);

	let images = ['/img/background1.jpg', '/img/background2.jpg'];
    let current = 0;

    function nextImage() {
        current = (current + 1) % images.length;
    }

    setInterval(nextImage, 15000);
</script>

<MetaTags title={branding.name} description={branding.slogan} />

<div class="relative min-h-screen flex flex-col items-center justify-center">
    {#each images as img, i (i)}
        {#if i === current}
            <div
                class="absolute inset-0 -z-10 bg-cover bg-center"
                style="background-image: url({img});"
                transition:fade={{ duration: 3000 }}
            ></div>
        {/if}
    {/each}
	<div class="absolute inset-0 -z-10 bg-background opacity-20"></div>
    <div class="container mx-auto mb-20 mt-20 flex flex-col items-center justify-center md:mt-40 relative z-10">
        {#if branding.logo}
            <Logo class="h-32 w-32 md:h-48 md:w-48" logoUrl={branding.logo} />
        {/if}
        <h1 class="mb-4 text-center text-6xl font-bold md:text-8xl">{branding.name}</h1>
        <p class="text-center text-xl text-muted-foreground md:text-3xl">{branding.slogan}</p>
    </div>
</div>