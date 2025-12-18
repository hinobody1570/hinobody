# PWA Quick Reference Guide

## 🚀 Quick Overview

Your Next.js app is configured as a **Progressive Web App (PWA)** using `next-pwa` v5.6.0.

### What This Means:
- ✅ Users can **install** your app on their devices
- ✅ App works **offline** using cached resources
- ✅ App opens in **standalone mode** (no browser UI)
- ✅ **Fast loading** with cached assets

---

## 📁 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `next.config.js` | PWA plugin configuration | `frontend/next.config.js` |
| `manifest.json` | App metadata & icons | `frontend/public/manifest.json` |
| `layout.tsx` | PWA meta tags | `frontend/src/app/[locale]/layout.tsx` |
| `sw.js` | Service worker (auto-generated) | `frontend/public/sw.js` (after build) |

---

## ⚙️ Key Configuration Options

### `next.config.js` - PWA Settings

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',                    // Service worker output folder
  register: true,                     // Auto-register service worker
  skipWaiting: true,                  // Activate updates immediately
  disable: process.env.NODE_ENV === 'development',  // Disabled in dev
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,        // Cache all HTTP/HTTPS requests
      handler: 'NetworkFirst',        // Try network, fallback to cache
      options: {
        cacheName: 'offlineCache',
        expiration: { maxEntries: 200 },
      },
    },
  ],
});
```

### `manifest.json` - App Info

```json
{
  "name": "HiNobody - Eye Detection & Masking Tool",
  "short_name": "HiNobody",
  "start_url": "/",
  "display": "standalone",           // Full-screen, no browser UI
  "theme_color": "#3b82f6",          // Browser UI color
  "background_color": "#ffffff",      // Splash screen color
  "icons": [...]                     // 8 icon sizes
}
```

---

## 🔄 How It Works

### Installation Flow
```
User visits site → Browser detects manifest → Shows install button → User installs → App on home screen
```

### Offline Flow
```
Request → Service Worker intercepts → Network available?
  ├─ YES → Fetch from network → Cache response → Return
  └─ NO → Check cache → Return cached version
```

### Build Process
```
npm run build → next-pwa generates sw.js → Service worker registered → PWA ready
```

---

## 🧪 Testing

### Development
- ❌ **PWA is DISABLED** in development (prevents caching issues)
- ✅ Use `npm run build && npm start` to test PWA

### Production Testing
1. Build: `npm run build`
2. Start: `npm start`
3. Open Chrome DevTools → Application tab
4. Check:
   - ✅ Service Worker registered
   - ✅ Manifest valid
   - ✅ Cache Storage populated

### Offline Test
1. Open DevTools → Network tab
2. Check "Offline"
3. Reload page
4. ✅ Should still work (from cache)

---

## 📋 Checklist

### Required Files
- [x] `next.config.js` - PWA configured
- [x] `manifest.json` - App metadata
- [x] `layout.tsx` - Meta tags added
- [ ] Icon files in `public/` folder (need to add)

### Required Icons
- [ ] `icon-192x192.png` ⚠️ **REQUIRED**
- [ ] `icon-512x512.png` ⚠️ **REQUIRED**
- [ ] Other sizes (72, 96, 128, 144, 152, 384)

### Testing
- [ ] Service worker registers
- [ ] Install button appears
- [ ] App installs successfully
- [ ] Offline functionality works
- [ ] Icons display correctly

---

## 🐛 Common Issues

| Issue | Solution |
|------|----------|
| Service worker not registering | Use production build (`npm run build && npm start`) |
| Icons not showing | Add icon files to `public/` folder |
| PWA not working in dev | Expected - PWA disabled in development |
| Offline not working | Check service worker is active, verify caching strategy |

---

## 📚 Full Documentation

For complete details, see:
- **`PWA_COMPLETE_ANALYSIS.md`** - Comprehensive analysis
- **`README-PWA.md`** - Original PWA guide

---

## 🔗 Quick Links

- [next-pwa GitHub](https://github.com/shadowwalker/next-pwa)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)

