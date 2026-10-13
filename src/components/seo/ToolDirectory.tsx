import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { toolInfo } from "@/lib/tool-guide";
import { jsonLd, SITE_URL } from "@/lib/page-metadata";
import type { Locale } from "@/lib/locale-detection";

export default function ToolDirectory({ locale }: { locale: Locale }) {
  const active = TOOLS.filter(tool => tool.status === "active");
  return <section className="seo-guide mx-auto max-w-7xl px-6 py-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
      "@context": "https://schema.org", "@type": "ItemList", name: "QodeForge tools", inLanguage: locale,
      itemListElement: active.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: toolInfo(tool, locale).name, url: tool.href.startsWith("/") ? `${SITE_URL}/${locale}${tool.href}` : tool.href })),
    }) }} />
    <details><summary className="cursor-pointer text-lg font-bold">{locale === "fa" ? "فهرست کامل ابزارها و دسته‌بندی‌ها" : "All tools and categories"}</summary>
      <nav aria-label={locale === "fa" ? "دسته‌بندی ابزارها" : "Tool categories"} className="mt-4 flex flex-wrap gap-4">
        {[...new Set(active.map(tool => tool.category))].map(category => <Link key={category} href={`/${locale}/tools/${category}`}>{toolsContent[locale].categories[category]}</Link>)}
      </nav>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{active.map(tool => <li key={tool.id}>
        <Link href={tool.href.startsWith("/") ? `/${locale}${tool.href}` : tool.href}>{toolInfo(tool, locale).name}</Link>
      </li>)}</ul>
    </details>
  </section>;
}
