<script lang="ts">
	import { page } from '$app/stores';
	import { AspectRatio } from '@/components/ui/aspect-ratio';
	import { Badge } from '@/components/ui/badge';
	import { Button } from '@/components/ui/button';
	import { Card } from '@/components/ui/card';
	import type { UserProfile } from '@/types/types';
	import { Tag } from 'lucide-svelte';
	import * as Avatar from '@/components/ui/avatar';
	import { firstAndLastInitials } from '@/utils';

	export let user: UserProfile;

	$: avatarUrl = user.avatar
        ? $page.data.supabase.storage.from('users').getPublicUrl(user.avatar).data.publicUrl
        : '';


	function roleDisplay(role: string): string {
		const roleMap: Record<string, string> = {
			admin: 'Administrador',
			moderator: 'Moderador',
			user: 'Membro'
		};
		return roleMap[role] ?? 'Desconhecido';
	}
</script>

<a href={`/users/${user.id}`} class="h-full">
	<Card class="relative flex h-full flex-col overflow-hidden hover:bg-accent/50">
		<div class="flex flex-1 flex-col px-4 py-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Avatar.Root class="h-8 w-8">
						<Avatar.Image src={avatarUrl} alt={user.display_name} />
						<Avatar.Fallback>{firstAndLastInitials(user.display_name)}</Avatar.Fallback>
					</Avatar.Root>
					<p class="text-sm font-medium">{user.display_name}</p>
					<Badge class="text-[10px] font-normal px-1.5 py-0.5">
						{roleDisplay(user.role)}
					</Badge>
				</div>
				<p class="text-xs text-muted-foreground">{"Juntou-se a " + new Date(user.inserted_at).toLocaleDateString()}</p>
			</div>
		</div>
	</Card>
</a>

