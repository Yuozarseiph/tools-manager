import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ExternalLink, LayoutGrid, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { parseLocale } from "@/lib/localized-path";
import { toolInfo } from "@/lib/tool-guide";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
const categories = [...new Set(TOOLS.filter(tool => tool.status === "active").map(tool => tool.category))];
export const dynamicParams = false;
export function generateStaticParams() {
  // Static-export dev mode validates params before notFound(). Let retired URLs
  // reach the 404 guard locally; production exports contain active categories only.
  const paths = process.env.NODE_ENV === "development"
    ? [...categories, "ip-checker", "user-agent", "system", "ip-checker.md", "user-agent.md"]
    : categories;
  return paths.map(category => ({ category }));
}
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
  const fa = locale === "fa";
  const Arrow = fa ? ArrowLeft : ArrowRight;
  return <section className="category-directory mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
    <nav className="guide-breadcrumb" aria-label={fa ? "مسیر صفحه" : "Breadcrumb"}><ol className="flex flex-wrap items-center gap-2"><li><Link href={`/${locale}`}>{fa ? "خانه" : "Home"}</Link></li><li aria-hidden="true"><ChevronLeft className="h-3 w-3 ltr:rotate-180" /></li><li aria-current="page">{copy.label}</li></ol></nav>
    <header className="guide-panel category-hero">
      <span className="guide-icon mb-5"><LayoutGrid aria-hidden="true" /></span>
      <div className="flex flex-wrap items-start justify-between gap-4"><h1 className="text-2xl font-extrabold sm:text-3xl">{copy.title}</h1><span className="category-count">{tools.length.toLocaleString(locale)} {fa ? "ابزار در این دسته" : "tools in this category"}</span></div>
      <p className="guide-copy mt-4 max-w-3xl">{copy.description}</p>
      <div className="guide-badges mt-6"><span><Sparkles className="h-4 w-4" aria-hidden="true" />{fa ? "رایگان و در دسترس" : "Free and accessible"}</span><Link href={`/${locale}`} className="category-all">{fa ? "مشاهده همه ابزارها" : "Explore all tools"}<Arrow className="h-4 w-4" aria-hidden="true" /></Link></div>
    </header>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "ItemList", name: copy.title,
      itemListElement: tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: toolInfo(tool, locale).name, url: tool.href.startsWith("/") ? `${SITE_URL}/${locale}${tool.href}` : tool.href })),
    }) }} />
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tools.map(tool => {
      const info = toolInfo(tool, locale);
      const external = !tool.href.startsWith("/");
      return <li key={tool.id}><Link className="category-tool-card group" href={external ? tool.href : `/${locale}${tool.href}`}>
        <div className="flex items-center justify-between gap-3"><span className="guide-icon"><tool.Icon aria-hidden="true" /></span><span className="category-tool-type">{external ? (fa ? "وب‌اپ مستقل" : "Standalone web app") : copy.label}</span></div>
        <h2 className="mt-5 text-lg font-bold">{info.name}</h2><p className="guide-copy mt-2 text-sm">{info.description}</p>
        <span className="category-tool-cta">{tool.category === "game" ? (fa ? "شروع بازی" : "Play now") : (fa ? "باز کردن ابزار" : "Open tool")}{external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <Arrow className="h-4 w-4" aria-hidden="true" />}</span>
      </Link></li>;
    })}</ul>
  </section>;
}
