import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow, isValid } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Bell, Award, BookOpen, AlertCircle, Trash2, XCircle } from 'lucide-react';
import { Notification } from '../types/index';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick
}) => {
  const { markAsRead, deleteNotification } = useNotification();

  const getIcon = () => {
    const messageLower = notification.message.toLowerCase();
    // Check for both "not learned" message variants
    if (notification.type === 'learning' && 
        (messageLower.includes('kelime öğrenmediniz') || 
         messageLower.includes('kelime öğrenilmedi olarak işaretlendi'))) {
      return XCircle;
    }

    switch (notification.type) {
      case 'learning':
        return BookOpen;
      case 'quiz':
        return Award;
      case 'system':
      default:
        return Bell;
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    onClick();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const timeAgo = () => {
    try {
      const date = new Date(notification.created_at);
      if (!isValid(date)) return 'Geçersiz tarih';
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const Icon = getIcon();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleMarkAsRead}
      onKeyPress={(e) => e.key === 'Enter' && handleMarkAsRead(e as any)}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
                relative ${notification.is_read ? 'opacity-75' : ''}`}
    >
      <div className="flex-shrink-0 mt-1">
        <Icon className="w-5 h-5 text-bs-primary" />
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-medium text-bs-navy">
          {notification.title}
        </h4>
        <p className="text-sm text-bs-navygri mt-0.5 break-words">
          {notification.message}
        </p>
        <p className="text-[10px] text-bs-navygri/75 mt-1">
          {timeAgo()}
        </p>
      </div>
      {!notification.is_read && (
        <div className="absolute top-3 right-12 w-2 h-2 bg-blue-500 rounded-full" />
      )}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
        title="Bildirimi sil"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default NotificationItem;