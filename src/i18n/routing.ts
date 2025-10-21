import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The locale prefix strategy
  localePrefix: 'always',
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

// Locale labels for UI
export const localeLabels = {
  en: 'English',
  ar: 'العربية',
} as const;

// Text direction per locale
export const localeDirections = {
  en: 'ltr',
  ar: 'rtl',
} as const;

export type Locale = (typeof routing.locales)[number];
