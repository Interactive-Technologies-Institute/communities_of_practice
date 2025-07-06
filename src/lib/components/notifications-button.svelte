<script lang="ts">
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { ScrollArea } from '@/components/ui/scroll-area';
	import { Separator } from '@/components/ui/separator';
	import type { Notification, NotificationType } from '@/types/types';
	import dayjs from 'dayjs';
	import { Check, Inbox } from 'lucide-svelte';

	export let notifications: Notification[];
	$: unreadCount = notifications.filter((notification) => !notification.read).length;

	let open = false;
	beforeNavigate(() => {
		open = false;
	});

	const notificationTypeToLabel: Record<NotificationType, string> = {
		guide_pending: 'Your guide is pending moderation',
		guide_changes_requested: 'Your guide needs changes',
		guide_approved: 'Your guide has been approved',
		guide_rejected: 'Your guide has been rejected',
		event_pending: 'Your event is pending moderation',
		event_pending_moderation: 'An event is pending moderation',
		event_changes_requested: 'Your event needs changes',
		event_approved: 'Your event has been approved',
		event_rejected: 'Your event has been rejected',
		event_announcement: 'A new event has been approved',
		event_voting_closed: 'Voting has ended on an event',
		event_voting_closed_no_votes: 'Your event voting has ended with no votes',
		event_voting_reopened: 'Voting has reopened on an event',
		map_pin_pending: 'Your map pin is pending moderation',
		map_pin_changes_requested: 'Your map pin needs changes',
		map_pin_approved: 'Your map pin has been approved',
		map_pin_rejected: 'Your map pin has been rejected',
		forum_thread_pending: 'Your thread is pending moderation',
		forum_thread_changes_requested: 'Your thread needs changes',
		forum_thread_approved: 'Your thread has been approved',
		forum_thread_rejected: 'Your thread has been rejected',
		forum_thread_announcement: 'A new thread has been approved',
		content_pending: 'Your content is pending moderation',
		content_changes_requested: 'Your content needs changes',
		content_approved: 'Your content has been approved',
		content_rejected: 'Your content has been rejected',
		content_announcement: 'A new content has been approved',
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
	<Popover.Content class="w-80 p-0" align="end">
		<div class="flex flex-col gap-y-1 p-4">
			<p class="font-medium leading-none">Notifications</p>
			<p class="text-sm text-muted-foreground">
				{#if unreadCount > 0}
					You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
				{:else}
					No unread notifications
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
					Mark all as read
				</Button>
			</form>
		</div>
	</Popover.Content>
</Popover.Root>
