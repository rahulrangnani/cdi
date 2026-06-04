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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          initiative_partner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          initiative_partner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          initiative_partner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_documents_initiative_partner_id_fkey"
            columns: ["initiative_partner_id"]
            isOneToOne: false
            referencedRelation: "initiative_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      api_specifications: {
        Row: {
          created_at: string
          id: string
          initiative_partner_id: string
          input_parameters: Json | null
          openapi_json: Json | null
          output_parameters: Json | null
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiative_partner_id: string
          input_parameters?: Json | null
          openapi_json?: Json | null
          output_parameters?: Json | null
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiative_partner_id?: string
          input_parameters?: Json | null
          openapi_json?: Json | null
          output_parameters?: Json | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_specifications_initiative_partner_id_fkey"
            columns: ["initiative_partner_id"]
            isOneToOne: false
            referencedRelation: "initiative_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_partner_products: {
        Row: {
          created_at: string
          id: string
          implementation_date: string | null
          initiative_partner_id: string
          notes: string | null
          product_id: string
          updated_at: string
          usage_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          implementation_date?: string | null
          initiative_partner_id: string
          notes?: string | null
          product_id: string
          updated_at?: string
          usage_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          implementation_date?: string | null
          initiative_partner_id?: string
          notes?: string | null
          product_id?: string
          updated_at?: string
          usage_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_partner_products_initiative_partner_id_fkey"
            columns: ["initiative_partner_id"]
            isOneToOne: false
            referencedRelation: "initiative_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_partner_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_partners: {
        Row: {
          annual_cost: number | null
          api_documentation: string | null
          api_notes: string | null
          api_request_sample: string | null
          api_response_sample: string | null
          api_version: string | null
          billing_contact: string | null
          created_at: string
          currency: string | null
          custom_commercial_fields: Json | null
          id: string
          initiative_id: string
          integration_cost: number | null
          media_description: string | null
          media_title: string | null
          media_type: string | null
          media_url: string | null
          partner_id: string
          partner_rank: number | null
          pricing_per_call: number | null
          pricing_unit: string | null
          production_api_key: string | null
          sla_percentage: number | null
          terms_and_conditions: string | null
          uat_api_key: string | null
          updated_at: string
        }
        Insert: {
          annual_cost?: number | null
          api_documentation?: string | null
          api_notes?: string | null
          api_request_sample?: string | null
          api_response_sample?: string | null
          api_version?: string | null
          billing_contact?: string | null
          created_at?: string
          currency?: string | null
          custom_commercial_fields?: Json | null
          id?: string
          initiative_id: string
          integration_cost?: number | null
          media_description?: string | null
          media_title?: string | null
          media_type?: string | null
          media_url?: string | null
          partner_id: string
          partner_rank?: number | null
          pricing_per_call?: number | null
          pricing_unit?: string | null
          production_api_key?: string | null
          sla_percentage?: number | null
          terms_and_conditions?: string | null
          uat_api_key?: string | null
          updated_at?: string
        }
        Update: {
          annual_cost?: number | null
          api_documentation?: string | null
          api_notes?: string | null
          api_request_sample?: string | null
          api_response_sample?: string | null
          api_version?: string | null
          billing_contact?: string | null
          created_at?: string
          currency?: string | null
          custom_commercial_fields?: Json | null
          id?: string
          initiative_id?: string
          integration_cost?: number | null
          media_description?: string | null
          media_title?: string | null
          media_type?: string | null
          media_url?: string | null
          partner_id?: string
          partner_rank?: number | null
          pricing_per_call?: number | null
          pricing_unit?: string | null
          production_api_key?: string | null
          sla_percentage?: number | null
          terms_and_conditions?: string | null
          uat_api_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_partners_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiative_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          overview: string | null
          parent_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          overview?: string | null
          parent_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          overview?: string | null
          parent_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_features: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          initiative_partner_id: string
          is_available: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          initiative_partner_id: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          initiative_partner_id?: string
          is_available?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_features_initiative_partner_id_fkey"
            columns: ["initiative_partner_id"]
            isOneToOne: false
            referencedRelation: "initiative_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          partner_type: string | null
          status: string
          support_email: string | null
          support_hours: string | null
          support_phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          partner_type?: string | null
          status?: string
          support_email?: string | null
          support_hours?: string | null
          support_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          partner_type?: string | null
          status?: string
          support_email?: string | null
          support_hours?: string | null
          support_phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_details: {
        Row: {
          created_at: string
          faq: Json | null
          id: string
          initiative_partner_id: string
          known_issues: string | null
          production_contact_email: string | null
          production_contact_name: string | null
          production_contact_phone: string | null
          sandbox_contact: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          faq?: Json | null
          id?: string
          initiative_partner_id: string
          known_issues?: string | null
          production_contact_email?: string | null
          production_contact_name?: string | null
          production_contact_phone?: string | null
          sandbox_contact?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          faq?: Json | null
          id?: string
          initiative_partner_id?: string
          known_issues?: string | null
          production_contact_email?: string | null
          production_contact_name?: string | null
          production_contact_phone?: string | null
          sandbox_contact?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_details_initiative_partner_id_fkey"
            columns: ["initiative_partner_id"]
            isOneToOne: true
            referencedRelation: "initiative_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
