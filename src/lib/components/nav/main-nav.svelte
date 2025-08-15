<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '@/utils';
	import FeatureWrapper from '../feature-wrapper.svelte';
	import Logo from '../logo.svelte';
</script>

<div class="mr-4 hidden md:flex">
	<a href="/" class="mr-6 flex items-center gap-x-2">
		{#if $page.data.branding.logo}
			<Logo class="h-4 w-4" logoUrl={$page.data.branding.logo} />
		{/if}
		<span class="font-bold"> {$page.data.branding.name} </span>
	</a>
	<nav class="flex items-center space-x-6 text-sm font-medium">
		<FeatureWrapper feature="docs">
			<a
				href="/docs"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/docs') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Docs
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="guides">
			<a
				href="/guides"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/guides') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Guias
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="events">
			<a
				href="/events"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/events') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Eventos
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="map">
			<a
				href="/map"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/map') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Mapa
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="forum_threads">
			<a
				href="/forum"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/forum') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Fórum
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="contents">
			<a
				href="/contents"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/contents') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Conteúdos
			</a>
		</FeatureWrapper>
		<FeatureWrapper feature="users">
			<a
				href="/users"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname.startsWith('/users') ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Membros
			</a>
		</FeatureWrapper>
	</nav>
</div>
