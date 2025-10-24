'use client';

import { Bell, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ar } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { useApp, Notification } from '@/contexts/AppContext';

export function NotificationBell() {
  const t = useTranslations('header');
  const locale = useLocale();
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS,
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label={t('notifications')}
      >
        <Bell className="h-5 w-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 md:w-96 rounded-lg border bg-background shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{t('notifications')}</h3>
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                {t('markAllRead')}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Check className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('allCaughtUp')}</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-accent/20' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getTypeColor(notification.type)}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {!notification.read && (
                          <span className="flex h-2 w-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-muted/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page
                }}
                className="text-xs text-primary hover:underline w-full text-center"
              >
                {t('viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
