import type { User } from '@supabase/supabase-js';

export type Feature = 'map' | 'guides' | 'events' | 'docs' | 'forum_threads' | 'users';

export type UserRole = 'user' | 'moderator' | 'admin';

export type UserWithRole = User & { role: UserRole };

export type UserProfile = {
	id: string;
	inserted_at: string;
	updated_at: string;
	role: UserRole;
	type: string;
	email: string;
	display_name: string;
	description: string | null;
	avatar: string | null;
	date: string | null;
	profession: string | null;
	website: string | null;
	gender: string | null;
	nationality: string | null;
	interests: string[];
	skills: string[];
	education: string[];
	languages: string[];
};

export type UserType = {
	slug: string;
	label: string;
	is_default: boolean;
};

export type Branding = {
	name: string;
	slogan: string;
	logo?: string | null;
	color_theme: string;
	radius: number;
};

export type ModerationStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export type ModerationInfo = {
	status: ModerationStatus;
	inserted_at: string;
	comment: string;
};

export type MapPin = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	lng: number;
	lat: number;
	moderation_status: ModerationStatus;
};

export type MapPinWithModeration = MapPin & { moderation: ModerationInfo[] };

export type UserProfileWithPin = UserProfile & { pin: MapPin | null };

export type GuideDifficulty = 'easy' | 'medium' | 'hard';

export type GuideDuration = 'short' | 'medium' | 'long';

export type Guide = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	title: string;
	description: string;
	image: string;
	tags: string[];
	difficulty: GuideDifficulty;
	duration: GuideDuration;
	steps: GuideStep[];
	moderation_status: ModerationStatus;
};

export type GuideWithAuthor = Guide & { author: UserProfile };

export type GuideWithModeration = Guide & { moderation: ModerationInfo[] };

type GuideStep = {
	title: string;
	description: string;
	image: string;
};

export type Doc = {
	slug: string;
	title: string;
};

export type DocGroup = {
	slug: string;
	title: string;
	docs: Doc[];
};

export type EventStatus = 'voting_open' | 'no_one_voted' | 'scheduled' | 'ongoing' | 'completed' | null;

export type Event = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	title: string;
	description: string;
	tags: string[];
	image: string;
	location: string;
	date: string | null;
	start_time: string | null;
	end_time: string | null;
	allow_voting: boolean;
	voting_end_date: string | null;
	voting_end_time: string | null;
	status: EventStatus;
	moderation_status: ModerationStatus;
	final_voting_option_id?: number | null;
};

export type EventWithCounters = Event & { interests_count: number };

export type EventVotingOption = {
	id: number;
	event_id: number;
	date: string;
	start_time: string;
	end_time: string;
};

export type EventWithVotingOptions = Event & {
	voting_options: EventVotingOption[];
};

export type VotingSummary = {
	event_id: number;
	voting_option_id: number;
	date: string;
	start_time: string;
	end_time: string;
	vote_count: number;
};

export type EventVote = {
	id: number;
	inserted_at: string;
	user_id: string;
	voting_option_id: number;
};


export type EventWithAuthor = Event & { author: UserProfile };

export type EventWithModeration = Event & { moderation: ModerationInfo[] };

export type Thread = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	title: string;
	content: string;
	summary?:string | null;
	tags: string[];
	image?: string;
	moderation_status: ModerationStatus;
};

export type ThreadWithAuthorAndCounters = Thread & { author: UserProfile, likes_count: number, comments_count: number };

export type ThreadWithAuthor = Thread & { author: UserProfile };

export type ThreadWithModeration = Thread & { moderation: ModerationInfo[] };

export type ThreadComment = {
	id: number;
	thread_id: number;
	user_id: string;
	content: string;
	inserted_at: string;
	updated_at: string;
	is_reply: boolean;
	parent_id: number | null;
  };  

  export type ThreadCommentWithAuthorAndLikes = ThreadComment & { author: UserProfile, likes_count: number };

  export type NestedComment = ThreadCommentWithAuthorAndLikes & { replies: NestedComment[], parent_author?: string;};

export type NotificationType =
	| 'guide_pending'
	| 'guide_changes_requested'
	| 'guide_approved'
	| 'guide_rejected'
	| 'event_pending'
	| 'event_pending_moderation'
	| 'event_changes_requested'
	| 'event_approved'
	| 'event_rejected'
	| 'event_announcement'
	| 'event_voting_closed'
	| 'event_voting_closed_no_votes'
	| 'event_voting_reopened'
	| 'map_pin_pending'
	| 'map_pin_changes_requested'
	| 'map_pin_approved'
	| 'map_pin_rejected'
	| 'forum_thread_pending'
	| 'forum_thread_changes_requested'
	| 'forum_thread_approved'
	| 'forum_thread_rejected'
	| 'forum_thread_announcement';

export type Notification = {
	id: number;
	inserted_at: string;
	user_id: string;
	type: NotificationType;
	data: Record<string, string>;
	read: boolean;
};
