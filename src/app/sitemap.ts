// app/sitemap.ts
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://toolsmanager.yuozarseiph.top";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/docs",
    "/changelog",
    "/privacy",
    "/download",
  ];

  const toolsRoutes = [
    // Audio
    "/tools/audio-editor",
    "/tools/audio-extractor",

    // Calculators
    "/tools/bank",
    "/tools/math-tools",

    // Developer
    "/tools/base64",
    "/tools/code-editor",
    "/tools/code-visualizer",
    "/tools/json-formatter",
    "/tools/markdown-preview",

    // Excel
    "/tools/excel-chart",
    "/tools/excel-editor",
    "/tools/excel-viewer",

    // Image
    "/tools/background-remover",
    "/tools/color-picker",
    "/tools/image-compressor",
    "/tools/image-converter",
    "/tools/image-editor",
    "/tools/image-resizer",
    "/tools/image-to-pdf",
    "/tools/image-to-svg",

    // PDF
    "/tools/pdf-editor",
    "/tools/pdf-merge",
    "/tools/text-to-pdf",
    "/tools/word-to-pdf",

    // Presentation
    "/tools/html-to-pptx",

    // Security
    "/tools/exif-remover",
    "/tools/hash-generator",
    "/tools/password-generator",
    "/tools/security-tools",

    // System
    "/tools/ip-checker",
    "/tools/user-agent",

    // Utility
    "/tools/date-converter",
    "/tools/qr-generator",
    "/tools/unit-converter",
    "/tools/word-counter",
  ];

  const allRoutes = [...staticRoutes, ...toolsRoutes];

  const lastModified = new Date("2026-05-01");

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));
}
