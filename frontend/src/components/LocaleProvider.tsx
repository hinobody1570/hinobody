'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

// Load all locale messages
const messagesCache: Record<string, any> = {};

async function loadMessages(locale: string) {
  if (messagesCache[locale]) {
    return messagesCache[locale];
  }
  
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    messagesCache[locale] = messages;
    return messages;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    if (locale !== 'en') {
      return loadMessages('en');
    }
    return {};
  }
}

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale: string;
  initialMessages: any;
}

export function LocaleProvider({ children, initialLocale, initialMessages }: LocaleProviderProps) {
  const { locale } = useLanguage();
  const [messages, setMessages] = useState(initialMessages);
  const [currentLocale, setCurrentLocale] = useState(initialLocale);

  // Preload all locale messages
  useEffect(() => {
    const preloadMessages = async () => {
      const locales = ['en', 'ko', 'zh', 'ja'];
      for (const loc of locales) {
        if (!messagesCache[loc]) {
          await loadMessages(loc);
        }
      }
    };
    preloadMessages();
  }, []);

  // Update messages when locale changes
  useEffect(() => {
    if (locale !== currentLocale) {
      loadMessages(locale).then((newMessages) => {
        setMessages(newMessages);
        setCurrentLocale(locale);
      });
    }
  }, [locale, currentLocale]);

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

