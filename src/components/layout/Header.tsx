'use client';

import { Menu } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationBell } from './NotificationBell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const t = useTranslations('header');

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden rounded-lg p-2 hover:bg-accent transition-colors"
            aria-label={t('openMenu')}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumbs */}
          <Breadcrumbs />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
