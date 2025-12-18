export const locales = ['en', 'ko', 'zh', 'ja'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];



