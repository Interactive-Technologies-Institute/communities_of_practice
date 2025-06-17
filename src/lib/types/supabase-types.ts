import type { MergeDeep } from 'type-fest';
import type { Database as DatabaseGenerated } from './supabase-types.gen.ts';

type Step = { title: string; description: string; image: string };

export type Database = MergeDeep<
	DatabaseGenerated,
	{
		public: {
			Tables: {
				guides: {
					Row: {
						steps: Step[];
					};
					Insert: {
						steps: Step[];
					};
					Update: {
						steps?: Step[];
					};
				};
				notifications: {
					Row: {
						data: Record<string, string>;
					};
					Insert: {
						data?: Record<string, string>;
					};
					Update: {
						data?: Record<string, string>;
					};
				};
			};
			Views: {
				events_view: {
					Row: {
						id: number;
						inserted_at: string;
						updated_at: string;
						user_id: string;
						title: string;
						description: string;
						image: string;
						tags: string[];
						date: string | null;
						start_time: string | null;
						end_time: string | null;
						location: string;
						fts: unknown;
						moderation_status: Database['public']['Enums']['moderation_status'];
						interests_count: number;
					};
				};
				events_tags: {
					Row: {
						count: number;
						tag: string;
					};
				};
				guides_view: {
					Row: {
						description: string;
						difficulty: Database['public']['Enums']['guide_difficulty'];
						duration: Database['public']['Enums']['guide_duration'];
						fts: unknown;
						id: number;
						image: string;
						inserted_at: string;
						moderation_status: Database['public']['Enums']['moderation_status'];
						steps: Step[];
						tags: string[];
						title: string;
						updated_at: string;
						user_id: string;
					};
				};
				guides_tags: {
					Row: {
						count: number;
						tag: string;
					};
				};
				forum_threads_view: {
					Row: {
						id: number;
						inserted_at: string;
						updated_at: string;
						title: string;
						content: string;
						image: string;
						summary: string | null;
						tags: string[];
						fts: unknown;
						moderation_status: Database['public']['Enums']['moderation_status'];
						user_id: string;
						likes_count: number;
						comments_count: number;
					};
				};
				forum_threads_tags: {
					Row: {
						tag: string;
						count: number;
					};
				};
				thread_comments_view: {
					Row: {
						id: number;
						thread_id: number;
						user_id: string;
						content: string;
						inserted_at: string;
						updated_at: string;
						is_reply: boolean;
						parent_id: number | null;
						fts: unknown;
						moderation_status: Database['public']['Enums']['moderation_status'];
						likes_count: number;
					};
				};
				latest_events_moderation: {
					Row: {
						comment: string;
						event_id: number;
						id: number;
						inserted_at: string;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_guides_moderation: {
					Row: {
						comment: string;
						guide_id: number;
						id: number;
						inserted_at: string;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_map_pins_moderation: {
					Row: {
						comment: string;
						id: number;
						inserted_at: string;
						map_pin_id: number;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_forum_threads_moderation: {
					Row: {
						comment: string;
						id: number;
						inserted_at: string;
						thread_id: number;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_thread_comments_moderation: {
					Row: {
						id: number;
						inserted_at: string;
						comment_id: number;
						user_id: string;
						status: Database['public']['Enums']['moderation_status'];
						comment: string;
					};
				};
				map_pins_view: {
					Row: {
						id: number;
						inserted_at: string;
						lat: number;
						lng: number;
						moderation_status: Database['public']['Enums']['moderation_status'];
						updated_at: string;
						user_id: string;
					};
				};
				profiles_view: {
					Row: {
						id: string;
						inserted_at: string;
						updated_at: string;
						email: string;
						type: string;
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
						role: Database['public']['Enums']['user_role'];
					};
				};
			};
			Functions: {
				get_event_interest_count: {
					Args: {
						event_id: number;
						user_id?: string;
					};
					Returns: {
						count: number;
						has_interest: boolean;
					}[];
				};
				get_vote_option_count: {
					Args: {
						voting_option_id: number;
						user_id?: string;
					};
					Returns: {
						vote_count: number;
						has_voted: boolean;
					}[];
				};
				get_guides_ordered_by_useful: {
					Args: {
						sort_order: string;
						search: string;
						tag_filters: string[];
						user_id?: string;
						filter_liked: boolean;
						filter_bookmarked: boolean;
					};
					Returns: Database['public']['Views']['guides_view']['Row'][];
				};
				get_forum_thread_comments_count: {
					Args: {
						thread_id: number;
					};
					Returns: {
						count: number;
					}[];
				};
				get_forum_thread_likes_count: {
					Args: {
					  thread_id: number;
					  user_id?: string;
					};
					Returns: {
					  count: number;
					  has_likes: boolean;
					}[];
				};
				get_thread_comment_likes_count: {
					Args: {
						comment_id: number;
						user_id?: string;
					};
					Returns: {
						count: number;
						has_likes: boolean;
					}[];
				};
			};
		};
	}
>;
