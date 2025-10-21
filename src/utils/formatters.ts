/**
 * Localized formatting utilities for dates, numbers, and currency
 */

/**
 * Format a date according to the locale
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format a date and time according to the locale
 */
export function formatDateTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format a short date according to the locale
 */
export function formatShortDate(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(number: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format currency in Saudi Riyals
 */
export function formatCurrency(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format relative time (e.g., "2 hours ago", "منذ ساعتين")
 */
export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number, locale: string = 'en'): string {
  const units = locale === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت']
    : ['B', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return `0 ${units[0]}`;
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  
  return `${formatNumber(Math.round(value * 100) / 100, locale)} ${units[i]}`;
}

/**
 * Format a compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(number: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}
