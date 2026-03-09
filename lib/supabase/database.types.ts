// lib/supabase/database.types.ts
// Full schema — kept in sync with Supabase migrations

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AgeGroup         = 'mini' | 'junior' | 'pro' | 'expert'
export type InterestType     = 'coding' | 'ai' | 'games' | 'entrepreneurship' | 'art' | 'robots'
export type TrackType        = 'coding' | 'ai' | 'entrepreneurship'
export type BadgeRarity      = 'common' | 'rare' | 'epic' | 'legendary'
export type ChallengeType    = 'quiz' | 'build' | 'think' | 'share'
export type LessonType       = 'video' | 'reading' | 'interactive' | 'quiz' | 'project'
export type SubscriptionPlan = 'free' | 'pro' | 'school'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:                     string
          email:                  string
          display_name:           string
          avatar:                 string
          age:                    number
          age_group:              AgeGroup
          interests:              InterestType[]
          dream_project:          string | null
          country:                string
          preferred_language:     string
          subscription:           SubscriptionPlan
          parent_email:           string | null
          onboarding_done:        boolean
          is_admin:               boolean
          stripe_customer_id:     string | null
          stripe_subscription_id: string | null
          subscribed_at:          string | null
          subscription_ends_at:   string | null
          trial_started_at:       string | null
          trial_ends_at:          string | null
          created_at:             string
          updated_at:             string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      user_progress: {
        Row: {
          id:               string
          user_id:          string
          xp:               number
          level:            number
          streak:           number
          longest_streak:   number
          last_active_date: string | null
          current_track:    TrackType
          total_time_mins:  number
          freeze_tokens:    number
          created_at:       string
          updated_at:       string
        }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_progress']['Insert']>
      }
      tracks: {
        Row: {
          id:          string
          name:        string
          emoji:       string
          description: string
          color:       string
          sort_order:  number
          is_active:   boolean
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['tracks']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>
      }
      skill_nodes: {
        Row: {
          id:             string
          track_id:       string
          title:          string
          emoji:          string
          description:    string
          xp_reward:      number
          sort_order:     number
          required_nodes: string[]
          age_groups:     AgeGroup[]
          is_active:      boolean
          created_at:     string
          updated_at:     string
        }
        Insert: Omit<Database['public']['Tables']['skill_nodes']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['skill_nodes']['Insert']>
      }
      lessons: {
        Row: {
          id:            string
          skill_node_id: string
          title:         string
          emoji:         string
          description:   string
          content_json:  Json
          lesson_type:   LessonType
          xp_reward:     number
          duration_mins: number
          sort_order:    number
          age_groups:    AgeGroup[]
          is_active:     boolean
          created_at:    string
          updated_at:    string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>
      }
      user_skill_progress: {
        Row: {
          id:            string
          user_id:       string
          skill_node_id: string
          progress_pct:  number
          completed_at:  string | null
          started_at:    string
          updated_at:    string
        }
        Insert: Omit<Database['public']['Tables']['user_skill_progress']['Row'], 'id' | 'started_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_skill_progress']['Insert']>
      }
      user_lesson_completions: {
        Row: {
          id:              string
          user_id:         string
          lesson_id:       string
          score_pct:       number
          time_spent_mins: number
          completed_at:    string
        }
        Insert: Omit<Database['public']['Tables']['user_lesson_completions']['Row'], 'id' | 'completed_at'>
        Update: Partial<Database['public']['Tables']['user_lesson_completions']['Insert']>
      }
      badges: {
        Row: {
          id:          string
          name:        string
          emoji:       string
          description: string
          condition:   string
          rarity:      BadgeRarity
          xp_bonus:    number
          is_active:   boolean
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      user_badges: {
        Row: {
          id:        string
          user_id:   string
          badge_id:  string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'earned_at'>
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>
      }
      daily_challenges: {
        Row: {
          id:          string
          age_group:   AgeGroup
          title:       string
          description: string
          emoji:       string
          xp_reward:   number
          type:        ChallengeType
          active_date: string
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['daily_challenges']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_challenges']['Insert']>
      }
      bonus_challenges: {
        Row: {
          id:          string
          title:       string
          description: string
          emoji:       string
          xp_reward:   number
          type:        ChallengeType
          age_groups:  AgeGroup[]
          is_active:   boolean
          sort_order:  number
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['bonus_challenges']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bonus_challenges']['Insert']>
      }
      user_challenge_completions: {
        Row: {
          id:             string
          user_id:        string
          challenge_id:   string
          challenge_type: 'daily' | 'bonus'
          completed_at:   string
        }
        Insert: Omit<Database['public']['Tables']['user_challenge_completions']['Row'], 'id' | 'completed_at'>
        Update: Partial<Database['public']['Tables']['user_challenge_completions']['Insert']>
      }
      chat_sessions: {
        Row: {
          id:         string
          user_id:    string
          title:      string
          context:    string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['chat_sessions']['Insert']>
      }
      chat_messages: {
        Row: {
          id:         string
          session_id: string
          user_id:    string
          role:       'user' | 'assistant'
          content:    string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      xp_transactions: {
        Row: {
          id:         string
          user_id:    string
          amount:     number
          reason:     string
          source_id:  string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['xp_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['xp_transactions']['Insert']>
      }
      shop_items: {
        Row: {
          id:          string
          name:        string
          emoji:       string
          description: string
          item_type:   string
          xp_cost:     number
          quantity:    number
          is_active:   boolean
          sort_order:  number
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['shop_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shop_items']['Insert']>
      }
      shop_transactions: {
        Row: {
          id:         string
          user_id:    string
          item_id:    string
          xp_spent:   number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shop_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shop_transactions']['Insert']>
      }
      freeze_uses: {
        Row: {
          id:               string
          user_id:          string
          used_date:        string
          protected_streak: number
          created_at:       string
        }
        Insert: Omit<Database['public']['Tables']['freeze_uses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['freeze_uses']['Insert']>
      }
      parent_tokens: {
        Row: {
          id:         string
          user_id:    string
          token:      string
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['parent_tokens']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['parent_tokens']['Insert']>
      }
      lesson_feedback: {
        Row: {
          id:         string
          user_id:    string
          lesson_id:  string
          rating:     number
          feeling:    string
          comment:    string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_feedback']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lesson_feedback']['Insert']>
      }
      subscription_plans: {
        Row: {
          id:          string
          name:        string
          price_usd:   number
          interval:    string
          features:    string[]
          is_active:   boolean
          sort_order:  number
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id:           string
          display_name: string
          avatar:       string
          country:      string
          age_group:    AgeGroup
          xp:           number
          level:        number
          streak:       number
          lessons_count: number
          badges_count:  number
          rank_global:   number
          rank_country:  number
        }
      }
    }
    Functions: {}
    Enums: {
      age_group:      AgeGroup
      interest_type:  InterestType
      track_type:     TrackType
      badge_rarity:   BadgeRarity
      challenge_type: ChallengeType
    }
  }
}
