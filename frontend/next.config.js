const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Handle MediaPipe and TensorFlow.js packages that are browser-only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
      };
    }
    
    // Exclude MediaPipe from server-side bundle
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'face-api.js': 'commonjs face-api.js',
        'canvas': 'commonjs canvas',
      });
    }
    
    return config;
  },
};

// Temporarily disable PWA due to Next.js 16 compatibility issues
// next-pwa v5.6.0 causes "manifests singleton" error with Next.js 16
// TODO: Re-enable when next-pwa is updated or use alternative PWA solution
// For now, PWA is completely disabled - rebuild required after re-enabling
const ENABLE_PWA = process.env.ENABLE_PWA === 'true';

if (ENABLE_PWA) {
  try {
    const withPWA = require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === 'development',
      buildExcludes: [/app-build-manifest\.json$/, /react-loadable-manifest\.json$/],
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'offlineCache',
            expiration: {
              maxEntries: 200,
            },
          },
        },
      ],
    });
    module.exports = withPWA(withNextIntl(nextConfig));
  } catch (e) {
    console.warn('PWA plugin not available, continuing without it');
    module.exports = withNextIntl(nextConfig);
  }
} else {
  // PWA disabled by default to avoid Next.js 16 compatibility issues
  module.exports = withNextIntl(nextConfig);
}

