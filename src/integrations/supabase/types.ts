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
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          status: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          status?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          class_applied: string
          created_at: string
          id: string
          message: string | null
          mobile_number: string
          name: string
          role: string
          user_id: string
        }
        Insert: {
          class_applied: string
          created_at?: string
          id?: string
          message?: string | null
          mobile_number: string
          name: string
          role: string
          user_id: string
        }
        Update: {
          class_applied?: string
          created_at?: string
          id?: string
          message?: string | null
          mobile_number?: string
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          class: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          posted_by: string | null
          section: string
          subject: string
          title: string
        }
        Insert: {
          class: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          posted_by?: string | null
          section: string
          subject: string
          title: string
        }
        Update: {
          class?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          posted_by?: string | null
          section?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          audience: Database["public"]["Enums"]["notice_audience"]
          created_at: string
          description: string
          id: string
          notice_date: string
          posted_by: string | null
          title: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["notice_audience"]
          created_at?: string
          description: string
          id?: string
          notice_date?: string
          posted_by?: string | null
          title: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["notice_audience"]
          created_at?: string
          description?: string
          id?: string
          notice_date?: string
          posted_by?: string | null
          title?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed: boolean
          created_at: string
          expires_at: string
          id: string
          mobile_number: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed?: boolean
          created_at?: string
          expires_at: string
          id?: string
          mobile_number: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          mobile_number?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          created_at: string
          id: string
          parent_user_id: string
          relation: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_user_id: string
          relation?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_user_id?: string
          relation?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          mobile_number: string
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_number: string
          name: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_number?: string
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          marks: number
          max_marks: number
          recorded_by: string | null
          remarks: string | null
          student_id: string
          subject: string
          term: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          marks: number
          max_marks?: number
          recorded_by?: string | null
          remarks?: string | null
          student_id: string
          subject: string
          term: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          marks?: number
          max_marks?: number
          recorded_by?: string | null
          remarks?: string | null
          student_id?: string
          subject?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          assigned_class: string | null
          assigned_section: string | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          sub_role: Database["public"]["Enums"]["staff_sub_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_class?: string | null
          assigned_section?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          sub_role?: Database["public"]["Enums"]["staff_sub_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_class?: string | null
          assigned_section?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          sub_role?: Database["public"]["Enums"]["staff_sub_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          class: string
          created_at: string
          created_by: string | null
          dob: string | null
          id: string
          mobile_number: string | null
          name: string
          parent_mobile: string | null
          roll_no: string | null
          section: string
          student_uid: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          class: string
          created_at?: string
          created_by?: string | null
          dob?: string | null
          id?: string
          mobile_number?: string | null
          name: string
          parent_mobile?: string | null
          roll_no?: string | null
          section?: string
          student_uid?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          class?: string
          created_at?: string
          created_by?: string | null
          dob?: string | null
          id?: string
          mobile_number?: string | null
          name?: string
          parent_mobile?: string | null
          roll_no?: string | null
          section?: string
          student_uid?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_student_uid: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_parent_of: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff_lead: { Args: { _user_id: string }; Returns: boolean }
      staff_handles_student: {
        Args: { _student_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "parent" | "staff"
      attendance_status: "present" | "absent" | "late"
      notice_audience: "public" | "staff"
      staff_sub_role: "teacher" | "hod" | "head"
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
      app_role: ["student", "parent", "staff"],
      attendance_status: ["present", "absent", "late"],
      notice_audience: ["public", "staff"],
      staff_sub_role: ["teacher", "hod", "head"],
    },
  },
} as const
