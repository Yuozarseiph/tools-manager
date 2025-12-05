// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Webpack Config
  webpack: (config: Configuration, { isServer, webpack }: { isServer: boolean; webpack: any }) => {
    // فقط در سمت Server این کارها رو انجام بده
    if (isServer) {
      // 1. Ignore کردن Native Modules
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(onnxruntime-node|@mapbox\/node-pre-gyp)$/,
        })
      );

      // 2. Alias برای جلوگیری از Import در Server
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node$': false,
      };

      // 3. External در Server
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'rembg-webgpu': 'commonjs rembg-webgpu',
          'onnxruntime-node': 'commonjs onnxruntime-node',
          'canvas': 'commonjs canvas',
          'sharp': 'commonjs sharp',
        });
      }

      // 4. Ignore Binary Files
      config.module = config.module || { rules: [] };
      config.module.rules = config.module.rules || [];
      config.module.rules.push({
        test: /\.node$/,
        use: 'ignore-loader',
      });
    }

    // برای Client: حذف onnxruntime-common از alias
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        // فقط node رو false کن، common رو نه!
        'onnxruntime-node$': false,
      };
    }

    return config;
  },

  // External Packages - فقط برای Server
  experimental: {
    serverComponentsExternalPackages: [
      'rembg-webgpu',
      'onnxruntime-node',
      'canvas',
      'sharp',
    ],
  },

  // Headers برای WebGPU
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
