/**
 * Locale Storage Utilities
 * 
 * Helper functions to manage locale in localStorage
 */

import { locales, defaultLocale, type Locale } from '@/i18n/config';

const STORAGE_KEY = 'app_locale';

/**
 * Get locale from localStorage
 * Returns default locale if not found or invalid
 */
export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch (error) {
    console.error('Error reading locale from localStorage:', error);
  }
  
  return defaultLocale;
}

/**
 * Save locale to localStorage
 */
export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (!locales.includes(locale)) {
      console.warn(`Invalid locale: ${locale}. Using default: ${defaultLocale}`);
      locale = defaultLocale;
    }
    localStorage.setItem(STORAGE_KEY, locale);
  } catch (error) {
    console.error('Error saving locale to localStorage:', error);
  }
}

/**
 * Clear locale from localStorage (reset to default)
 */
export function clearLocale(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing locale from localStorage:', error);
  }
}

