/**
 * Locale Cookie Utilities
 * 
 * Helper functions to sync locale between localStorage and cookies
 * Cookies are needed for server-side access (middleware, server components)
 */

import { locales, defaultLocale, type Locale } from '@/i18n/config';

const COOKIE_NAME = 'app_locale';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get locale from cookie (for server-side)
 */
export function getLocaleFromCookie(cookieHeader: string | null): Locale {
  if (!cookieHeader) return defaultLocale;
  
  try {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const locale = cookies[COOKIE_NAME];
    if (locale && locales.includes(locale as Locale)) {
      return locale as Locale;
    }
  } catch (error) {
    console.error('Error reading locale from cookie:', error);
  }
  
  return defaultLocale;
}

/**
 * Set locale cookie (called from client)
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  
  try {
    if (!locales.includes(locale)) {
      console.warn(`Invalid locale: ${locale}. Using default: ${defaultLocale}`);
      locale = defaultLocale;
    }
    
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch (error) {
    console.error('Error setting locale cookie:', error);
  }
}

/**
 * Get locale from cookie string (for Next.js middleware)
 */
export function parseLocaleFromCookies(cookieString: string | null): Locale {
  if (!cookieString) return defaultLocale;
  
  const match = cookieString.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match) {
    const locale = decodeURIComponent(match[1]);
    if (locales.includes(locale as Locale)) {
      return locale as Locale;
    }
  }
  
  return defaultLocale;
}

