
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          first_name: string | null
          last_name: string | null
          phone: string | null
          notification_preferences: Json
          theme_preferences: Json
          privacy_settings: Json
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          notification_preferences?: Json
          theme_preferences?: Json
          privacy_settings?: Json
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          notification_preferences?: Json
          theme_preferences?: Json
          privacy_settings?: Json
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'system' | 'learning' | 'quiz'
          title: string
          message: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'system' | 'learning' | 'quiz'
          title: string
          message: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'system' | 'learning' | 'quiz'
          title?: string
          message?: string
          is_read?: boolean
          link?: string | null
          created_at?: string
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
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          learned?: boolean
          last_reviewed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          learned?: boolean
          last_reviewed?: string
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          total_questions: number
          correct_answers: number
          wrong_answers: number
          skipped_questions: number
          time_spent: number
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_questions: number
          correct_answers: number
          wrong_answers: number
          skipped_questions: number
          time_spent: number
          difficulty: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          skipped_questions?: number
          time_spent?: number
          difficulty?: string
          created_at?: string
        }
      }
      editor_content: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json
          status: string
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: Json
          status?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: Json
          status?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      editor_content_history: {
        Row: {
          id: string
          content_id: string
          content: Json
          version: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          content: Json
          version: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          content?: Json
          version?: number
          created_by?: string
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
      notification_type: 'system' | 'learning' | 'quiz'
      notification_status: 'unread' | 'read'
    }
  }
}
