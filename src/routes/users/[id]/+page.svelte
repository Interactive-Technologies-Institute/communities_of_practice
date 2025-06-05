<script lang="ts">
	import { page } from '$app/stores';
	import FeatureWrapper from '@/components/feature-wrapper.svelte';
	import PageHeader from '@/components/page-header.svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { Button } from '@/components/ui/button';
	import * as Card from '@/components/ui/card';
	import { firstAndLastInitials } from '@/utils';
	import { Mail, Map, SquareArrowOutUpRight, Pen } from 'lucide-svelte';
	import { MetaTags } from 'svelte-meta-tags';
	import { Badge } from '@/components/ui/badge';
	import ThreadItem from '../../../lib/components/thread-item.svelte';

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

	function roleDisplay(role: string): string {
		const roleMap: Record<string, string> = {
			admin: 'Administrator',
			moderator: 'Moderator',
			user: 'Member'
		};
		return roleMap[role] ?? 'Unknown';
	}

	$: hasProfileExtras =
		data.userProfile.interests?.length ||
		data.userProfile.skills?.length ||
		data.userProfile.education?.length ||
		data.userProfile.languages?.length;
</script>

<MetaTags title="User Details" description="" />

<!--<PageHeader title="User Details" subtitle="View user details and their contributions" />-->
<div class="container mx-auto mb-20 mt-10 flex max-w-3xl flex-col gap-y-8 md:gap-y-10">
	<Card.Root>
		<Card.Header class="flex flex-col items-center text-center gap-y-2">
			<Avatar.Root class="h-60 w-60">
				<Avatar.Image src={data.userProfile.avatar} alt={data.userProfile.display_name} />
				<Avatar.Fallback>{firstAndLastInitials(data.userProfile.display_name)}</Avatar.Fallback>
			</Avatar.Root>
			<Card.Title class="text-xl">{data.userProfile.display_name}</Card.Title>
			<Card.Description class="text-lg">
				<Badge class="text-[15px] font-normal px-1.5 py-0.5">
					{roleDisplay(data.userProfile.role)}
				</Badge>
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4 text-center flex flex-col items-center">
			<p>{data.userProfile.description ?? 'No description provided'}</p>
			<div class="text-sm text-muted-foreground mt-2 flex gap-4">
			<span>{#if data.userProfile.gender}{data.userProfile.gender}{/if}</span>
			<span>{#if age}{age} years old{/if}</span>
			<span>{#if data.userProfile.nationality}{data.userProfile.nationality}{/if}</span>
			<span>{#if data.userProfile.profession}{data.userProfile.profession}{/if}</span>
		</div>
			<div class="mt-4 w-full flex items-center justify-center gap-4 border-t pt-4 text-sm text-muted-foreground">
				<div class="flex gap-4">
					<Button href="mailto:{data.userProfile.email}" variant="ghost" class="text-orange-500">
						<Mail class="mr-2 h-4 w-4" />
						Email
					</Button>
					{#if $page.url.pathname === '/users/me'}
						<Button href="/users/me/edit" variant="ghost" class="text-blue-500 hover:text-blue-600">
							<Pen class="h-4 w-4" />
							Edit Profile
						</Button>
					{/if}
					{#if data.mapPin}
						<Button href="/map?id={data.mapPin.id}&zoom=10" variant="ghost" class="text-orange-500">
							<Map class="mr-2 h-4 w-4" />
							View on Map
						</Button>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	{#if hasProfileExtras}
		<Card.Root>
			<Card.Content>
				<div class="flex flex-wrap justify-center gap-4 mb-4 mt-4">
					{#if data.userProfile.interests?.length}
						<Button class="w-32"
							variant={activeSection === 'interests' ? 'default' : 'outline'}
							on:click={() => activeSection = 'interests'}
						>
							Interests
						</Button>
					{/if}
					{#if data.userProfile.skills?.length}
						<Button class="w-32"
							variant={activeSection === 'skills' ? 'default' : 'outline'}
							on:click={() => activeSection = 'skills'}
						>
							Skills
						</Button>
					{/if}
					{#if data.userProfile.education?.length}
						<Button class="w-32"
							variant={activeSection === 'education' ? 'default' : 'outline'}
							on:click={() => activeSection = 'education'}
						>
							Education
						</Button>
					{/if}
					{#if data.userProfile.languages?.length}
						<Button class="w-32"
							variant={activeSection === 'languages' ? 'default' : 'outline'}
							on:click={() => activeSection = 'languages'}
						>
							Languages
						</Button>
					{/if}
				</div>

				{#if activeSection === 'interests' && data.userProfile.interests?.length}
					<div class="flex flex-col gap-2">
						{#each data.userProfile.interests as item}
							<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">{item}</div>
						{/each}
					</div>
				{:else if activeSection === 'skills' && data.userProfile.skills?.length}
					<div class="flex flex-col gap-2">
						{#each data.userProfile.skills as item}
							<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">{item}</div>
						{/each}
					</div>
				{:else if activeSection === 'education' && data.userProfile.education?.length}
					<div class="flex flex-col gap-2">
						{#each data.userProfile.education as item}
							<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">{item}</div>
						{/each}
					</div>
				{:else if activeSection === 'languages' && data.userProfile.languages?.length}
					<div class="flex flex-col gap-2">
						{#each data.userProfile.languages as item}
							<div class="bg-gray-200 rounded px-4 py-2 text-sm text-center">{item}</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	{#if data.forum_threads && data.forum_threads.length > 0}
		<div class="w-full flex items-center gap-4 text-orange-500">
			<hr class="flex-grow border-t border-orange-500" />
			<span class="text-sm font-semibold uppercase">Threads</span>
			<hr class="flex-grow border-t border-orange-500" />
		</div>
		{#each data.forum_threads as thread}
			<ThreadItem {thread} />
		{/each}
	{:else}
		<p class="text-sm text-muted-foreground">User has not created any Threads</p>
	{/if}
</div>
