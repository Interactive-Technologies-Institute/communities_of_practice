export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      branding: {
        Row: {
          color_theme: string
          id: number
          inserted_at: string
          logo: string | null
          name: string
          radius: number
          slogan: string
          updated_at: string
        }
        Insert: {
          color_theme: string
          id?: number
          inserted_at?: string
          logo?: string | null
          name: string
          radius: number
          slogan: string
          updated_at?: string
        }
        Update: {
          color_theme?: string
          id?: number
          inserted_at?: string
          logo?: string | null
          name?: string
          radius?: number
          slogan?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          allow_voting: boolean
          date: string | null
          description: string
          end_time: string | null
          final_voting_option_id: number | null
          fts: unknown | null
          id: number
          image: string
          inserted_at: string
          location: string
          start_time: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          voting_end_date: string | null
          voting_end_time: string | null
        }
        Insert: {
          allow_voting?: boolean
          date?: string | null
          description: string
          end_time?: string | null
          final_voting_option_id?: number | null
          fts?: unknown | null
          id?: number
          image: string
          inserted_at?: string
          location: string
          start_time?: string | null
          tags: string[]
          title: string
          updated_at?: string
          user_id: string
          voting_end_date?: string | null
          voting_end_time?: string | null
        }
        Update: {
          allow_voting?: boolean
          date?: string | null
          description?: string
          end_time?: string | null
          final_voting_option_id?: number | null
          fts?: unknown | null
          id?: number
          image?: string
          inserted_at?: string
          location?: string
          start_time?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          voting_end_date?: string | null
          voting_end_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_final_voting_option_id_fkey"
            columns: ["final_voting_option_id"]
            isOneToOne: false
            referencedRelation: "events_voting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_final_voting_option_id_fkey"
            columns: ["final_voting_option_id"]
            isOneToOne: false
            referencedRelation: "events_voting_summary_view"
            referencedColumns: ["voting_option_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      events_interested: {
        Row: {
          event_id: number
          id: number
          inserted_at: string
          user_id: string
        }
        Insert: {
          event_id: number
          id?: number
          inserted_at?: string
          user_id: string
        }
        Update: {
          event_id?: number
          id?: number
          inserted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_interested_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_interested_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_interested_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_interested_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      events_moderation: {
        Row: {
          comment: string
          event_id: number
          id: number
          inserted_at: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          comment: string
          event_id: number
          id?: number
          inserted_at?: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          comment?: string
          event_id?: number
          id?: number
          inserted_at?: string
          status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_moderation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      events_votes: {
        Row: {
          event_id: number
          id: number
          inserted_at: string
          user_id: string
          voting_option_id: number
        }
        Insert: {
          event_id: number
          id?: number
          inserted_at?: string
          user_id: string
          voting_option_id: number
        }
        Update: {
          event_id?: number
          id?: number
          inserted_at?: string
          user_id?: string
          voting_option_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_votes_voting_option_id_fkey"
            columns: ["voting_option_id"]
            isOneToOne: false
            referencedRelation: "events_voting_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_votes_voting_option_id_fkey"
            columns: ["voting_option_id"]
            isOneToOne: false
            referencedRelation: "events_voting_summary_view"
            referencedColumns: ["voting_option_id"]
          },
          {
            foreignKeyName: "fk_events_votes_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_votes_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
        ]
      }
      events_voting_options: {
        Row: {
          date: string
          end_time: string
          event_id: number
          id: number
          start_time: string
        }
        Insert: {
          date: string
          end_time: string
          event_id: number
          id?: number
          start_time: string
        }
        Update: {
          date?: string
          end_time?: string
          event_id?: number
          id?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_voting_options_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_voting_options_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          id: Database["public"]["Enums"]["feature"]
        }
        Insert: {
          enabled?: boolean
          id: Database["public"]["Enums"]["feature"]
        }
        Update: {
          enabled?: boolean
          id?: Database["public"]["Enums"]["feature"]
        }
        Relationships: []
      }
      forum_threads: {
        Row: {
          content: string
          fts: unknown | null
          id: number
          image: string
          inserted_at: string
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          fts?: unknown | null
          id?: number
          image: string
          inserted_at?: string
          summary?: string | null
          tags: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          fts?: unknown | null
          id?: number
          image?: string
          inserted_at?: string
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads_liked: {
        Row: {
          id: number
          inserted_at: string
          thread_id: number
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          thread_id: number
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          thread_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_liked_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_liked_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_liked_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_liked_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads_moderation: {
        Row: {
          comment: string
          id: number
          inserted_at: string
          status: Database["public"]["Enums"]["moderation_status"]
          thread_id: number
          user_id: string
        }
        Insert: {
          comment: string
          id?: number
          inserted_at?: string
          status: Database["public"]["Enums"]["moderation_status"]
          thread_id: number
          user_id: string
        }
        Update: {
          comment?: string
          id?: number
          inserted_at?: string
          status?: Database["public"]["Enums"]["moderation_status"]
          thread_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_moderation_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          description: string
          difficulty: Database["public"]["Enums"]["guide_difficulty"]
          duration: Database["public"]["Enums"]["guide_duration"]
          fts: unknown | null
          id: number
          image: string
          inserted_at: string
          steps: Json[]
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          description: string
          difficulty: Database["public"]["Enums"]["guide_difficulty"]
          duration: Database["public"]["Enums"]["guide_duration"]
          fts?: unknown | null
          id?: number
          image: string
          inserted_at?: string
          steps: Json[]
          tags: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          description?: string
          difficulty?: Database["public"]["Enums"]["guide_difficulty"]
          duration?: Database["public"]["Enums"]["guide_duration"]
          fts?: unknown | null
          id?: number
          image?: string
          inserted_at?: string
          steps?: Json[]
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guides_bookmark: {
        Row: {
          guide_id: number
          id: number
          inserted_at: string
          user_id: string
        }
        Insert: {
          guide_id: number
          id?: number
          inserted_at?: string
          user_id: string
        }
        Update: {
          guide_id?: number
          id?: number
          inserted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_bookmark_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_bookmark_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_bookmark_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_bookmark_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guides_moderation: {
        Row: {
          comment: string
          guide_id: number
          id: number
          inserted_at: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          comment: string
          guide_id: number
          id?: number
          inserted_at?: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          comment?: string
          guide_id?: number
          id?: number
          inserted_at?: string
          status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_moderation_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guides_useful: {
        Row: {
          guide_id: number
          id: number
          inserted_at: string
          user_id: string
        }
        Insert: {
          guide_id: number
          id?: number
          inserted_at?: string
          user_id: string
        }
        Update: {
          guide_id?: number
          id?: number
          inserted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_useful_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_useful_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_useful_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_useful_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      map_pins: {
        Row: {
          id: number
          inserted_at: string
          lat: number
          lng: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          lat: number
          lng: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          lat?: number
          lng?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      map_pins_moderation: {
        Row: {
          comment: string
          id: number
          inserted_at: string
          map_pin_id: number
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          comment: string
          id?: number
          inserted_at?: string
          map_pin_id: number
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          comment?: string
          id?: number
          inserted_at?: string
          map_pin_id?: number
          status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_moderation_map_pin_id_fkey"
            columns: ["map_pin_id"]
            isOneToOne: false
            referencedRelation: "map_pins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_map_pin_id_fkey"
            columns: ["map_pin_id"]
            isOneToOne: false
            referencedRelation: "map_pins_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          data: Json
          id: number
          inserted_at: string
          read: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          data?: Json
          id?: number
          inserted_at?: string
          read?: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          data?: Json
          id?: number
          inserted_at?: string
          read?: boolean
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          date: string | null
          description: string | null
          display_name: string
          education: string[]
          email: string
          gender: string | null
          id: string
          inserted_at: string
          interests: string[]
          languages: string[]
          nationality: string | null
          profession: string | null
          skills: string[]
          type: string
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar?: string | null
          date?: string | null
          description?: string | null
          display_name: string
          education?: string[]
          email: string
          gender?: string | null
          id: string
          inserted_at?: string
          interests?: string[]
          languages?: string[]
          nationality?: string | null
          profession?: string | null
          skills?: string[]
          type: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar?: string | null
          date?: string | null
          description?: string | null
          display_name?: string
          education?: string[]
          email?: string
          gender?: string | null
          id?: string
          inserted_at?: string
          interests?: string[]
          languages?: string[]
          nationality?: string | null
          profession?: string | null
          skills?: string[]
          type?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["user_permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["user_permission"]
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["user_permission"]
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      thread_comments: {
        Row: {
          content: string
          fts: unknown | null
          id: number
          inserted_at: string
          is_reply: boolean
          parent_id: number | null
          thread_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          fts?: unknown | null
          id?: number
          inserted_at?: string
          is_reply?: boolean
          parent_id?: number | null
          thread_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          fts?: unknown | null
          id?: number
          inserted_at?: string
          is_reply?: boolean
          parent_id?: number | null
          thread_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thread_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thread_comments_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_comments_liked: {
        Row: {
          comment_id: number
          id: number
          inserted_at: string
          user_id: string
        }
        Insert: {
          comment_id: number
          id?: number
          inserted_at?: string
          user_id: string
        }
        Update: {
          comment_id?: number
          id?: number
          inserted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_comments_liked_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_liked_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_liked_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_liked_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_comments_moderation: {
        Row: {
          comment: string
          comment_id: number
          id: number
          inserted_at: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Insert: {
          comment: string
          comment_id: number
          id?: number
          inserted_at?: string
          status: Database["public"]["Enums"]["moderation_status"]
          user_id: string
        }
        Update: {
          comment?: string
          comment_id?: number
          id?: number
          inserted_at?: string
          status?: Database["public"]["Enums"]["moderation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_comments_moderation_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      user_types: {
        Row: {
          is_default: boolean
          label: string
          slug: string
        }
        Insert: {
          is_default?: boolean
          label: string
          slug: string
        }
        Update: {
          is_default?: boolean
          label?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      events_tags: {
        Row: {
          count: number | null
          tag: string | null
        }
        Relationships: []
      }
      events_view: {
        Row: {
          allow_voting: boolean | null
          date: string | null
          description: string | null
          end_time: string | null
          fts: unknown | null
          id: number | null
          image: string | null
          inserted_at: string | null
          interests_count: number | null
          location: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          start_time: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          voting_end_date: string | null
          voting_end_time: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      events_voting_summary_view: {
        Row: {
          date: string | null
          end_time: string | null
          event_id: number | null
          start_time: string | null
          vote_count: number | null
          voting_option_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_voting_options_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_voting_options_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads_tags: {
        Row: {
          count: number | null
          tag: string | null
        }
        Relationships: []
      }
      forum_threads_view: {
        Row: {
          comments_count: number | null
          content: string | null
          fts: unknown | null
          id: number | null
          image: string | null
          inserted_at: string | null
          likes_count: number | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          summary: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      guides_tags: {
        Row: {
          count: number | null
          tag: string | null
        }
        Relationships: []
      }
      guides_view: {
        Row: {
          description: string | null
          difficulty: Database["public"]["Enums"]["guide_difficulty"] | null
          duration: Database["public"]["Enums"]["guide_duration"] | null
          fts: unknown | null
          id: number | null
          image: string | null
          inserted_at: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          steps: Json[] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_events_moderation: {
        Row: {
          comment: string | null
          event_id: number | null
          id: number | null
          inserted_at: string | null
          status: Database["public"]["Enums"]["moderation_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_moderation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_forum_threads_moderation: {
        Row: {
          comment: string | null
          id: number | null
          inserted_at: string | null
          status: Database["public"]["Enums"]["moderation_status"] | null
          thread_id: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_moderation_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_guides_moderation: {
        Row: {
          comment: string | null
          guide_id: number | null
          id: number | null
          inserted_at: string | null
          status: Database["public"]["Enums"]["moderation_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guides_moderation_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_map_pins_moderation: {
        Row: {
          comment: string | null
          id: number | null
          inserted_at: string | null
          map_pin_id: number | null
          status: Database["public"]["Enums"]["moderation_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_moderation_map_pin_id_fkey"
            columns: ["map_pin_id"]
            isOneToOne: false
            referencedRelation: "map_pins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_map_pin_id_fkey"
            columns: ["map_pin_id"]
            isOneToOne: false
            referencedRelation: "map_pins_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_thread_comments_moderation: {
        Row: {
          comment: string | null
          comment_id: number | null
          id: number | null
          inserted_at: string | null
          status: Database["public"]["Enums"]["moderation_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_comments_moderation_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "thread_comments_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      map_pins_view: {
        Row: {
          id: number | null
          inserted_at: string | null
          lat: number | null
          lng: number | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_pins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_pins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_view: {
        Row: {
          avatar: string | null
          date: string | null
          description: string | null
          display_name: string | null
          education: string[] | null
          email: string | null
          gender: string | null
          id: string | null
          inserted_at: string | null
          interests: string[] | null
          languages: string[] | null
          nationality: string | null
          profession: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          skills: string[] | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Relationships: []
      }
      thread_comments_view: {
        Row: {
          content: string | null
          fts: unknown | null
          id: number | null
          inserted_at: string | null
          is_reply: boolean | null
          likes_count: number | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          parent_id: number | null
          thread_id: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thread_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "thread_comments_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["user_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      finalize_event_votes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_event_interest_count: {
        Args: { event_id: number; user_id?: string }
        Returns: {
          count: number
          has_interest: boolean
        }[]
      }
      get_forum_thread_comments_count: {
        Args: { thread_id: number }
        Returns: {
          count: number
        }[]
      }
      get_forum_thread_likes_count: {
        Args: { thread_id: number; user_id?: string }
        Returns: {
          count: number
          has_likes: boolean
        }[]
      }
      get_guide_bookmark: {
        Args: { guide_id: number; user_id?: string }
        Returns: {
          has_bookmark: boolean
        }[]
      }
      get_guide_useful_count: {
        Args: { guide_id: number; user_id?: string }
        Returns: {
          count: number
          has_useful: boolean
        }[]
      }
      get_guides_ordered_by_useful: {
        Args: {
          sort_order?: string
          search?: string
          tag_filters?: string[]
          user_id?: string
          filter_liked?: boolean
          filter_bookmarked?: boolean
        }
        Returns: {
          description: string | null
          difficulty: Database["public"]["Enums"]["guide_difficulty"] | null
          duration: Database["public"]["Enums"]["guide_duration"] | null
          fts: unknown | null
          id: number | null
          image: string | null
          inserted_at: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          steps: Json[] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_thread_comment_likes_count: {
        Args: { comment_id: number; user_id?: string }
        Returns: {
          count: number
          has_likes: boolean
        }[]
      }
      get_vote_option_count: {
        Args: { voting_option_id: number; user_id?: string }
        Returns: {
          vote_count: number
          has_voted: boolean
        }[]
      }
      update_user_types: {
        Args: { types: Database["public"]["CompositeTypes"]["user_type"][] }
        Returns: undefined
      }
      verify_user_password: {
        Args: { password: string }
        Returns: boolean
      }
    }
    Enums: {
      feature: "guides" | "events" | "map" | "docs" | "forum_threads" | "users"
      guide_difficulty: "easy" | "medium" | "hard"
      guide_duration: "short" | "medium" | "long"
      moderation_status:
        | "pending"
        | "changes_requested"
        | "approved"
        | "rejected"
      notification_type:
        | "guide_pending"
        | "guide_changes_requested"
        | "guide_approved"
        | "guide_rejected"
        | "event_pending"
        | "event_changes_requested"
        | "event_approved"
        | "event_rejected"
        | "map_pin_pending"
        | "map_pin_changes_requested"
        | "map_pin_approved"
        | "map_pin_rejected"
        | "event_announcement"
        | "forum_thread_announcement"
        | "forum_thread_pending"
        | "forum_thread_changes_requested"
        | "forum_thread_rejected"
        | "forum_thread_approved"
        | "event_voting_closed"
        | "event_voting_reopened"
      user_permission:
        | "user_roles.update"
        | "user_types.update"
        | "features.update"
        | "branding.update"
        | "guides.create"
        | "guides.update"
        | "guides.delete"
        | "guides.moderate"
        | "events.create"
        | "events.update"
        | "events.delete"
        | "events.moderate"
        | "map.create"
        | "map.update"
        | "map.delete"
        | "map.moderate"
        | "forum_threads.create"
        | "forum_threads.update"
        | "forum_threads.delete"
        | "forum_threads.moderate"
        | "thread_comments.create"
        | "thread_comments.update"
        | "thread_comments.delete"
        | "thread_comments.moderate"
      user_role: "user" | "moderator" | "admin"
    }
    CompositeTypes: {
      user_type: {
        slug: string | null
        label: string | null
        is_default: boolean | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      feature: ["guides", "events", "map", "docs", "forum_threads", "users"],
      guide_difficulty: ["easy", "medium", "hard"],
      guide_duration: ["short", "medium", "long"],
      moderation_status: [
        "pending",
        "changes_requested",
        "approved",
        "rejected",
      ],
      notification_type: [
        "guide_pending",
        "guide_changes_requested",
        "guide_approved",
        "guide_rejected",
        "event_pending",
        "event_changes_requested",
        "event_approved",
        "event_rejected",
        "map_pin_pending",
        "map_pin_changes_requested",
        "map_pin_approved",
        "map_pin_rejected",
        "event_announcement",
        "forum_thread_announcement",
        "forum_thread_pending",
        "forum_thread_changes_requested",
        "forum_thread_rejected",
        "forum_thread_approved",
        "event_voting_closed",
        "event_voting_reopened",
      ],
      user_permission: [
        "user_roles.update",
        "user_types.update",
        "features.update",
        "branding.update",
        "guides.create",
        "guides.update",
        "guides.delete",
        "guides.moderate",
        "events.create",
        "events.update",
        "events.delete",
        "events.moderate",
        "map.create",
        "map.update",
        "map.delete",
        "map.moderate",
        "forum_threads.create",
        "forum_threads.update",
        "forum_threads.delete",
        "forum_threads.moderate",
        "thread_comments.create",
        "thread_comments.update",
        "thread_comments.delete",
        "thread_comments.moderate",
      ],
      user_role: ["user", "moderator", "admin"],
    },
  },
} as const
