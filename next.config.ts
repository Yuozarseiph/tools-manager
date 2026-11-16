// const withPWA = require("next-pwa")({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
// });

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: "export",
//   images: {
//     unoptimized: true,
//   },
// };

// module.exports = withPWA(nextConfig);

// next.config.js
// next.config.js
const withPWA = require("@imbios/next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // در محیط توسعه کاملاً غیرفعال شود
  disable: process.env.NODE_ENV === "development",
  // مسیر فایل سرویس ورکر
  sw: "sw.js",
  // Large engines and OCR models are fetched on demand with measured progress.
  publicExcludes: ["!runtime/**/*"],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/staticimgly\.com\/@imgly\/background-removal-data\/[^/]+\/dist\//,
      handler: "CacheFirst",
      options: {
        cacheName: "qodeforge-background-model",
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 96, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    ...require("@imbios/next-pwa/cache"),
  ],
  // جلوگیری از خطا در build
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig: import("next").NextConfig = {
  output: "export",
  experimental: { globalNotFound: true },
  images: {
    unoptimized: true,
  },
  // غیرفعال کردن strict mode در توسعه برای کاهش رندرهای مجدد
  reactStrictMode: process.env.NODE_ENV === "production",
  transpilePackages: ["@monaco-editor/react"],
  webpack(config, { isServer, webpack }) {
    // PptxGenJS 4 has lazy Node-only export branches. They are unreachable in
    // browser Blob exports, but Webpack otherwise tries to bundle node: URLs.
    if (!isServer) config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^node:(?:fs|https)$/ }));
    return config;
  },
};

module.exports = withPWA(nextConfig);
