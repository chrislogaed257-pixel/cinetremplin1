export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounting_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sheets: {
        Row: {
          call_time: string
          created_at: string
          created_by: string | null
          crew: string
          extra: Json
          id: string
          location: string
          notes: string
          project_id: string | null
          service_date: string
          title: string
          updated_at: string
        }
        Insert: {
          call_time?: string
          created_at?: string
          created_by?: string | null
          crew?: string
          extra?: Json
          id?: string
          location?: string
          notes?: string
          project_id?: string | null
          service_date: string
          title: string
          updated_at?: string
        }
        Update: {
          call_time?: string
          created_at?: string
          created_by?: string | null
          crew?: string
          extra?: Json
          id?: string
          location?: string
          notes?: string
          project_id?: string | null
          service_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sheets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_applications: {
        Row: {
          age: string
          availability: string
          call_id: string
          cinema_experience: boolean | null
          city: string
          comment: string
          created_at: string
          email: string
          extra: Json
          full_name: string
          id: string
          link: string
          member_id: string | null
          neighborhood: string
          note: string
          phone: string
          province: string
          response_sent_at: string | null
          spoken_language: string
          status: string
          updated_at: string
        }
        Insert: {
          age?: string
          availability?: string
          call_id: string
          cinema_experience?: boolean | null
          city?: string
          comment?: string
          created_at?: string
          email: string
          extra?: Json
          full_name: string
          id?: string
          link?: string
          member_id?: string | null
          neighborhood?: string
          note?: string
          phone?: string
          province?: string
          response_sent_at?: string | null
          spoken_language?: string
          status?: string
          updated_at?: string
        }
        Update: {
          age?: string
          availability?: string
          call_id?: string
          cinema_experience?: boolean | null
          city?: string
          comment?: string
          created_at?: string
          email?: string
          extra?: Json
          full_name?: string
          id?: string
          link?: string
          member_id?: string | null
          neighborhood?: string
          note?: string
          phone?: string
          province?: string
          response_sent_at?: string | null
          spoken_language?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "casting_applications_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "casting_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casting_applications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_calls: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_open: boolean
          project_id: string | null
          public_token: string
          selection_finalized_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          project_id?: string | null
          public_token?: string
          selection_finalized_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          project_id?: string | null
          public_token?: string
          selection_finalized_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "casting_calls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casting_calls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      club_archives: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          entity_id: string | null
          id: string
          snapshot: Json
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          id?: string
          snapshot?: Json
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          id?: string
          snapshot?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_archives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          end_date: string | null
          extra: Json
          id: string
          profile_id: string
          project_id: string | null
          role_title: string
          start_date: string | null
          status: string
          terms: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          extra?: Json
          id?: string
          profile_id: string
          project_id?: string | null
          role_title?: string
          start_date?: string | null
          status?: string
          terms?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          extra?: Json
          id?: string
          profile_id?: string
          project_id?: string | null
          role_title?: string
          start_date?: string | null
          status?: string
          terms?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          amount: number
          contributed_on: string
          created_at: string
          funder_id: string
          id: string
          note: string
          project_id: string | null
        }
        Insert: {
          amount: number
          contributed_on?: string
          created_at?: string
          funder_id: string
          id?: string
          note?: string
          project_id?: string | null
        }
        Update: {
          amount?: number
          contributed_on?: string
          created_at?: string
          funder_id?: string
          id?: string
          note?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_funder_id_fkey"
            columns: ["funder_id"]
            isOneToOne: false
            referencedRelation: "funders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_reads: {
        Row: {
          conversation_id: string
          id: string
          last_read_at: string
          profile_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          last_read_at?: string
          profile_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          last_read_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_reads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_reads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          kind: string
          ref_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          ref_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          ref_id?: string | null
          title?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phase: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phase: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phase?: string
          sort_order?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          contribution_id: string | null
          created_at: string
          created_by: string | null
          description: string
          funder_id: string | null
          id: string
          project_id: string | null
          spent_on: string
          subcategory: string
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          contribution_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          funder_id?: string | null
          id?: string
          project_id?: string | null
          spent_on?: string
          subcategory?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          contribution_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          funder_id?: string | null
          id?: string
          project_id?: string | null
          spent_on?: string
          subcategory?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_funder_id_fkey"
            columns: ["funder_id"]
            isOneToOne: false
            referencedRelation: "funders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      festivals: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          id: string
          kind: string
          name: string
          notes: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          kind?: string
          name: string
          notes?: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          kind?: string
          name?: string
          notes?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "festivals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          active: boolean
          created_at: string
          field_key: string
          field_type: string
          id: string
          label: string
          required: boolean
          scope: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          field_key: string
          field_type?: string
          id?: string
          label: string
          required?: boolean
          scope: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          field_key?: string
          field_type?: string
          id?: string
          label?: string
          required?: boolean
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      funders: {
        Row: {
          contact_ref: string
          created_at: string
          email: string
          extended_access: boolean
          id: string
          location: string
          name: string
          relation_member_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_ref?: string
          created_at?: string
          email?: string
          extended_access?: boolean
          id?: string
          location?: string
          name: string
          relation_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_ref?: string
          created_at?: string
          email?: string
          extended_access?: boolean
          id?: string
          location?: string
          name?: string
          relation_member_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funders_relation_member_id_fkey"
            columns: ["relation_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_votes: {
        Row: {
          comment: string
          created_at: string
          decision: string
          id: string
          idea_id: string
          voter_id: string
          voter_position: string
        }
        Insert: {
          comment: string
          created_at?: string
          decision: string
          id?: string
          idea_id: string
          voter_id: string
          voter_position: string
        }
        Update: {
          comment?: string
          created_at?: string
          decision?: string
          id?: string
          idea_id?: string
          voter_id?: string
          voter_position?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          description: string
          drive_link: string | null
          file_url: string | null
          id: string
          responded: boolean
          responded_at: string | null
          response_note: string | null
          status: string
          submitter_email: string
          submitter_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          drive_link?: string | null
          file_url?: string | null
          id?: string
          responded?: boolean
          responded_at?: string | null
          response_note?: string | null
          status?: string
          submitter_email: string
          submitter_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          drive_link?: string | null
          file_url?: string | null
          id?: string
          responded?: boolean
          responded_at?: string | null
          response_note?: string | null
          status?: string
          submitter_email?: string
          submitter_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      leave_decisions: {
        Row: {
          comment: string
          created_at: string
          decider_id: string
          decision: string
          id: string
          leave_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          decider_id: string
          decision: string
          id?: string
          leave_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          decider_id?: string
          decision?: string
          id?: string
          leave_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_decisions_decider_id_fkey"
            columns: ["decider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_decisions_leave_id_fkey"
            columns: ["leave_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          created_at: string
          id: string
          reason: string
          requester_id: string
          return_date: string
          start_date: string
          status: string
          updated_at: string
          validator_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          requester_id: string
          return_date: string
          start_date: string
          status?: string
          updated_at?: string
          validator_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          requester_id?: string
          return_date?: string
          start_date?: string
          status?: string
          updated_at?: string
          validator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_validator_id_fkey"
            columns: ["validator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_open: boolean
          meet_url: string
          public_token: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          meet_url: string
          public_token?: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_open?: boolean
          meet_url?: string
          public_token?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          mentor_name: string
          project_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentor_name: string
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentor_name?: string
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          email: string
          full_name?: string
          id?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          key: string
          label: string
          subject: string
          updated_at: string
        }
        Insert: {
          body?: string
          key: string
          label: string
          subject?: string
          updated_at?: string
        }
        Update: {
          body?: string
          key?: string
          label?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_id: string
          content: string
          conversation_id: string
          created_at: string
          drive_link: string | null
          id: string
        }
        Insert: {
          author_id: string
          content?: string
          conversation_id: string
          created_at?: string
          drive_link?: string | null
          id?: string
        }
        Update: {
          author_id?: string
          content?: string
          conversation_id?: string
          created_at?: string
          drive_link?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
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
        ]
      }
      password_messages: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          from_member: boolean
          id: string
          request_id: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          created_at?: string
          from_member?: boolean
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          from_member?: boolean
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "password_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "password_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      password_requests: {
        Row: {
          created_at: string
          id: string
          requester_email: string
          requester_id: string | null
          status: string
          target_position: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          requester_email: string
          requester_id?: string | null
          status?: string
          target_position: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          requester_email?: string
          requester_id?: string | null
          status?: string
          target_position?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      position_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "position_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_managers: {
        Row: {
          created_at: string
          id: string
          manager_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_managers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_managers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_position_history: {
        Row: {
          created_at: string
          ended_on: string | null
          id: string
          position_name: string
          profile_id: string
          rank_label: string
          started_on: string
        }
        Insert: {
          created_at?: string
          ended_on?: string | null
          id?: string
          position_name: string
          profile_id: string
          rank_label?: string
          started_on?: string
        }
        Update: {
          created_at?: string
          ended_on?: string | null
          id?: string
          position_name?: string
          profile_id?: string
          rank_label?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_position_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_positions: {
        Row: {
          created_at: string
          id: string
          position_id: string
          profile_id: string
          rank_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          position_id: string
          profile_id: string
          rank_label?: string
        }
        Update: {
          created_at?: string
          id?: string
          position_id?: string
          profile_id?: string
          rank_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_positions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_positions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          dislikes: string
          email: string
          full_name: string
          id: string
          likes: string
          manager_id: string | null
          must_change_password: boolean
          position: string
          role_description: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dislikes?: string
          email: string
          full_name: string
          id: string
          likes?: string
          manager_id?: string | null
          must_change_password?: boolean
          position?: string
          role_description?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dislikes?: string
          email?: string
          full_name?: string
          id?: string
          likes?: string
          manager_id?: string | null
          must_change_password?: boolean
          position?: string
          role_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          added_by: string | null
          comment: string
          created_at: string
          id: string
          profile_id: string
          project_id: string
          status: string
        }
        Insert: {
          added_by?: string | null
          comment?: string
          created_at?: string
          id?: string
          profile_id: string
          project_id: string
          status?: string
        }
        Update: {
          added_by?: string | null
          comment?: string
          created_at?: string
          id?: string
          profile_id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phase_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_phase_id: string | null
          from_state: string
          id: string
          project_id: string
          to_phase_id: string | null
          to_state: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_phase_id?: string | null
          from_state?: string
          id?: string
          project_id: string
          to_phase_id?: string | null
          to_state?: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_phase_id?: string | null
          from_state?: string
          id?: string
          project_id?: string
          to_phase_id?: string | null
          to_state?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phase_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phase_history_from_phase_id_fkey"
            columns: ["from_phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phase_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phase_history_to_phase_id_fkey"
            columns: ["to_phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      project_statuses: {
        Row: {
          active: boolean
          advanced: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          advanced?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          advanced?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          idea_id: string | null
          logline: string
          phase_id: string | null
          state: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          idea_id?: string | null
          logline?: string
          phase_id?: string | null
          state?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          idea_id?: string | null
          logline?: string
          phase_id?: string | null
          state?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      report_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          link: string | null
          report_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          link?: string | null
          report_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          link?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          author_id: string
          content: string
          created_at: string
          decided_at: string | null
          decision: string
          decision_comment: string
          extension_due_date: string | null
          id: string
          link: string | null
          project_id: string | null
          recipient_id: string | null
          status: Database["public"]["Enums"]["report_status"]
          task_id: string | null
          title: string
        }
        Insert: {
          author_id: string
          content?: string
          created_at?: string
          decided_at?: string | null
          decision?: string
          decision_comment?: string
          extension_due_date?: string | null
          id?: string
          link?: string | null
          project_id?: string | null
          recipient_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          task_id?: string | null
          title: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          decided_at?: string | null
          decision?: string
          decision_comment?: string
          extension_due_date?: string | null
          id?: string
          link?: string | null
          project_id?: string | null
          recipient_id?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          author_id: string
          category: string
          created_at: string
          description: string
          id: string
          title: string
          url: string
        }
        Insert: {
          author_id: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          title: string
          url: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          created_at: string
          description: string
          drive_link: string | null
          due_date: string | null
          estimated_duration: string
          id: string
          owner_id: string
          phase_id: string | null
          project_id: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          submission_link: string | null
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          description?: string
          drive_link?: string | null
          due_date?: string | null
          estimated_duration?: string
          id?: string
          owner_id: string
          phase_id?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_link?: string | null
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          description?: string
          drive_link?: string | null
          due_date?: string | null
          estimated_duration?: string
          id?: string
          owner_id?: string
          phase_id?: string | null
          project_id?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          submission_link?: string | null
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          leader_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vote_access_codes: {
        Row: {
          code: string
          id: string
          session_id: string
          used: boolean
        }
        Insert: {
          code: string
          id?: string
          session_id: string
          used?: boolean
        }
        Update: {
          code?: string
          id?: string
          session_id?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vote_access_codes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_ballots: {
        Row: {
          created_at: string
          id: string
          project_id: string
          session_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          session_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          session_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_ballots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_ballots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vote_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_ballots_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_projects: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          session_id: string
          sort_order: number
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          id?: string
          session_id: string
          sort_order?: number
          title?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          session_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_projects_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_quotas: {
        Row: {
          id: string
          session_id: string
          used: number
          voted_codes: string[]
          voter_token: string
        }
        Insert: {
          id?: string
          session_id: string
          used?: number
          voted_codes?: string[]
          voter_token: string
        }
        Update: {
          id?: string
          session_id?: string
          used?: number
          voted_codes?: string[]
          voter_token?: string
        }
        Relationships: []
      }
      vote_security_events: {
        Row: {
          created_at: string
          detail: string
          event_type: string
          id: string
          session_id: string
          token_fingerprint: string
        }
        Insert: {
          created_at?: string
          detail?: string
          event_type: string
          id?: string
          session_id: string
          token_fingerprint?: string
        }
        Update: {
          created_at?: string
          detail?: string
          event_type?: string
          id?: string
          session_id?: string
          token_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_security_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_sessions: {
        Row: {
          access_code: string
          access_login: string
          archived_at: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          individual_codes: boolean
          live_results: boolean
          max_votes: number
          mentor_token: string | null
          opened_at: string | null
          proclamation: string
          public_token: string | null
          require_distinct: boolean
          result_snapshot: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          access_code?: string
          access_login?: string
          archived_at?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          individual_codes?: boolean
          live_results?: boolean
          max_votes?: number
          mentor_token?: string | null
          opened_at?: string | null
          proclamation?: string
          public_token?: string | null
          require_distinct?: boolean
          result_snapshot?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_code?: string
          access_login?: string
          archived_at?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          individual_codes?: boolean
          live_results?: boolean
          max_votes?: number
          mentor_token?: string | null
          opened_at?: string | null
          proclamation?: string
          public_token?: string | null
          require_distinct?: boolean
          result_snapshot?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_tallies: {
        Row: {
          id: string
          project_code: string
          session_id: string
        }
        Insert: {
          id?: string
          project_code: string
          session_id: string
        }
        Update: {
          id?: string
          project_code?: string
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_vote_session: {
        Args: { _proclamation: string; _session: string; _snapshot: Json }
        Returns: undefined
      }
      can_access_conversation: {
        Args: { _conv: string; _user_id: string }
        Returns: boolean
      }
      can_advance_project: { Args: { _user_id: string }; Returns: boolean }
      can_manage_accounting: { Args: { _user_id: string }; Returns: boolean }
      can_see_ideas: { Args: { _user_id: string }; Returns: boolean }
      can_view_user: {
        Args: { _target: string; _viewer: string }
        Returns: boolean
      }
      can_vote_ideas: { Args: { _user_id: string }; Returns: boolean }
      cast_anonymous_vote: {
        Args: { _code: string; _session: string; _token: string }
        Returns: Json
      }
      decide_task_report: {
        Args: {
          _comment: string
          _decision: string
          _extension?: string
          _report: string
        }
        Returns: undefined
      }
      funder_can_see: {
        Args: { _funder: string; _user_id: string }
        Returns: boolean
      }
      has_position: {
        Args: { _position: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      in_team: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_descendant: {
        Args: { _ancestor: string; _descendant: string }
        Returns: boolean
      }
      is_leave_validator: {
        Args: { _requester: string; _user_id: string }
        Returns: boolean
      }
      is_participant: {
        Args: { _conv: string; _user_id: string }
        Returns: boolean
      }
      is_supervisor: { Args: { _user_id: string }; Returns: boolean }
      send_pending_reminders: { Args: never; Returns: number }
      submit_task_result: {
        Args: { _link: string; _task: string }
        Returns: string
      }
      vote_results: {
        Args: { _session: string }
        Returns: {
          project_id: string
          votes: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "member" | "mentor" | "funder"
      report_status: "sent" | "read" | "validated"
      task_status: "todo" | "doing" | "done" | "reassign"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "mentor", "funder"],
      report_status: ["sent", "read", "validated"],
      task_status: ["todo", "doing", "done", "reassign"],
    },
  },
} as const
