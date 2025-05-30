<script lang="ts">
	import { page } from '$app/stores';
	import FeatureWrapper from '@/components/feature-wrapper.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import { firstAndLastInitials } from '@/utils';
	import { Mail, Map, SquareArrowOutUpRight } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';

	export let data;

	function parseDateFromDDMMYYYY(input: string): Date | null {
		const [day, month, year] = input.split('/');
		if (!day || !month || !year) return null;
		return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
	}

	function calculateAge(birthdate: string | null): number | null {
		if (!birthdate) return null;

		const birth = birthdate.includes('/')
			? parseDateFromDDMMYYYY(birthdate)
			: new Date(birthdate);

		if (!birth || isNaN(birth.getTime())) return null;

		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();

		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
			age--;
		}

		return age;
	}

	const age = calculateAge(data.userProfile.date);

	let activeSection: 'interests' | 'skills' | 'education' | 'languages' = 'interests';

</script>

<MetaTags title="User Details" description="" />

<!--<PageHeader title="User Details" subtitle="View user details and their contributions" />-->
<div class="container mx-auto mb-20 mt-10 flex max-w-3xl flex-col gap-y-8 md:gap-y-10">
	<Card.Root>
		<Card.Header class="flex flex-col items-center text-center gap-y-2">
			<Avatar.Root class="h-28 w-28">
				<Avatar.Image src={data.userProfile.avatar} alt={data.userProfile.display_name} />
				<Avatar.Fallback>{firstAndLastInitials(data.userProfile.display_name)}</Avatar.Fallback>
			</Avatar.Root>
			<Card.Title class="text-xl">{data.userProfile.display_name}</Card.Title>
			<Card.Description class="text-lg">
				{data.userProfile.type}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4 text-center flex flex-col items-center">
			<p>{data.userProfile.description ?? 'No description provided'}</p>
			<div class="flex flex-row gap-x-4 justify-center">
				<Button href="mailto:{data.userProfile.email}" variant="outline">
					<Mail class="mr-2 h-4 w-4" />
					Email
				</Button>
				{#if data.mapPin}
					<Button href="/map?id={data.mapPin.id}&zoom=10" variant="outline">
						<Map class="mr-2 h-4 w-4" />
						View on Map
					</Button>
				{/if}
			</div>
			{#if $page.url.pathname === '/users/me'}
				<Button href="/users/me/edit">Edit Profile</Button>
			{/if}
		</Card.Content>
	</Card.Root>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<Card.Root class="h-28 flex flex-col items-center justify-center text-sm text-center leading-tight px-4 overflow-hidden break-words">
			<div><strong>Gender:</strong></div>
			<div>{data.userProfile.gender ?? '-'}</div>
		</Card.Root>
		<Card.Root class="h-28 flex flex-col items-center justify-center text-sm text-center leading-tight px-4 overflow-hidden break-words">
			<div><strong>Age:</strong></div>
			<div>{age ?? '-'} years old</div>
		</Card.Root>
		<Card.Root class="h-28 flex flex-col items-center justify-center text-sm text-center leading-tight px-4 overflow-hidden break-words">
			<div><strong>Nationality:</strong></div>
			<div>{data.userProfile.nationality ?? '-'}</div>
		</Card.Root>
		<Card.Root class="h-28 flex flex-col items-center justify-center text-sm text-center leading-tight px-4 overflow-hidden break-words">
			<div><strong>Profession:</strong></div>
			<div>{data.userProfile.profession ?? '-'}</div>
		</Card.Root>
	</div>
	<Card.Root>
		<!--<Card.Header><Card.Title>Capabilities</Card.Title></Card.Header>-->
		<Card.Content>
			<div class="flex flex-wrap justify-center gap-4 mb-4 mt-4">
				<Button class="w-32"
					variant={activeSection === 'interests' ? 'default' : 'outline'}
					on:click={() => activeSection = 'interests'}
				>
					Interests
				</Button>
				<Button class="w-32"
					variant={activeSection === 'skills' ? 'default' : 'outline'}
					on:click={() => activeSection = 'skills'}
				>
					Skills
				</Button>
				<Button class="w-32"
					variant={activeSection === 'education' ? 'default' : 'outline'}
					on:click={() => activeSection = 'education'}
				>
					Education
				</Button>
				<Button class="w-32"
					variant={activeSection === 'languages' ? 'default' : 'outline'}
					on:click={() => activeSection = 'languages'}
				>
					Languages
				</Button>
			</div>
			{#if activeSection === 'interests'}
				<div class="flex flex-col gap-2">
					{#each data.userProfile.interests as item}
						<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">
							{item}
						</div>
					{/each}
				</div>
			{:else if activeSection === 'skills'}
				<div class="flex flex-col gap-2">
					{#each data.userProfile.skills as item}
						<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">
							{item}
						</div>
					{/each}
				</div>
			{:else if activeSection === 'education'}
				<div class="flex flex-col gap-2">
					{#each data.userProfile.education as item}
						<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">
							{item}
						</div>
					{/each}
				</div>
			{:else if activeSection === 'languages'}
				<div class="flex flex-col gap-2">
					{#each data.userProfile.languages as item}
						<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">
							{item}
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
	<!--<FeatureWrapper feature="guides">
		<Card.Root>
			<Card.Header>
				<Card.Title>Guides ({data.guides.length})</Card.Title>
				<Card.Description>List of Guides created</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.guides && data.guides.length > 0}
					<div class="flex flex-wrap gap-4">
						{#each data.guides as guide}
							<Button href="/guides/{guide.id}" variant="outline" class="max-w-full">
								<span class="truncate">{guide.label}</span>
								<SquareArrowOutUpRight class="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
							</Button>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">User has not created any Guides</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</FeatureWrapper>
	<FeatureWrapper feature="events">
		<Card.Root>
			<Card.Header>
				<Card.Title>Events ({data.events.length})</Card.Title>
				<Card.Description>List of Events created</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.events && data.events.length > 0}
					<div class="flex flex-wrap gap-4">
						{#each data.events as event}
							<Button href="/events/{event.id}" variant="outline" class="max-w-full">
								<span class="truncate">{event.label}</span>
								<SquareArrowOutUpRight class="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
							</Button>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">User has not created any Events</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</FeatureWrapper>-->
	<FeatureWrapper feature="forum_threads">
		<Card.Root>
			<Card.Header>
				<Card.Title>Threads ({data.forum_threads.length})</Card.Title>
				<Card.Description>List of Events created</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.forum_threads && data.forum_threads.length > 0}
					<div class="flex flex-wrap gap-4">
						{#each data.forum_threads as forum_thread}
							<Button href="/forum/{forum_thread.id}" variant="outline" class="max-w-full">
								<span class="truncate">{forum_thread.label}</span>
								<SquareArrowOutUpRight class="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
							</Button>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">User has not created any Threads</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</FeatureWrapper>
</div>
