import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { LocaleProvider } from '@/components/LocaleProvider';
import { ToastContainer } from '@/components/Toast';
import RouteGuard from '@/routes/RouteGuard';
import { headers } from 'next/headers';
import { parseLocaleFromCookies } from '@/lib/locale-cookie';
import { getMessages } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: 'HiNobody - Eye Detection & Masking Tool',
  description: 'Progressive Web App for eye detection and masking using AI',
   icons: {
    icon: '/assets/images/logo/logo-icon-2.png',
    apple: '/assets/images/logo/logo-icon-2.png',
  },
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/logo/logo-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HiNobody" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider initialLocale={locale as any}>
          <LocaleProvider initialLocale={locale} initialMessages={messages}>
            <ToastProvider>
              <AuthProvider>
                <RouteGuard>
                  {children}
                  <ToastContainer />
                </RouteGuard>
              </AuthProvider>
            </ToastProvider>
          </LocaleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
