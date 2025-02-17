
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
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          notification_preferences: Json
          theme_preferences: Json
          privacy_settings: Json
          phone: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          notification_preferences?: Json
          theme_preferences?: Json
          privacy_settings?: Json
          phone?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          notification_preferences?: Json
          theme_preferences?: Json
          privacy_settings?: Json
          phone?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          word: string
          learned: boolean
          last_reviewed: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          learned: boolean
          last_reviewed: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          learned?: boolean
          last_reviewed?: string
          created_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          total_questions: number
          correct_answers: number
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_questions: number
          correct_answers: number
          difficulty: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_questions?: number
          correct_answers?: number
          difficulty?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
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
  }
}
