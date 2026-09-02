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
      eyecare_appointments: {
        Row: {
          appointment_date: string | null
          appointment_time: string
          appointment_type: string
          created_at: string
          doctor_name: string
          id: string
          notes: string
          patient_uid: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string
          appointment_type?: string
          created_at?: string
          doctor_name?: string
          id?: string
          notes?: string
          patient_uid: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string
          appointment_type?: string
          created_at?: string
          doctor_name?: string
          id?: string
          notes?: string
          patient_uid?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_appointments_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_assessments: {
        Row: {
          assessment_date: string
          budget: string
          consultant_notes: string
          created_at: string
          id: string
          patient_priority: string
          patient_uid: string
          previous_diagnosis: string
          previous_doctor: string
          previous_reports: string
          previous_treatment: string
          reports_available: string
          required_specialist: string
          second_opinion_required: string
          surgery_suggested: string
          symptoms: string
          travel_preference: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          budget?: string
          consultant_notes?: string
          created_at?: string
          id?: string
          patient_priority?: string
          patient_uid: string
          previous_diagnosis?: string
          previous_doctor?: string
          previous_reports?: string
          previous_treatment?: string
          reports_available?: string
          required_specialist?: string
          second_opinion_required?: string
          surgery_suggested?: string
          symptoms?: string
          travel_preference?: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          budget?: string
          consultant_notes?: string
          created_at?: string
          id?: string
          patient_priority?: string
          patient_uid?: string
          previous_diagnosis?: string
          previous_doctor?: string
          previous_reports?: string
          previous_treatment?: string
          reports_available?: string
          required_specialist?: string
          second_opinion_required?: string
          surgery_suggested?: string
          symptoms?: string
          travel_preference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_assessments_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_doctors: {
        Row: {
          active: boolean
          city: string
          consultation_fee: string
          contact: string
          created_at: string
          estimated_cost: string
          id: string
          location: string
          name: string
          notes: string
          services: string
          specialty: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city?: string
          consultation_fee?: string
          contact?: string
          created_at?: string
          estimated_cost?: string
          id?: string
          location?: string
          name?: string
          notes?: string
          services?: string
          specialty?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string
          consultation_fee?: string
          contact?: string
          created_at?: string
          estimated_cost?: string
          id?: string
          location?: string
          name?: string
          notes?: string
          services?: string
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      eyecare_documents: {
        Row: {
          category: string
          created_at: string
          external_link: string
          id: string
          notes: string
          patient_shareable: boolean
          patient_uid: string
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          external_link?: string
          id?: string
          notes?: string
          patient_shareable?: boolean
          patient_uid: string
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          external_link?: string
          id?: string
          notes?: string
          patient_shareable?: boolean
          patient_uid?: string
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_documents_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_followups: {
        Row: {
          case_status: string
          completed: boolean
          consultation_status: string
          created_at: string
          doctor_advice: string
          followup_date: string | null
          id: string
          next_followup: string | null
          notes: string
          patient_feedback: string
          patient_uid: string
          surgery_date: string | null
          surgery_planned: string
          updated_at: string
        }
        Insert: {
          case_status?: string
          completed?: boolean
          consultation_status?: string
          created_at?: string
          doctor_advice?: string
          followup_date?: string | null
          id?: string
          next_followup?: string | null
          notes?: string
          patient_feedback?: string
          patient_uid: string
          surgery_date?: string | null
          surgery_planned?: string
          updated_at?: string
        }
        Update: {
          case_status?: string
          completed?: boolean
          consultation_status?: string
          created_at?: string
          doctor_advice?: string
          followup_date?: string | null
          id?: string
          next_followup?: string | null
          notes?: string
          patient_feedback?: string
          patient_uid?: string
          surgery_date?: string | null
          surgery_planned?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_followups_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_patients: {
        Row: {
          age: string
          archived: boolean
          attendant_name: string
          budget_preference: string
          case_category: string
          case_status: string
          city: string
          created_at: string
          gender: string
          id: string
          main_problem: string
          name: string
          notes: string
          patient_id: string
          preferred_city: string
          priority: string
          registration_date: string
          relationship: string
          service_package: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          age?: string
          archived?: boolean
          attendant_name?: string
          budget_preference?: string
          case_category?: string
          case_status?: string
          city?: string
          created_at?: string
          gender?: string
          id?: string
          main_problem?: string
          name?: string
          notes?: string
          patient_id: string
          preferred_city?: string
          priority?: string
          registration_date?: string
          relationship?: string
          service_package?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          age?: string
          archived?: boolean
          attendant_name?: string
          budget_preference?: string
          case_category?: string
          case_status?: string
          city?: string
          created_at?: string
          gender?: string
          id?: string
          main_problem?: string
          name?: string
          notes?: string
          patient_id?: string
          preferred_city?: string
          priority?: string
          registration_date?: string
          relationship?: string
          service_package?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      eyecare_recommendations: {
        Row: {
          appointment_status: string
          city: string
          consultant_notes: string
          created_at: string
          doctor_name: string
          doctor_uid: string | null
          estimated_cost: string
          id: string
          option_number: number
          patient_uid: string
          shareable: boolean
          specialty: string
          updated_at: string
          why_suitable: string
        }
        Insert: {
          appointment_status?: string
          city?: string
          consultant_notes?: string
          created_at?: string
          doctor_name?: string
          doctor_uid?: string | null
          estimated_cost?: string
          id?: string
          option_number: number
          patient_uid: string
          shareable?: boolean
          specialty?: string
          updated_at?: string
          why_suitable?: string
        }
        Update: {
          appointment_status?: string
          city?: string
          consultant_notes?: string
          created_at?: string
          doctor_name?: string
          doctor_uid?: string | null
          estimated_cost?: string
          id?: string
          option_number?: number
          patient_uid?: string
          shareable?: boolean
          specialty?: string
          updated_at?: string
          why_suitable?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_recommendations_doctor_uid_fkey"
            columns: ["doctor_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eyecare_recommendations_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_services: {
        Row: {
          created_at: string
          fee: number
          id: string
          notes: string
          patient_uid: string
          payment_date: string | null
          payment_method: string
          payment_status: string
          service_package: string
          service_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee?: number
          id?: string
          notes?: string
          patient_uid: string
          payment_date?: string | null
          payment_method?: string
          payment_status?: string
          service_package?: string
          service_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee?: number
          id?: string
          notes?: string
          patient_uid?: string
          payment_date?: string | null
          payment_method?: string
          payment_status?: string
          service_package?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_services_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eyecare_timeline: {
        Row: {
          detail: string
          event: string
          id: string
          occurred_at: string
          patient_uid: string
        }
        Insert: {
          detail?: string
          event?: string
          id?: string
          occurred_at?: string
          patient_uid: string
        }
        Update: {
          detail?: string
          event?: string
          id?: string
          occurred_at?: string
          patient_uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "eyecare_timeline_patient_uid_fkey"
            columns: ["patient_uid"]
            isOneToOne: false
            referencedRelation: "eyecare_patients"
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
          payment_amount: string
          payment_client_name: string
          payment_date: string
          payment_method: string
          payment_note: string
          payment_proof_path: string
          payment_reference: string
          payment_review_note: string
          payment_reviewed_at: string | null
          payment_status: string
          payment_submitted_at: string | null
          payment_whatsapp: string
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
          payment_amount?: string
          payment_client_name?: string
          payment_date?: string
          payment_method?: string
          payment_note?: string
          payment_proof_path?: string
          payment_reference?: string
          payment_review_note?: string
          payment_reviewed_at?: string | null
          payment_status?: string
          payment_submitted_at?: string | null
          payment_whatsapp?: string
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
          payment_amount?: string
          payment_client_name?: string
          payment_date?: string
          payment_method?: string
          payment_note?: string
          payment_proof_path?: string
          payment_reference?: string
          payment_review_note?: string
          payment_reviewed_at?: string | null
          payment_status?: string
          payment_submitted_at?: string | null
          payment_whatsapp?: string
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
      next_eyecare_patient_id: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
