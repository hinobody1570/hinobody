# PWA Configuration Guide

## Overview
This project has been configured as a Progressive Web App (PWA) using `next-pwa`. The PWA functionality allows users to:
- Install the app on their devices
- Use the app offline (with cached resources)
- Experience native app-like behavior

## Current Configuration

### Installed Packages
- `next-pwa`: Handles service worker generation and PWA features

### Configuration Files
- `next.config.js`: Includes PWA configuration with workbox caching
- `public/manifest.json`: Defines app metadata, icons, and display settings
- `src/app/[locale]/layout.tsx`: Includes PWA meta tags and manifest link

### Features Enabled
- ✅ Service Worker (auto-generated in production builds)
- ✅ Offline caching with NetworkFirst strategy
- ✅ App manifest for installability
- ✅ PWA meta tags for iOS and Android
- ✅ Disabled in development mode (to avoid caching issues)

## Icon Requirements

The app requires the following icon sizes in the `public/` folder:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` (required)
- `icon-384x384.png`
- `icon-512x512.png` (required)

### How to Generate Icons

1. **Create a base icon**: Design a 512x512 PNG icon with your app logo
2. **Generate all sizes**: Use one of these methods:
   - Online tool: https://www.pwabuilder.com/imageGenerator
   - ImageMagick: `convert icon-512x512.png -resize SIZE icon-SIZExSIZE.png`
   - Manual: Use any image editor to resize to each size
3. **Place icons**: Put all generated icons in the `public/` folder

## Testing PWA

### Development
PWA is **disabled** in development mode to prevent caching issues. To test:
1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Open in Chrome/Edge
4. Check Application tab in DevTools for Service Worker
5. Use "Add to Home Screen" to test installation

### Production Checklist
- [ ] Replace placeholder icons with actual app icons
- [ ] Test offline functionality
- [ ] Test "Add to Home Screen" on mobile devices
- [ ] Verify manifest.json metadata
- [ ] Test on iOS Safari and Android Chrome

## PWA Features

### Offline Support
The app uses NetworkFirst caching strategy:
- Tries to fetch from network first
- Falls back to cache if offline
- Automatically updates cache when online

### Installation
Users can install the app:
- **Chrome/Edge**: Click install button in address bar
- **Mobile**: "Add to Home Screen" option
- **iOS**: Share button → Add to Home Screen

## Troubleshooting

### Service Worker Not Registering
- Ensure you're running a production build (`npm run build && npm start`)
- Check browser console for errors
- Clear browser cache and reload

### Icons Not Showing
- Verify all icon files exist in `public/` folder
- Check manifest.json paths are correct
- Ensure icons are PNG format

### PWA Not Working in Development
- This is expected - PWA is disabled in development
- Use production build to test PWA features

## Customization

### Update Manifest
Edit `public/manifest.json` to customize:
- App name and description
- Theme colors
- Display mode
- Start URL

### Update Caching Strategy
Edit `next.config.js` in the `withPWA` configuration:
- Change `runtimeCaching` handlers
- Adjust cache expiration settings
- Add custom cache strategies

## Resources
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)



