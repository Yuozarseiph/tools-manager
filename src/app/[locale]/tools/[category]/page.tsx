import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { parseLocale } from "@/lib/localized-path";
import { toolInfo } from "@/lib/tool-guide";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
const categories = [...new Set(TOOLS.filter(tool => tool.status === "active").map(tool => tool.category))];
export const dynamicParams = false;
export function generateStaticParams() { return categories.map(category => ({ category })); }
type Props = { params: Promise<{ locale: string; category: string }> };
function categoryCopy(locale: "fa" | "en", category: string) {
  const label = toolsContent[locale].categories[category as keyof typeof toolsContent.fa.categories];
  return { label, title: locale === "fa" ? `ابزارهای ${label} آنلاین رایگان` : `Free online ${label} tools`,
    description: locale === "fa" ? `ابزارهای ${label} QodeForge را همراه با راهنمای استفاده و اطلاعات حریم خصوصی ببینید. بدون ثبت‌نام، ابزار مناسب را انتخاب کنید و در مرورگر استفاده کنید.` : `Explore QodeForge ${label} tools with usage guides and privacy details. Choose a free tool and work in your browser without creating an account.` };
}
export async function generateMetadata({ params }: Props) {
  const { locale: raw, category } = await params; const locale = parseLocale(raw);
  if (!categories.includes(category as typeof categories[number])) notFound();
  const copy = categoryCopy(locale, category);
  return pageMetadata(locale, `/tools/${category}`, copy.title, copy.description);
}
export default async function Page({ params }: Props) {
  const { locale: raw, category } = await params; const locale = parseLocale(raw);
  if (!categories.includes(category as typeof categories[number])) notFound();
  const copy = categoryCopy(locale, category);
  const tools = TOOLS.filter(tool => tool.category === category && tool.status === "active");
  return <section className="seo-guide mx-auto max-w-5xl space-y-6 px-6 py-10">
    <nav aria-label={locale === "fa" ? "مسیر صفحه" : "Breadcrumb"}><Link href={`/${locale}`}>{locale === "fa" ? "خانه" : "Home"}</Link> / {copy.label}</nav>
    <h1 className="text-3xl font-bold">{copy.title}</h1><p>{copy.description}</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "ItemList", name: copy.title,
      itemListElement: tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: toolInfo(tool, locale).name, url: tool.href.startsWith("/") ? `${SITE_URL}/${locale}${tool.href}` : tool.href })),
    }) }} />
    <ul className="grid gap-4 sm:grid-cols-2">{tools.map(tool => <li key={tool.id} className="rounded-xl border border-[var(--app-border)] p-5">
      <h2 className="text-lg font-bold"><Link href={tool.href.startsWith("/") ? `/${locale}${tool.href}` : tool.href}>{toolInfo(tool, locale).name}</Link></h2><p className="mt-2">{toolInfo(tool, locale).description}</p>
    </li>)}</ul>
  </section>;
}
