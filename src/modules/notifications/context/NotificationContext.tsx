import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../lib/database.types';
import { Notification, NotificationType } from '../types/index';

// Override the 'type' field from the DB types with our own NotificationType
type Tables = Database['public']['Tables'];

// Override the DB types so that the 'type' field is our NotificationType, not a literal 'notification'
type DbNotification = Omit<Tables['notifications']['Row'], 'type'> & { type: NotificationType };
type DbNotificationInsert = Omit<Tables['notifications']['Insert'], 'type'> & { type: NotificationType };
type DbNotificationUpdate = Omit<Tables['notifications']['Update'], 'type'> & { type?: NotificationType };

// Conversion functions become identity functions
const convertToDbType = (type: NotificationType): NotificationType => type;
const convertFromDbType = (dbType: NotificationType): NotificationType => dbType;

const mapDbToNotification = (dbNotification: DbNotification): Notification => ({
  id: dbNotification.id,
  user_id: dbNotification.user_id,
  type: convertFromDbType(dbNotification.type),
  created_at: new Date(dbNotification.created_at),
  title: dbNotification.title,
  message: dbNotification.message,
  is_read: dbNotification.is_read
});

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (notification: { type: NotificationType; title: string; message: string }) => void;
  hideNotification: (id: number) => void;
  markAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback((notifications: Notification[]) => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedNotifications = data.map(mapDbToNotification);
        setNotifications(formattedNotifications);
        updateUnreadCount(formattedNotifications);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    }
  }, [updateUnreadCount]);

  const setupRealtimeSubscription = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification: DbNotification = payload.new;
            const formattedNotification = mapDbToNotification(newNotification);
            setNotifications(prev => [formattedNotification, ...prev]);
            updateUnreadCount([formattedNotification, ...notifications]);
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
            updateUnreadCount(notifications.filter(n => n.id !== deletedId));
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification: DbNotification = payload.new;
            const formattedNotification = mapDbToNotification(updatedNotification);
            setNotifications(prev =>
              prev.map(n => n.id === formattedNotification.id ? formattedNotification : n)
            );
            updateUnreadCount(
              notifications.map(n => n.id === formattedNotification.id ? formattedNotification : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [notifications, updateUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.());
    };
  }, [fetchNotifications, setupRealtimeSubscription]);

  const showNotification = async ({ type, title, message }: { type: NotificationType; title: string; message: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newNotification: DbNotificationInsert = {
        type: convertToDbType(type),
        title,
        message,
        user_id: user.id,
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedNotification = mapDbToNotification(data);
        setNotifications(prev => [formattedNotification, ...prev]);
        updateUnreadCount([formattedNotification, ...notifications]);
      }
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error);
    }
  };

  const hideNotification = async (id: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .match({ id, user_id: user.id });

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as DbNotificationUpdate)
        .match({ id, user_id: user.id });

      if (error) throw error;

      const updatedNotifications = notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      );

      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .match({ id, user_id: user.id });

      if (error) throw error;

      const updatedNotifications = notifications.filter(n => n.id !== id);
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Bildirim silinirken hata:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true } as DbNotificationUpdate)
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    } catch (error) {
      console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      updateUnreadCount([]);
    } catch (error) {
      console.error('Tüm bildirimler silinirken hata:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotification,
        hideNotification,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};