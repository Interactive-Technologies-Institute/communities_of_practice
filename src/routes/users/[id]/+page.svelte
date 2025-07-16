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

	function roleDisplay(role: string): string {
		const roleMap: Record<string, string> = {
			admin: 'Administrator',
			moderator: 'Moderator',
			user: 'Member'
		};
		return roleMap[role] ?? 'Unknown';
	}
</script>

<MetaTags title="User Details" description="" />

<!--<PageHeader title="User Details" subtitle="View user details and their contributions" />-->
<div class="container mx-auto mb-20 mt-10 flex flex-col-reverse md:flex-row gap-10 justify-center">
	<!-- Left side: Main content -->
	<div class="flex-1 flex max-w-3xl flex-col gap-6">
		<!-- Interests -->
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Interests</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		{#if data.userProfile.interests?.length}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each data.userProfile.interests as item}
					<Card.Root>
						<Card.Content class="text-sm text-center px-4 py-2">
							{item}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Interests were not set yet.</p>
		{/if}
		<!-- Skills -->
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Skills</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		{#if data.userProfile.skills?.length}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each data.userProfile.skills as item}
					<Card.Root>
						<Card.Content class="text-sm text-center px-4 py-2">
							{item}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Skills were not set yet.</p>
		{/if}
		<!-- Education -->
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Education</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		{#if data.userProfile.education?.length}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each data.userProfile.education as item}
					<Card.Root>
						<Card.Content class="text-sm text-center px-4 py-2">
							{item}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Educational experiences were not set yet.</p>
		{/if}
		<!-- Languages -->
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Languages</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		{#if data.userProfile.languages?.length}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each data.userProfile.languages as item}
					<Card.Root>
						<Card.Content class="text-sm text-center px-4 py-2">
							{item}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Languages were not set yet.</p>
		{/if}
		<!-- Threads -->
		<div class="w-full flex items-center gap-4 text-foreground">
			<hr class="flex-grow border-t border-foreground" />
			<span class="text-sm font-semibold uppercase">Threads</span>
			<hr class="flex-grow border-t border-foreground" />
		</div>
		{#if data.forum_threads && data.forum_threads.length > 0}
			{#each data.forum_threads as thread}
				<ThreadItem {thread} />
			{/each}
		{:else}
			<p class="text-sm text-muted-foreground">A thread was not created yet.</p>
		{/if}
	</div>

	<!-- Right side: Profile Info -->
	<Card.Root class="w-full md:w-80 shrink-0 self-start">
		<Card.Header class="flex flex-col items-center text-center gap-y-2 p-4">
			<Avatar.Root class="h-48 w-48">
				<Avatar.Image src={data.userProfile.avatar} alt={data.userProfile.display_name} />
				<Avatar.Fallback>{firstAndLastInitials(data.userProfile.display_name)}</Avatar.Fallback>
			</Avatar.Root>
			<Card.Title class="text-xl">{data.userProfile.display_name}</Card.Title>
			<Card.Description class="text-lg">
				<Badge class="text-[15px] font-normal px-1.5 py-0.5">
					{roleDisplay(data.userProfile.role)}
				</Badge>
			</Card.Description>
			<span class="text-sm text-muted-foreground">
				{"Joined at " + new Date(data.userProfile.inserted_at).toLocaleDateString()}
			</span>
		</Card.Header>
		<Card.Content class="text-center flex flex-col items-center p-4 space-y-4">
			<p>{data.userProfile.description ?? 'No description provided'}</p>
			<div class="text-sm text-muted-foreground flex flex-col justify-center gap-2">
				{#if data.userProfile.gender}<span>{data.userProfile.gender}</span>{/if}
				{#if age}<span>{age} years old</span>{/if}
				{#if data.userProfile.nationality}<span>{data.userProfile.nationality}</span>{/if}
				{#if data.userProfile.profession}<span>{data.userProfile.profession}</span>{/if}
			</div>
			<div class="w-full border-t pt-4 flex flex-col gap-2 justify-center">
				{#if data.userProfile.email}
					<Button href="mailto:{data.userProfile.email}" variant="ghost" class="text-orange-500">
						<Mail class="mr-2 h-4 w-4" />
						Email
					</Button>
				{/if}
				{#if $page.url.pathname === '/users/me' || data.user?.id === data.userProfile.id}
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
		</Card.Content>
	</Card.Root>
</div>

