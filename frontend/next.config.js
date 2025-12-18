const createNextIntlPlugin = require('next-intl/plugin');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development to avoid caching issues
  buildExcludes: [/app-build-manifest\.json$/],
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
      };
    }
    
    // Exclude MediaPipe from server-side bundle
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        '@mediapipe/face_mesh': 'commonjs @mediapipe/face_mesh',
        '@tensorflow/tfjs': 'commonjs @tensorflow/tfjs',
        '@tensorflow-models/face-landmarks-detection': 'commonjs @tensorflow-models/face-landmarks-detection',
      });
    }
    
    // Handle MediaPipe client-side imports
    // MediaPipe is loaded dynamically at runtime from CDN, so we replace static imports with a stub
    if (!isServer) {
      const webpack = require('webpack');
      const path = require('path');
      config.plugins = config.plugins || [];
      
      // Replace MediaPipe imports with our stub module
      // This allows the build to complete while MediaPipe is loaded dynamically at runtime
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^@mediapipe\/face_mesh$/,
          path.resolve(__dirname, 'src/lib/mediapipe-stub.js')
        )
      );
    }
    
    return config;
  },
};

// Apply plugins in order: PWA first, then next-intl
module.exports = withPWA(withNextIntl(nextConfig));

