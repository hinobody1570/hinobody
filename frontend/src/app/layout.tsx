import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LocaleProvider } from '@/components/LocaleProvider';
import RouteGuard from '@/routes/RouteGuard';
import { headers } from 'next/headers';
import { parseLocaleFromCookies } from '@/lib/locale-cookie';
import { getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'HiNobody - Eye Detection & Masking Tool',
  description: 'Progressive Web App for eye detection and masking using AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HiNobody',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'HiNobody',
    title: 'HiNobody - Eye Detection & Masking Tool',
    description: 'Progressive Web App for eye detection and masking using AI',
  },
  twitter: {
    card: 'summary',
    title: 'HiNobody - Eye Detection & Masking Tool',
    description: 'Progressive Web App for eye detection and masking using AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get locale from cookie (synced from localStorage)
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');
  const locale = parseLocaleFromCookies(cookieHeader);

  // Get messages for the locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HiNobody" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <LanguageProvider initialLocale={locale as any}>
          <LocaleProvider initialLocale={locale} initialMessages={messages}>
            <AuthProvider>
              <RouteGuard>
                {children}
              </RouteGuard>
            </AuthProvider>
          </LocaleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
