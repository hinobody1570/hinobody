# Locale Storage System Guide

## Overview

The language/locale system has been updated to use **localStorage** instead of URL parameters. The current language preference is stored in the browser's localStorage and persists across sessions.

## How It Works

1. **localStorage** - Primary storage for locale (client-side)
2. **Cookies** - Synced from localStorage for server-side access (middleware, server components)
3. **Default Locale** - Falls back to `'en'` if no locale is stored

## Architecture

```
User Changes Language
    ↓
LanguageSwitcher.setLocale()
    ↓
Saves to localStorage → Syncs to cookie
    ↓
Page reloads → Middleware reads cookie → Sets locale in URL
    ↓
Server components get locale from cookie
```

## Key Files

### 1. `contexts/LanguageContext.tsx`
- Manages locale state
- Provides `useLanguage()` hook
- Handles saving to localStorage and syncing to cookies

### 2. `lib/locale-storage.ts`
- Utilities for localStorage operations
- `getStoredLocale()` - Get locale from localStorage
- `saveLocale()` - Save locale to localStorage

### 3. `lib/locale-cookie.ts`
- Utilities for cookie operations (server-side)
- `parseLocaleFromCookies()` - Read locale from cookie string
- `setLocaleCookie()` - Set locale cookie (client-side)

### 4. `middleware.ts`
- Reads locale from cookie
- Redirects to correct locale in URL
- Ensures URL always matches localStorage locale

### 5. `i18n/request.ts`
- Server-side locale detection
- Reads from cookie first, falls back to URL

## Usage

### In Components

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { locale, setLocale } = useLanguage();
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <button onClick={() => setLocale('ko')}>
        Switch to Korean
      </button>
    </div>
  );
}
```

### Language Switcher

The `LanguageSwitcher` component automatically:
- Reads current locale from localStorage
- Saves to localStorage when changed
- Syncs to cookie for server-side access
- Reloads page to apply changes

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

<LanguageSwitcher />
```

## Storage Details

### localStorage Key
- Key: `app_locale`
- Value: One of `'en'`, `'ko'`, `'zh'`, `'ja'`
- Default: `'en'` if not set

### Cookie Details
- Name: `app_locale`
- Max Age: 1 year
- Path: `/`
- SameSite: `Lax`

## Flow Example

1. **First Visit** (no locale stored):
   - localStorage: empty
   - Cookie: empty
   - Default: `'en'`
   - URL: `/en/...`

2. **User Changes to Korean**:
   - `setLocale('ko')` called
   - localStorage: `'ko'`
   - Cookie: `'ko'`
   - Page reloads
   - URL: `/ko/...`

3. **Next Visit**:
   - localStorage: `'ko'`
   - Cookie: `'ko'`
   - URL: `/ko/...`
   - Language persists!

## Benefits

✅ **Persistent** - Language preference saved across sessions  
✅ **No URL Dependency** - Language not tied to URL structure  
✅ **Server-Side Compatible** - Cookies allow server components to access locale  
✅ **Default Fallback** - Always defaults to `'en'` if nothing stored  
✅ **Automatic Sync** - localStorage and cookies stay in sync  

## Migration Notes

### Before (URL-based)
- URL: `/en/dashboard`, `/ko/dashboard`
- Locale from URL path
- Changed by navigating to different URL

### After (localStorage-based)
- URL: Still `/en/dashboard`, `/ko/dashboard` (for routing)
- Locale from localStorage
- Changed by `setLocale()` which updates localStorage
- URL updates automatically via middleware

## Troubleshooting

### Language not persisting?
- Check browser localStorage (DevTools → Application → Local Storage)
- Verify `app_locale` key exists
- Check cookie in DevTools → Application → Cookies

### Language not updating?
- Ensure `LanguageProvider` wraps your app (already in layout)
- Check that `setLocale()` is being called
- Verify page reloads after language change

### Default locale not working?
- Check `defaultLocale` in `i18n/config.ts`
- Verify middleware fallback logic
- Check cookie parsing in middleware

## API Reference

### `useLanguage()` Hook

```tsx
const { locale, setLocale, loading } = useLanguage();
```

- `locale: Locale` - Current locale (`'en'`, `'ko'`, `'zh'`, `'ja'`)
- `setLocale: (locale: Locale) => void` - Change locale (saves to localStorage and reloads)
- `loading: boolean` - True while initializing from localStorage

### Helper Functions

```tsx
import { getStoredLocale, saveLocale } from '@/lib/locale-storage';
import { parseLocaleFromCookies, setLocaleCookie } from '@/lib/locale-cookie';

// Get locale from localStorage
const locale = getStoredLocale(); // Returns Locale or 'en'

// Save locale to localStorage
saveLocale('ko');

// Get locale from cookie (server-side)
const locale = parseLocaleFromCookies(cookieHeader);

// Set locale cookie (client-side)
setLocaleCookie('ko');
```

## Example: Custom Language Selector

```tsx
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function CustomLanguageSelector() {
  const { locale, setLocale } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ];
  
  return (
    <div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code as any)}
          className={locale === lang.code ? 'active' : ''}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
```

## Summary

- ✅ Locale stored in **localStorage** (`app_locale`)
- ✅ Synced to **cookie** for server-side access
- ✅ Defaults to **'en'** if not set
- ✅ Persists across **sessions**
- ✅ Updates **automatically** when changed
- ✅ Works with **server components** via cookies

The system is fully functional and ready to use! 🎉

