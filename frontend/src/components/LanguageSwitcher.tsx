"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from 'next-intl';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const t = useTranslations('language');

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as any);
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={t('switch')}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.code.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}





