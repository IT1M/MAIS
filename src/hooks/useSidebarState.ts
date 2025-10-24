'use client';

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

/**
 * Hook to manage sidebar collapsed state with localStorage persistence
 * @returns Object containing collapsed state and setter function
 */
export function useSidebarState() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      try {
        setCollapsed(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sidebar state', e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(collapsed));
    }
  }, [collapsed, mounted]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    mounted,
  };
}
