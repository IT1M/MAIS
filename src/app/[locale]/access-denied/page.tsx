'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AccessDeniedPage() {
  const t = useTranslations('errors');
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        {/* Status Code */}
        <h1 className="mb-2 text-6xl font-bold text-gray-900 dark:text-white">
          403
        </h1>
        
        {/* Title */}
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {t('accessDenied')}
        </h2>
        
        {/* Message */}
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          {t('accessDeniedMessage')}
        </p>
        
        {/* Action Button */}
        <Link href="/dashboard">
          <Button size="lg" className="w-full sm:w-auto">
            {t('goToDashboard')}
          </Button>
        </Link>
        
        {/* Additional Info */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          {t('insufficientPermissions')}
        </p>
      </div>
    </div>
  );
}
