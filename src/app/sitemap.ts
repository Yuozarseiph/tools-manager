// app/sitemap.ts
import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl = 'https://toolsmanager.yuozarseiph.top'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/docs',
    '/changelog',
    '/privacy',
  ]

  const toolsRoutes = [
    '/tools/audio-editor',
    '/tools/base64',
    '/tools/code-visualizer',
    '/tools/color-picker',
    '/tools/date-converter',
    '/tools/excel-chart',
    '/tools/excel-editor',
    '/tools/excel-viewer',
    '/tools/hash-generator',
    '/tools/image-compressor',
    '/tools/image-converter',
    '/tools/image-resizer',
    '/tools/image-to-pdf',
    '/tools/ip-checker',
    '/tools/json-formatter',
    '/tools/markdown-preview',
    '/tools/password-generator',
    '/tools/pdf-merge',
    '/tools/qr-generator',
    '/tools/text-to-pdf',
    '/tools/unit-converter',
    '/tools/user-agent',
    '/tools/word-counter',
    '/tools/word-to-pdf',
  ]

  const allRoutes = [...staticRoutes, ...toolsRoutes]

  const lastModified = new Date('2025-12-06')

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
