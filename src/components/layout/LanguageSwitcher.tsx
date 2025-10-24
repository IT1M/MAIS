'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { localeLabels, routing } from '@/i18n/routing';
import { useState, useTransition } from 'react';

export function LanguageSwitcher() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        aria-label={t('changeLanguage')}
      >
        <span className="text-lg md:text-xl">
          {locale === 'ar' ? '🇸🇦' : '🇬🇧'}
        </span>
        <span className="hidden md:inline text-sm font-medium">
          {localeLabels[locale as keyof typeof localeLabels]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-20 w-48 rounded-lg border bg-background shadow-lg overflow-hidden">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors ${
                  locale === loc
                    ? 'bg-accent text-primary'
                    : ''
                }`}
              >
                <span className="text-xl">
                  {loc === 'ar' ? '🇸🇦' : '🇬🇧'}
                </span>
                <span className="font-medium">
                  {localeLabels[loc as keyof typeof localeLabels]}
                </span>
                {locale === loc && (
                  <svg
                    className="w-5 h-5 ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
