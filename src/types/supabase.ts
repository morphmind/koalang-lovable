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
          email: string
          full_name: string
          role: 'student' | 'admin'
          status: string
          created_at: string
          last_sign_in_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'student' | 'admin'
          status?: string
          created_at?: string
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'admin'
          status?: string
          created_at?: string
          last_sign_in_at?: string | null
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          score: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          completed?: boolean
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
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          learned?: boolean
          last_reviewed?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          learned?: boolean
          last_reviewed?: string
        }
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed?: boolean
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