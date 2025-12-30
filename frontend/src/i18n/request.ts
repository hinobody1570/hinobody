import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { headers } from 'next/headers';
import { parseLocaleFromCookies } from '@/lib/locale-cookie';

export default getRequestConfig(async () => {
  // Get locale from cookie (synced from localStorage)
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');
  let locale = parseLocaleFromCookies(cookieHeader);

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});





