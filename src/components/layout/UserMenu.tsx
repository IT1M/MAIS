'use client';

import { User, Activity, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';

interface MenuItem {
  icon: typeof User;
  label: string;
  href?: string;
  action?: string;
  variant?: 'default' | 'destructive';
  type?: 'divider';
}

export function UserMenu() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
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

  const menuItems: MenuItem[] = [
    { icon: User, label: t('navigation.profile'), href: `/${locale}/settings/profile` },
    { icon: Activity, label: t('navigation.myActivity'), href: `/${locale}/audit?user=me` },
    { icon: Settings, label: t('navigation.settings'), href: `/${locale}/settings` },
    { icon: HelpCircle, label: t('navigation.help'), href: `/${locale}/help` },
    { type: 'divider' } as MenuItem,
    { icon: LogOut, label: t('auth.logout'), action: 'logout', variant: 'destructive' },
  ];

  const handleMenuItemClick = async (item: MenuItem) => {
    setIsOpen(false);

    if (item.action === 'logout') {
      await signOut({ callbackUrl: `/${locale}/login` });
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label={t('header.userMenu')}
      >
        {/* User Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {getUserInitials(session?.user?.name)}
        </div>
        
        {/* User Name - Hidden on mobile */}
        <span className="hidden md:block text-sm font-medium max-w-32 truncate">
          {session?.user?.name || 'User'}
        </span>
        
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 rounded-lg border bg-background shadow-lg overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            {session?.user?.role && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {session.user.role}
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => {
              if (item.type === 'divider') {
                return <div key={index} className="my-1 border-t" />;
              }

              const Icon = item.icon;
              const isDestructive = item.variant === 'destructive';

              return (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent transition-colors ${
                    isDestructive ? 'text-destructive hover:bg-destructive/10' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
