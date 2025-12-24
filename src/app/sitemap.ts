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
    "/download"
  ];

  const toolsRoutes = [
    // Audio
    "/tools/audio-editor",
    "/tools/audio-extractor",

    // Developer
    "/tools/base64",
    "/tools/code-visualizer",
    "/tools/json-formatter",
    "/tools/markdown-preview",

    // Excel
    "/tools/excel-chart",
    "/tools/excel-editor",
    "/tools/excel-viewer",

    // Image
    "/tools/color-picker",
    "/tools/image-compressor",
    "/tools/image-converter",
    "/tools/image-resizer",
    "/tools/image-to-pdf",
    "/tools/image-to-svg",
    "/tools/image-editor",
    "/tools/background-remover",

    //Peresentation
    "/tools/html-to-pptx",

    // PDF
    "/tools/pdf-merge",
    "/tools/text-to-pdf",
    "/tools/word-to-pdf",

    // Security
    "/tools/hash-generator",
    "/tools/password-generator",
    "/tools/exif-remover",

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

  const lastModified = new Date("2025-12-06");

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
