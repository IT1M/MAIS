'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarState } from '@/hooks/useSidebarState';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout component - Root layout wrapper for all authenticated pages
 * Provides consistent layout with sidebar, header, and main content area
 * Handles responsive behavior and mobile menu overlay
 */
export function MainLayout({ children }: MainLayoutProps) {
  // Sidebar state management with localStorage persistence
  const { collapsed, setCollapsed, mounted } = useSidebarState();
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleSidebarCollapse = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <Header onMobileMenuToggle={handleMobileMenuToggle} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={`
          hidden lg:block
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[280px]'}
          border-r border-border
          bg-background
        `}
      >
        <Sidebar
          collapsed={collapsed}
          onCollapse={handleSidebarCollapse}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={handleMobileMenuClose}
            aria-hidden="true"
          />

          {/* Mobile Sidebar */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-50
              w-[280px]
              bg-background
              border-r border-border
              lg:hidden
              transform transition-transform duration-300 ease-in-out
              ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <Sidebar
              collapsed={false}
              onCollapse={handleSidebarCollapse}
              mobileOpen={mobileMenuOpen}
              onMobileClose={handleMobileMenuClose}
            />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
