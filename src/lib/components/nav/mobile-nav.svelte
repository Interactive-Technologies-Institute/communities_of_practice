<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '@/utils';
	import { Menu } from 'lucide-svelte';
	import FeatureWrapper from '../feature-wrapper.svelte';
	import Logo from '../logo.svelte';
	import { Button } from '../ui/button';
	import { ScrollArea } from '../ui/scroll-area';
	import * as Sheet from '../ui/sheet';

	let open = false;
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" size="icon" class="md:hidden">
			<Menu class="h-5 w-5" />
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="pr-0">
		<a href="/" on:click={() => (open = false)} class="mr-6 flex items-center gap-x-4">
			{#if $page.data.branding.logo}
				<Logo class="h-8 w-8" logoUrl={$page.data.branding.logo} />
			{/if}
			<span class="text-lg font-bold"> {$page.data.branding.name} </span>
		</a>
		<ScrollArea orientation="both" class="my-4 h-[calc(100vh-8rem)] pb-10">
			<nav class="flex flex-col items-start gap-y-4 font-medium">
				<FeatureWrapper feature="docs">
					<a
						href="/docs"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/docs') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						ocs
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="guides">
					<a
						href="/guides"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/guides') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Guides
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="events">
					<a
						href="/events"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/events') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Events
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="map">
					<a
						href="/map"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/map') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Map
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="forum_threads">
					<a
						href="/forum"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/forum') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Forum
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="contents">
					<a
						href="/contents"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/contents') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Contents
					</a>
				</FeatureWrapper>
				<FeatureWrapper feature="users">
					<a
						href="/users"
						on:click={() => (open = false)}
						class={cn(
							'transition-colors hover:text-foreground/80',
							$page.url.pathname.startsWith('/users') ? 'text-foreground' : 'text-foreground/60'
						)}
					>
						Members
					</a>
				</FeatureWrapper>
			</nav>
		</ScrollArea>
	</Sheet.Content>
</Sheet.Root>
