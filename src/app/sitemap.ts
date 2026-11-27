import type { MetadataRoute } from "next";
import { TOOLS } from "@/config/tools";
import updated from "@/content/page-updated.json";
import { pageAlternates, SITE_URL } from "@/lib/seo/page-metadata";
import { localizedPath } from "@/lib/i18n/localized-path";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const active = TOOLS.filter(tool => tool.status === "active");
  const paths = ["/", "/about", "/contact", "/docs", "/changelog", "/privacy", "/download", "/agents",
    ...active.filter(tool => tool.href.startsWith("/tools/")).map(tool => tool.href), ...[...new Set(active.map(tool => tool.category))].map(category => `/tools/${category}`)];
  return (["fa", "en"] as const).flatMap(locale => paths.map(path => ({
    url: `${SITE_URL}${localizedPath(path, locale)}`,
    lastModified: (updated as Record<string, string>)[path === "/" ? "" : path],
    alternates: { languages: pageAlternates(path) },
  })));
}
