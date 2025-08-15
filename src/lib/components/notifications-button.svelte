<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { Separator } from '@/components/ui/separator';
	import type { Notification, NotificationType } from '@/types/types';
	import dayjs from '$lib/dayjs';
	import { Check, Inbox } from 'lucide-svelte';

	export let notifications: Notification[];
	$: unreadCount = notifications.filter((notification) => !notification.read).length;

	let open = false;
	beforeNavigate(() => {
		open = false;
	});

	const notificationTypeToLabel: Record<NotificationType, string> = {
		guide_pending: 'O teu guia está pendente de moderação',
		guide_changes_requested: 'O teu guia necessita de alterações',
		guide_approved: 'O teu guia foi aprovado',
		guide_rejected: 'O teu guia foi rejeitado',
		event_pending: 'O teu evento está pendente de moderação',
		event_pending_moderation: 'Um evento está pendente de moderação',
		event_changes_requested: 'O teu evento necessita de alterações',
		event_approved: 'O teu evento foi aprovado',
		event_rejected: 'O teu evento foi rejeitado',
		event_announcement: 'Um novo evento foi aprovado',
		event_voting_closed: 'A votação de um evento foi encerrada',
		event_voting_closed_no_votes: 'A votação do teu evento foi encerrada sem votos',
		event_voting_reopened: 'A votação de um evento foi reaberta',
		map_pin_pending: 'O teu marcador no mapa está pendente de moderação',
		map_pin_changes_requested: 'O teu marcador no mapa necessita de alterações',
		map_pin_approved: 'O teu marcador no mapa foi aprovado',
		map_pin_rejected: 'O teu marcador no mapa foi rejeitado',
		forum_thread_pending: 'O teu tópico está pendente de moderação',
		forum_thread_changes_requested: 'O teu tópico de discussão necessita de alterações',
		forum_thread_approved: 'O teu tópico de discussão foi aprovado',
		forum_thread_rejected: 'O teu tópico de discussão foi rejeitado',
		forum_thread_announcement: 'Um novo tópico de discussão foi aprovado',
		content_pending: 'O teu conteúdo está pendente de moderação',
		content_pending_moderation: 'Um conteúdo está pendente de moderação',
		content_changes_requested: 'O teu conteúdo necessita de alterações',
		content_approved: 'O teu conteúdo foi aprovado',
		content_rejected: 'O teu conteúdo foi rejeitado',
		content_announcement: 'Um novo conteúdo foi aprovado',
	};

	function getNotificationHref(notification: Notification): string {
		switch (notification.type) {
			case 'guide_pending':
			case 'guide_changes_requested':
			case 'guide_approved':
			case 'guide_rejected':
				return `/guides/${notification.data.guide_id ?? 'error'}`;
			case 'event_pending':
			case 'event_pending_moderation':
			case 'event_changes_requested':
			case 'event_approved':
			case 'event_rejected':
			case 'event_announcement':
			case 'event_voting_closed':
			case 'event_voting_reopened':
				return `/events/${notification.data.event_id ?? 'error'}`;
			case 'event_voting_closed_no_votes':
				return `/events/${notification.data.event_id ?? 'error'}/edit`;
			case 'map_pin_pending':
			case 'map_pin_changes_requested':
			case 'map_pin_approved':
			case 'map_pin_rejected':
				return `/map?id=${notification.data.map_pin_id ?? 'error'}`;
			case 'forum_thread_pending':
			case 'forum_thread_changes_requested':
			case 'forum_thread_approved':
			case 'forum_thread_rejected':
			case 'forum_thread_announcement':
				return `/forum/${notification.data.thread_id ?? 'error'}`;
			case 'content_pending':
			case 'content_pending_moderation':
			case 'content_changes_requested':
			case 'content_approved':
			case 'content_rejected':
			case 'content_announcement':
				return `/contents/${notification.data.content_id ?? 'error'}`;
			default:
				return 'error';
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger asChild let:builder>
		<Button variant="outline" size="icon-sm" builders={[builder]}>
			<div class="relative">
				<Inbox class="h-4 w-4" />
				{#if unreadCount > 0}
					<div class="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary"></div>
				{/if}
			</div>
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-90 p-0" align="end">
		<div class="flex flex-col gap-y-1 p-4">
			<p class="font-medium leading-none">Notificações</p>
			<p class="text-sm text-muted-foreground">
				{#if unreadCount > 0}
					Tens {unreadCount} {unreadCount === 1 ? 'notificação' : 'notificações'} por ler
				{:else}
					Não tens notificações por ler
				{/if}
			</p>
		</div>
		<Separator />
		<ScrollArea>
			<div class="flex max-h-56 flex-col gap-y-2 py-2">
				{#each notifications as notification (notification.id)}
					<form method="POST" action="/?/readNotification" use:enhance>
						<input type="hidden" name="id" value={notification.id} />
						<Button
							href={getNotificationHref(notification)}
							on:click={(event) => {
								event.preventDefault();
								event.currentTarget.closest('form')?.requestSubmit();
								window.location.href = getNotificationHref(notification);
							}}
							variant="ghost"
							class="mx-2 flex h-auto flex-col items-start gap-y-1 px-2"
						>
							<div class="flex flex-row items-center gap-x-2">
								{#if !notification.read}
									<span class="h-2 w-2 rounded-full bg-primary"></span>
								{/if}
								<p class="text-sm font-medium leading-none">
									{notificationTypeToLabel[notification.type]}
								</p>
							</div>
							<p class="text-sm text-muted-foreground">
								{dayjs(notification.inserted_at).fromNow()}
							</p>
						</Button>
					</form>
				{/each}
			</div>
		</ScrollArea>
		<div class="p-4">
			<form method="POST" action="/?/readAllNotifications" use:enhance>
				<Button type="submit" class="w-full">
					<Check class="mr-2 h-4 w-4" />
					Marcar todas como lidas
				</Button>
			</form>
		</div>
	</Popover.Content>
</Popover.Root>
