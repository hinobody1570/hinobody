'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import { getStoredLocale, saveLocale } from '@/lib/locale-storage';
import { setLocaleCookie } from '@/lib/locale-cookie';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);


export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize locale from localStorage
    const storedLocale = getStoredLocale();
    setLocaleState(storedLocale);
    // Sync to cookie for server-side access
    setLocaleCookie(storedLocale);
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = storedLocale;
    }
    setLoading(false);
  }, []);

  // Update html lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined' && locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}. Using default: ${defaultLocale}`);
      newLocale = defaultLocale;
    }

    setLocaleState(newLocale);
    saveLocale(newLocale);
    setLocaleCookie(newLocale);
    
    // No reload needed - locale state change will trigger re-render
    // html lang attribute is updated via useEffect
  };

  const value: LanguageContextType = {
    locale,
    setLocale,
    loading,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

