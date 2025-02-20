import { NotificationState, Notification } from '../types';

type NotificationAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Notification[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'DELETE_NOTIFICATION'; payload: number }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'ERROR'; payload: string };

// Okunmamış bildirimleri say
const countUnreadNotifications = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.is_read).length;
};

export const notificationReducer = (
  state: NotificationState,
  action: NotificationAction
): NotificationState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        notifications: action.payload,
        unreadCount: countUnreadNotifications(action.payload),
        error: null
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: countUnreadNotifications(newNotifications)
      };

    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload.id ? action.payload : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: countUnreadNotifications(updatedNotifications)
      };

    case 'DELETE_NOTIFICATION':
      const remainingNotifications = state.notifications.filter(n => 
        n.id !== action.payload
      );
      return {
        ...state,
        notifications: remainingNotifications,
        unreadCount: countUnreadNotifications(remainingNotifications)
      };

    case 'MARK_AS_READ':
      const markedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, is_read: true } : n
      );
      return {
        ...state,
        notifications: markedNotifications,
        unreadCount: countUnreadNotifications(markedNotifications)
      };

    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, is_read: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case 'ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};