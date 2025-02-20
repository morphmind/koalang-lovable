import { Database } from '../../lib/database.types';
import { SupabaseClient, PostgrestResponse } from '@supabase/supabase-js';

export enum NotificationType {
  SYSTEM = 'system',
  LEARNING = 'learning',
  QUIZ = 'quiz',
  EMAIL = 'email'
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled_types: NotificationType[];
  sound_enabled: boolean;
  vibration_enabled: boolean;
  email_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

export type Tables = Database['public']['Tables'];
export type NotificationTable = Tables['notifications'];
export type NotificationRow = NotificationTable['Row'];
export type NotificationInsert = NotificationTable['Insert'];
export type NotificationUpdate = NotificationTable['Update'];

export type DbResult<T> = PostgrestResponse<T>;
export type DbResultOk<T> = NonNullable<PostgrestResponse<T>['data']>;

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  settings: NotificationSettings | null;
}

export type NotificationAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Notification[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_SETTINGS'; payload: NotificationSettings }
  | { type: 'ERROR'; payload: string };

export type TypedSupabaseClient = SupabaseClient<Database>;
