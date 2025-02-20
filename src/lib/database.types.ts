export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type NotificationType = 'notification';

export interface Database {
  public: {
    Tables: {
      user_progress: {
        Row: {
          user_id: string
          word: string
          learned: boolean
          last_reviewed: string
          created_at: string | null
        }
        Insert: {
          user_id: string
          word: string
          learned: boolean
          last_reviewed: string
          created_at?: string | null
        }
        Update: {
          user_id?: string
          word?: string
          learned?: boolean
          last_reviewed?: string
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          created_at: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
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
      notification_type: NotificationType
    }
  }
}
