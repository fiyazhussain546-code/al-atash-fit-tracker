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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      diet_plans: {
        Row: {
          activity_guidance: string
          ai_draft: Json
          ai_generated_at: string | null
          ai_generation_count: number
          ai_review_flags: string
          ai_review_required: boolean
          breakfast: string
          consultant_name: string
          consultant_note: string
          created_at: string
          dinner: string
          duration_label: string
          evening_snack: string
          foods_limit: string
          foods_prefer: string
          id: string
          lunch: string
          mid_morning: string
          notes: string
          patient_name: string
          plan_title: string
          released_at: string | null
          status: string
          submission_id: string
          updated_at: string
          water_guidance: string
        }
        Insert: {
          activity_guidance?: string
          ai_draft?: Json
          ai_generated_at?: string | null
          ai_generation_count?: number
          ai_review_flags?: string
          ai_review_required?: boolean
          breakfast?: string
          consultant_name?: string
          consultant_note?: string
          created_at?: string
          dinner?: string
          duration_label?: string
          evening_snack?: string
          foods_limit?: string
          foods_prefer?: string
          id?: string
          lunch?: string
          mid_morning?: string
          notes?: string
          patient_name?: string
          plan_title?: string
          released_at?: string | null
          status?: string
          submission_id: string
          updated_at?: string
          water_guidance?: string
        }
        Update: {
          activity_guidance?: string
          ai_draft?: Json
          ai_generated_at?: string | null
          ai_generation_count?: number
          ai_review_flags?: string
          ai_review_required?: boolean
          breakfast?: string
          consultant_name?: string
          consultant_note?: string
          created_at?: string
          dinner?: string
          duration_label?: string
          evening_snack?: string
          foods_limit?: string
          foods_prefer?: string
          id?: string
          lunch?: string
          mid_morning?: string
          notes?: string
          patient_name?: string
          plan_title?: string
          released_at?: string | null
          status?: string
          submission_id?: string
          updated_at?: string
          water_guidance?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          age: string
          bmi: string
          city: string
          consent: boolean
          created_at: string
          form_type: string
          id: string
          name: string
          package_key: string
          payload: Json
          payment_note: string
          payment_proof_path: string
          payment_reference: string
          payment_review_note: string
          payment_reviewed_at: string | null
          payment_status: string
          payment_submitted_at: string | null
          phone: string
          submission_id: string
          submitted_at: string
        }
        Insert: {
          age?: string
          bmi?: string
          city?: string
          consent?: boolean
          created_at?: string
          form_type: string
          id?: string
          name?: string
          package_key?: string
          payload?: Json
          payment_note?: string
          payment_proof_path?: string
          payment_reference?: string
          payment_review_note?: string
          payment_reviewed_at?: string | null
          payment_status?: string
          payment_submitted_at?: string | null
          phone?: string
          submission_id: string
          submitted_at?: string
        }
        Update: {
          age?: string
          bmi?: string
          city?: string
          consent?: boolean
          created_at?: string
          form_type?: string
          id?: string
          name?: string
          package_key?: string
          payload?: Json
          payment_note?: string
          payment_proof_path?: string
          payment_reference?: string
          payment_review_note?: string
          payment_reviewed_at?: string | null
          payment_status?: string
          payment_submitted_at?: string | null
          phone?: string
          submission_id?: string
          submitted_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
