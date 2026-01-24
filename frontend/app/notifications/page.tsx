"use client";

import { useEffect, useState } from "react";
import { INotification } from "../components/post-items";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/notifications', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Ошибка загрузки уведомлений');
        }
        
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки уведомлений:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
      }
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'like': return '👍';
      case 'mention': return '@';
      default: return '🔔';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400 text-xl">
            Необходимо войти в систему для просмотра уведомлений
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-xl">Загрузка уведомлений...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Ошибка: {error}</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Назад на главную
          </Link>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">🔔 Уведомления</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Отметить все как прочитанные
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border transition-colors ${
                  notification.is_read 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-blue-900 border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        notification.is_read ? 'text-gray-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-400 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{formatDate(notification.created_at)}</p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Отметить как прочитанное
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-xl">
            У вас пока нет уведомлений
          </div>
        )}
      </div>
    </div>
  );
}
