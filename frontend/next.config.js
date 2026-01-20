const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fast Refresh is enabled by default in Next.js
  // Disable static optimization in development for faster hot reload
  experimental: {
    optimizePackageImports: [],
  },
  // Ensure pages are served fresh in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },
  async headers() {
    // Disable caching in development for immediate updates
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires',
              value: '0',
            },
          ],
        },
      ];
    }
    return [];
  },
  webpack: (config, { isServer, dev }) => {
    // Optimize caching and file watching for development hot reload
    if (dev) {
      // Use memory cache for faster invalidation in development
      // This ensures changes are detected immediately while still benefiting from cache
      config.cache = {
        type: 'memory',
      };
      
      // Improve file watching on Windows (aggressive polling for reliable change detection)
      // Windows file system events can be unreliable, so polling is recommended
      config.watchOptions = {
        poll: 300, // Check for changes every 300ms (faster detection on Windows)
        aggregateTimeout: 200, // Shorter delay for faster rebuild after first change
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
        ],
        followSymlinks: false,
      };
      
      // Optimize for Fast Refresh
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          removeAvailableModules: false,
          removeEmptyChunks: false,
        };
      }
    }

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

