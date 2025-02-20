export type NotificationType = 'system' | 'learning' | 'quiz';

export interface Notification {
  id: number;
  created_at: Date;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  user_id: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}