import React from 'react';
import { useNotification } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { Trash2 } from 'lucide-react';
import { Notification } from '../types/index';

interface NotificationListProps {
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({ onClose }) => {
  const { 
    notifications, 
    unreadCount,
    markAllAsRead,
    deleteAllNotifications
  } = useNotification();

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Bildirim bulunmuyor
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-sm bg-blue-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Tümünü okundu işaretle
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                title="Tüm bildirimleri sil"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => {
              if (!notification.is_read) {
                markAllAsRead();
              }
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;