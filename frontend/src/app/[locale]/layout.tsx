import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteGuard from '@/routes/RouteGuard';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

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
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

