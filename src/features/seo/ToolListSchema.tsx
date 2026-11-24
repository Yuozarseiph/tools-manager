import { TOOLS } from "@/config/tools";
import { toolInfo } from "@/lib/seo/tool-guide";
import { jsonLd, SITE_URL } from "@/lib/seo/page-metadata";
import type { Locale } from "@/lib/i18n/locale-detection";

export default function ToolListSchema({ locale }: { locale: Locale }) {
  const active = TOOLS.filter(tool => tool.status === "active");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
    "@context": "https://schema.org", "@type": "ItemList", name: "QodeForge tools", inLanguage: locale,
    itemListElement: active.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: toolInfo(tool, locale).name, url: tool.href.startsWith("/") ? `${SITE_URL}/${locale}${tool.href}` : tool.href })),
  }) }} />;
}
