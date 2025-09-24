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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
          last_activity: string | null
          location_info: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          location_info?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          last_activity?: string | null
          location_info?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          item_id: string | null
          message: string
          restaurant_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          item_id?: string | null
          message: string
          restaurant_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          item_id?: string | null
          message?: string
          restaurant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean
          backup_frequency: number
          backup_types: string[]
          created_at: string
          encryption_enabled: boolean
          id: string
          restaurant_id: string
          retention_days: number
          updated_at: string
        }
        Insert: {
          auto_backup_enabled?: boolean
          backup_frequency?: number
          backup_types?: string[]
          created_at?: string
          encryption_enabled?: boolean
          id?: string
          restaurant_id: string
          retention_days?: number
          updated_at?: string
        }
        Update: {
          auto_backup_enabled?: boolean
          backup_frequency?: number
          backup_types?: string[]
          created_at?: string
          encryption_enabled?: boolean
          id?: string
          restaurant_id?: string
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      chain_reports: {
        Row: {
          chain_id: string
          created_at: string
          data: Json
          generated_by: string
          id: string
          period_end: string
          period_start: string
          report_type: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          data: Json
          generated_by: string
          id?: string
          period_end: string
          period_start: string
          report_type: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          data?: Json
          generated_by?: string
          id?: string
          period_end?: string
          period_start?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_reports_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "restaurant_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_settings: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_settings_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "restaurant_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_history: {
        Row: {
          created_at: string
          date: string
          id: string
          item_id: string
          quantity: number
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          item_id: string
          quantity: number
          restaurant_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          item_id?: string
          quantity?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumption_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_history_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          content: string
          created_at: string
          default_image_url: string | null
          id: string
          name: string
          restaurant_id: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          default_image_url?: string | null
          id?: string
          name: string
          restaurant_id: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          default_image_url?: string | null
          id?: string
          name?: string
          restaurant_id?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_templates_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      data_backups: {
        Row: {
          backup_data: Json
          backup_type: string
          checksum: string
          created_at: string
          created_by: string
          id: string
          restaurant_id: string
        }
        Insert: {
          backup_data: Json
          backup_type: string
          checksum: string
          created_at?: string
          created_by: string
          id?: string
          restaurant_id: string
        }
        Update: {
          backup_data?: Json
          backup_type?: string
          checksum?: string
          created_at?: string
          created_by?: string
          id?: string
          restaurant_id?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          priority: number | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          current_stock: number
          id: string
          max_stock: number | null
          min_stock: number
          name: string
          restaurant_id: string
          supplier_id: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          max_stock?: number | null
          min_stock?: number
          name: string
          restaurant_id: string
          supplier_id?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          max_stock?: number | null
          min_stock?: number
          name?: string
          restaurant_id?: string
          supplier_id?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_ingredients: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          menu_item_id: string
          quantity_needed: number
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          menu_item_id: string
          quantity_needed?: number
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          menu_item_id?: string
          quantity_needed?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          cost_price: number
          created_at: string
          description: string | null
          id: string
          is_available: boolean
          name: string
          preparation_time: number | null
          profit_margin: number
          restaurant_id: string
          sale_price: number
          updated_at: string
        }
        Insert: {
          category: string
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name: string
          preparation_time?: number | null
          profit_margin?: number
          restaurant_id: string
          sale_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name?: string
          preparation_time?: number | null
          profit_margin?: number
          restaurant_id?: string
          sale_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_suggestions: {
        Row: {
          created_at: string
          id: string
          is_resolved: boolean
          menu_item_id: string
          message: string
          priority: string
          resolved_at: string | null
          restaurant_id: string
          suggestion_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_resolved?: boolean
          menu_item_id: string
          message: string
          priority?: string
          resolved_at?: string | null
          restaurant_id: string
          suggestion_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_resolved?: boolean
          menu_item_id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          restaurant_id?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_suggestions_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          default_image_url: string | null
          id: string
          is_active: boolean
          is_monthly: boolean
          month_year: string | null
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          default_image_url?: string | null
          id?: string
          is_active?: boolean
          is_monthly?: boolean
          month_year?: string | null
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          default_image_url?: string | null
          id?: string
          is_active?: boolean
          is_monthly?: boolean
          month_year?: string | null
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_history: {
        Row: {
          created_at: string
          id: string
          invoice_number: string | null
          item_name: string
          purchase_date: string
          quantity: number
          restaurant_id: string
          supplier_id: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          item_name: string
          purchase_date: string
          quantity: number
          restaurant_id: string
          supplier_id: string
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          item_name?: string
          purchase_date?: string
          quantity?: number
          restaurant_id?: string
          supplier_id?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_history_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_chains: {
        Row: {
          admin_user_id: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          headquarters_address: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          headquarters_address?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          headquarters_address?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurant_members: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          chain_id: string | null
          created_at: string
          description: string | null
          email: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          chain_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          chain_id?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "restaurant_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_suggestions: {
        Row: {
          created_at: string
          id: string
          item_id: string
          priority: string
          reason: string | null
          restaurant_id: string
          suggested_quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          priority: string
          reason?: string | null
          restaurant_id: string
          suggested_quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          priority?: string
          reason?: string | null
          restaurant_id?: string
          suggested_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "restock_suggestions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_suggestions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          content: string | null
          created_at: string
          format: string
          id: string
          image_url: string | null
          platform: string
          restaurant_id: string
          scheduled_for: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          format: string
          id?: string
          image_url?: string | null
          platform: string
          restaurant_id: string
          scheduled_for: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          format?: string
          id?: string
          image_url?: string | null
          platform?: string
          restaurant_id?: string
          scheduled_for?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string
          device_info: Json | null
          event_details: Json
          event_type: string
          id: string
          ip_address: unknown | null
          location_info: Json | null
          restaurant_id: string | null
          risk_score: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          event_details: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          restaurant_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          event_details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_info?: Json | null
          restaurant_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          payment_terms: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          payment_terms?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          payment_terms?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_responses: {
        Row: {
          created_at: string
          id: string
          is_staff_response: boolean
          message: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff_response?: boolean
          message: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_staff_response?: boolean
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          priority: string
          restaurant_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          restaurant_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          restaurant_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa_settings: {
        Row: {
          backup_codes: string[]
          created_at: string
          failed_attempts: number | null
          id: string
          is_enabled: boolean
          last_used_at: string | null
          locked_until: string | null
          recovery_email: string | null
          secret: string
          setup_completed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[]
          created_at?: string
          failed_attempts?: number | null
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          locked_until?: string | null
          recovery_email?: string | null
          secret: string
          setup_completed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[]
          created_at?: string
          failed_attempts?: number | null
          id?: string
          is_enabled?: boolean
          last_used_at?: string | null
          locked_until?: string | null
          recovery_email?: string | null
          secret?: string
          setup_completed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waste_tracking: {
        Row: {
          cost_impact: number
          created_at: string
          id: string
          inventory_item_id: string
          notes: string | null
          quantity_wasted: number
          registered_by: string
          restaurant_id: string
          unit: string
          updated_at: string
          waste_category: string
          waste_date: string
          waste_reason: string
        }
        Insert: {
          cost_impact?: number
          created_at?: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity_wasted?: number
          registered_by: string
          restaurant_id: string
          unit: string
          updated_at?: string
          waste_category?: string
          waste_date?: string
          waste_reason: string
        }
        Update: {
          cost_impact?: number
          created_at?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity_wasted?: number
          registered_by?: string
          restaurant_id?: string
          unit?: string
          updated_at?: string
          waste_category?: string
          waste_date?: string
          waste_reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_menu_item_cost: {
        Args: { menu_item_id_param: string }
        Returns: number
      }
      check_menu_item_availability: {
        Args: { menu_item_id_param: string }
        Returns: boolean
      }
      check_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_data_backup: {
        Args: {
          _backup_data: Json
          _backup_type: string
          _restaurant_id: string
        }
        Returns: string
      }
      detect_suspicious_login: {
        Args: {
          _event_type?: string
          _ip_address: unknown
          _user_agent: string
          _user_id: string
        }
        Returns: Json
      }
      generate_menu_suggestions: {
        Args: { restaurant_id_param: string }
        Returns: undefined
      }
      generate_waste_reduction_suggestions: {
        Args: { restaurant_id_param: string }
        Returns: {
          estimated_savings: number
          message: string
          priority: string
          suggestion_type: string
        }[]
      }
      get_chain_consolidated_inventory: {
        Args: { chain_id_param: string }
        Returns: {
          avg_cost_per_unit: number
          category: string
          item_name: string
          restaurants_with_item: number
          total_low_stock_restaurants: number
          total_stock: number
          total_value: number
        }[]
      }
      get_chain_inventory_summary: {
        Args: { chain_id_param: string; end_date?: string; start_date?: string }
        Returns: {
          categories_count: number
          low_stock_items: number
          restaurant_id: string
          restaurant_name: string
          total_items: number
          total_value: number
        }[]
      }
      get_chain_menu_performance: {
        Args: { chain_id_param: string }
        Returns: {
          avg_profit_margin: number
          high_cost_items: number
          restaurant_id: string
          restaurant_name: string
          total_menu_items: number
          unavailable_items: number
        }[]
      }
      get_waste_statistics: {
        Args: {
          end_date?: string
          restaurant_id_param: string
          start_date?: string
        }
        Returns: {
          daily_waste_trend: Json
          most_wasted_item: string
          most_wasted_item_cost: number
          total_items_wasted: number
          total_waste_cost: number
          waste_by_category: Json
          waste_by_reason: Json
        }[]
      }
      is_2fa_locked: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_restaurant_admin: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      is_restaurant_member: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
