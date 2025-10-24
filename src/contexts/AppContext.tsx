'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Notification interface
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// User interface (from session)
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// AppContext state interface
interface AppContextState {
  user: User | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create context with default values
const AppContext = createContext<AppContextState | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Global application context provider
 * Manages user session state and notifications across the application
 */
export function AppProvider({ children }: AppProviderProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Extract user from session
  const user: User | null = session?.user
    ? {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'DATA_ENTRY',
      }
    : null;

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notifications);
      } catch (error) {
        console.error('Failed to parse stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app-notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Calculate unread count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Add a new notification
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Mark a notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Remove a specific notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('app-notifications');
  };

  const value: AppContextState = {
    user,
    notifications,
    unreadNotificationsCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useApp - Hook to access app context
 * Must be used within AppProvider
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
