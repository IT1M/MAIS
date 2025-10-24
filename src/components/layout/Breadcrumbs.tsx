'use client';

import { usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navigation');
  const isRTL = locale === 'ar';

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: t('home'), href: `/${locale}/dashboard` }
    ];

    // Map segments to readable labels
    const labelMap: Record<string, string> = {
      'dashboard': t('dashboard'),
      'data-entry': t('dataEntry'),
      'data-log': t('dataLog'),
      'analytics': t('analytics'),
      'settings': t('settings'),
      'audit': t('audit'),
      'backup': t('backup'),
      'profile': t('profile'),
      'help': t('help'),
    };

    // Build breadcrumb trail
    let currentPath = `/${locale}`;
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Don't add href for the last item
      if (index === segments.length - 1) {
        items.push({ label });
      } else {
        items.push({ label, href: currentPath });
      }
    });

    // Reverse for RTL
    return isRTL ? [...items].reverse() : items;
  }, [pathname, locale, t, isRTL]);

  // Truncate if more than 4 levels
  const displayBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= 4) {
      return breadcrumbs;
    }

    // Show first, ellipsis, and last two
    return [
      breadcrumbs[0],
      { label: '...', href: undefined },
      ...breadcrumbs.slice(-2)
    ];
  }, [breadcrumbs]);

  const ChevronIcon = isRTL ? 
    <ChevronRight className="h-4 w-4 rotate-180" /> : 
    <ChevronRight className="h-4 w-4" />;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-2">
      {displayBreadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-muted-foreground">
              {ChevronIcon}
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`text-sm ${index === displayBreadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
