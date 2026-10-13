import type { MetadataRoute } from "next";
import { TOOLS } from "@/data/tools";
import updated from "@/data/page-updated.json";
export const dynamic = "force-static";
const base = "https://qodeforge.ir";
export default function sitemap(): MetadataRoute.Sitemap {
  const active = TOOLS.filter(tool => tool.status === "active");
  const paths = ["", "/about", "/contact", "/docs", "/changelog", "/privacy", "/download", "/agents",
    ...active.filter(tool => tool.href.startsWith("/tools/")).map(tool => tool.href), ...[...new Set(active.map(tool => tool.category))].map(category => `/tools/${category}`)];
  return (["fa", "en"] as const).flatMap(locale => paths.map(path => ({
    url: `${base}/${locale}${path}`, lastModified: (updated as Record<string, string>)[path] ?? updated[""],
    priority: path === "" ? 1 : 0.8, alternates: { languages: { "fa-IR": `${base}/fa${path}`, "en-US": `${base}/en${path}` } },
  })));
}
