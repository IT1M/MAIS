import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { UserRole } from '@/types';
import {
  ClipboardEdit,
  FileText,
  BarChart3,
  Database,
  Settings,
  Archive,
} from 'lucide-react';

interface QuickActionsGridProps {
  userRole: UserRole;
  locale: string;
}

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  roles: UserRole[] | 'ALL';
  color: string;
}

export function QuickActionsGrid({ userRole, locale }: QuickActionsGridProps) {
  const t = useTranslations();

  const allActions: QuickAction[] = [
    {
      id: 'add-item',
      icon: ClipboardEdit,
      label: t('dataEntry.addItem'),
      href: `/${locale}/data-entry`,
      roles: ['ADMIN', 'SUPERVISOR', 'DATA_ENTRY'],
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'view-log',
      icon: Database,
      label: t('dataLog.viewAll'),
      href: `/${locale}/data-log`,
      roles: 'ALL',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: t('navigation.analytics'),
      href: `/${locale}/analytics`,
      roles: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'AUDITOR'],
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'reports',
      icon: FileText,
      label: t('backup.generateReport'),
      href: `/${locale}/backup`,
      roles: ['ADMIN', 'MANAGER'],
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'audit',
      icon: Archive,
      label: t('navigation.audit'),
      href: `/${locale}/audit`,
      roles: ['ADMIN', 'AUDITOR'],
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      id: 'settings',
      icon: Settings,
      label: t('navigation.settings'),
      href: `/${locale}/settings`,
      roles: 'ALL',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  const filteredActions = allActions.filter((action) => {
    if (action.roles === 'ALL') return true;
    return action.roles.includes(userRole);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.id} href={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{action.label}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
