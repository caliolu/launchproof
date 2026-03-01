export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          stripe_customer_id: string | null;
          plan: "free" | "starter" | "pro";
          onboarding_completed: boolean;
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          plan?: "free" | "starter" | "pro";
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          plan?: "free" | "starter" | "pro";
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid";
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid";
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid";
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          status: "draft" | "active" | "paused" | "completed";
          idea_summary: Json | null;
          target_audience: string | null;
          problem_statement: string | null;
          value_proposition: string | null;
          industry: string | null;
          validation_score: number | null;
          test_started_at: string | null;
          test_ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          status?: "draft" | "active" | "paused" | "completed";
          idea_summary?: Json | null;
          target_audience?: string | null;
          problem_statement?: string | null;
          value_proposition?: string | null;
          industry?: string | null;
          validation_score?: number | null;
          test_started_at?: string | null;
          test_ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          status?: "draft" | "active" | "paused" | "completed";
          idea_summary?: Json | null;
          target_audience?: string | null;
          problem_statement?: string | null;
          value_proposition?: string | null;
          industry?: string | null;
          validation_score?: number | null;
          test_started_at?: string | null;
          test_ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_sessions: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          status: "active" | "completed" | "abandoned";
          current_phase: number;
          extraction_complete: boolean;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          status?: "active" | "completed" | "abandoned";
          current_phase?: number;
          extraction_complete?: boolean;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          status?: "active" | "completed" | "abandoned";
          current_phase?: number;
          extraction_complete?: boolean;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          tool_calls: Json | null;
          tool_results: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          tool_calls?: Json | null;
          tool_results?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          tool_calls?: Json | null;
          tool_results?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      landing_pages: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          template: "minimal" | "bold" | "corporate" | "dark";
          color_scheme: Json;
          content: Json;
          slug: string;
          is_published: boolean;
          published_at: string | null;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          cta_type: "waitlist" | "preorder" | "demo" | "custom";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          template?: "minimal" | "bold" | "corporate" | "dark";
          color_scheme?: Json;
          content: Json;
          slug: string;
          is_published?: boolean;
          published_at?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          cta_type?: "waitlist" | "preorder" | "demo" | "custom";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          template?: "minimal" | "bold" | "corporate" | "dark";
          color_scheme?: Json;
          content?: Json;
          slug?: string;
          is_published?: boolean;
          published_at?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          og_image_url?: string | null;
          cta_type?: "waitlist" | "preorder" | "demo" | "custom";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ad_campaigns: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          channel: "google_search" | "facebook" | "instagram" | "reddit" | "twitter";
          recommended: boolean;
          recommendation_reason: string | null;
          content: Json;
          keyword_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          channel: "google_search" | "facebook" | "instagram" | "reddit" | "twitter";
          recommended?: boolean;
          recommendation_reason?: string | null;
          content: Json;
          keyword_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          channel?: "google_search" | "facebook" | "instagram" | "reddit" | "twitter";
          recommended?: boolean;
          recommendation_reason?: string | null;
          content?: Json;
          keyword_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      signups: {
        Row: {
          id: string;
          landing_page_id: string;
          project_id: string;
          email: string;
          name: string | null;
          source: string | null;
          medium: string | null;
          campaign: string | null;
          referrer: string | null;
          user_agent: string | null;
          ip_country: string | null;
          ip_city: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          project_id: string;
          email: string;
          name?: string | null;
          source?: string | null;
          medium?: string | null;
          campaign?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_country?: string | null;
          ip_city?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          project_id?: string;
          email?: string;
          name?: string | null;
          source?: string | null;
          medium?: string | null;
          campaign?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_country?: string | null;
          ip_city?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          landing_page_id: string;
          project_id: string;
          session_id: string | null;
          source: string | null;
          medium: string | null;
          campaign: string | null;
          referrer: string | null;
          device_type: "desktop" | "tablet" | "mobile" | null;
          ip_country: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          landing_page_id: string;
          project_id: string;
          session_id?: string | null;
          source?: string | null;
          medium?: string | null;
          campaign?: string | null;
          referrer?: string | null;
          device_type?: "desktop" | "tablet" | "mobile" | null;
          ip_country?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          landing_page_id?: string;
          project_id?: string;
          session_id?: string | null;
          source?: string | null;
          medium?: string | null;
          campaign?: string | null;
          referrer?: string | null;
          device_type?: "desktop" | "tablet" | "mobile" | null;
          ip_country?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          user_id: string;
          email_type: "welcome" | "signup_notification" | "weekly_report" | "test_complete";
          recipient: string;
          resend_id: string | null;
          status: "sent" | "delivered" | "bounced" | "failed";
          metadata: Json | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_type: "welcome" | "signup_notification" | "weekly_report" | "test_complete";
          recipient: string;
          resend_id?: string | null;
          status?: "sent" | "delivered" | "bounced" | "failed";
          metadata?: Json | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_type?: "welcome" | "signup_notification" | "weekly_report" | "test_complete";
          recipient?: string;
          resend_id?: string | null;
          status?: "sent" | "delivered" | "bounced" | "failed";
          metadata?: Json | null;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
