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
  // جلوگیری از خطا در build
  buildExcludes: [/middleware-manifest\.json$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // غیرفعال کردن strict mode در توسعه برای کاهش رندرهای مجدد
  reactStrictMode: process.env.NODE_ENV === "production",
  transpilePackages: ["@monaco-editor/react"],
};

module.exports = withPWA(nextConfig);