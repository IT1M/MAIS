'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  ClipboardEdit,
  Database,
  BarChart3,
  HardDrive,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavigationItem {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    labelKey: 'navigation.dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'DATA_ENTRY', 'AUDITOR'],
  },
  {
    id: 'data-entry',
    labelKey: 'navigation.dataEntry',
    icon: ClipboardEdit,
    href: '/data-entry',
    roles: ['ADMIN', 'SUPERVISOR', 'DATA_ENTRY'],
  },
  {
    id: 'data-log',
    labelKey: 'navigation.dataLog',
    icon: Database,
    href: '/data-log',
    roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'DATA_ENTRY', 'AUDITOR'],
  },
  {
    id: 'analytics',
    labelKey: 'navigation.analytics',
    icon: BarChart3,
    href: '/analytics',
    roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'AUDITOR'],
  },
  {
    id: 'backup',
    labelKey: 'navigation.backup',
    icon: HardDrive,
    href: '/backup',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    id: 'audit',
    labelKey: 'navigation.audit',
    icon: FileText,
    href: '/audit',
    roles: ['ADMIN', 'AUDITOR'],
  },
  {
    id: 'settings',
    labelKey: 'navigation.settings',
    icon: Settings,
    href: '/settings',
    roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'DATA_ENTRY', 'AUDITOR'],
  },
];

export function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  // Apply focus trap for mobile sidebar
  const sidebarRef = useFocusTrap<HTMLDivElement>(mobileOpen || false);

  // Filter navigation items based on user role
  const userRole = session?.user?.role || 'DATA_ENTRY';
  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  // Check if a navigation item is active
  const isActive = (href: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  // Handle navigation item click - close mobile menu
  const handleNavClick = () => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div ref={sidebarRef} className="h-full flex flex-col bg-background">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            <span className="font-semibold text-foreground">Saudi Mais Co.</span>
          </div>
        )}

        {/* Close button for mobile */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Collapse button for desktop */}
        {!mobileOpen && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="hidden lg:block p-2 hover:bg-accent rounded-md transition-colors"
            aria-label={collapsed ? t('common.expand') : t('common.collapse')}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main navigation">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const fullHref = `/${locale}${item.href}`;

            return (
              <li key={item.id}>
                <Link
                  href={fullHref}
                  onClick={handleNavClick}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-150
                    ${active
                      ? 'bg-primary text-primary-foreground border-l-4 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium">{t(item.labelKey)}</span>
                      {item.badge && (
                        <Badge variant="info" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Footer - User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.role || 'DATA_ENTRY'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
