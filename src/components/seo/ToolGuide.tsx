import Link from "next/link";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { guideData, toolInfo } from "@/lib/tool-guide";
import { localizedPath } from "@/lib/localized-path";
import { jsonLd, SITE_URL } from "@/lib/page-metadata";
import type { Locale } from "@/lib/locale-detection";

export function ToolBreadcrumb({ slug, locale }: { slug: string; locale: Locale }) {
  const tool = TOOLS.find(item => item.href === `/tools/${slug}`)!;
  const info = toolInfo(tool, locale);
  return <nav aria-label={locale === "fa" ? "مسیر صفحه" : "Breadcrumb"} className="mx-auto max-w-5xl px-6 pt-6 text-sm">
    <ol className="flex flex-wrap gap-2">
      <li><Link href={`/${locale}`}>{locale === "fa" ? "خانه" : "Home"}</Link></li>
      <li aria-hidden="true">/</li>
      <li><Link href={`/${locale}/tools/${tool.category}`}>{toolsContent[locale].categories[tool.category]}</Link></li>
      <li aria-hidden="true">/</li><li aria-current="page">{info.name}</li>
    </ol>
  </nav>;
}

export default function ToolGuide({ slug, locale }: { slug: string; locale: Locale }) {
  const tool = TOOLS.find(item => item.href === `/tools/${slug}`)!;
  const guide = guideData(tool, locale);
  const fa = locale === "fa";
  const url = `${SITE_URL}/${locale}${tool.href}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", "@id": `${url}#application`, name: guide.name,
      description: guide.description, url, inLanguage: ["fa-IR", "en-US"],
      applicationCategory: "UtilitiesApplication", operatingSystem: "Any", isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      featureList: guide.doc?.features ?? [guide.description], image: `${url}/opengraph-image.png`,
      provider: { "@id": `${SITE_URL}/#organization` } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: fa ? "خانه" : "Home", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: toolsContent[locale].categories[tool.category], item: `${SITE_URL}/${locale}/tools/${tool.category}` },
      { "@type": "ListItem", position: 3, name: guide.name, item: url },
    ] },
    { "@type": "HowTo", name: fa ? `چگونه از ${guide.name} استفاده کنیم؟` : `How to use ${guide.name}`,
      inLanguage: locale, step: guide.steps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })) },
    { "@type": "FAQPage", inLanguage: locale, mainEntity: guide.faq.map(([name, text]) => ({
      "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text },
    })) },
  ] };
  return <section aria-label={fa ? "راهنمای ابزار" : "Tool guide"} className="seo-guide mx-auto max-w-5xl space-y-6 px-6 py-10">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <h2 className="text-xl font-bold">{fa ? `${guide.name} چیست؟` : `What is ${guide.name}?`}</h2>
    <p>{guide.description} {fa ? "این ابزار رایگان در مرورگر اجرا می‌شود." : "This free tool runs in your browser."}</p>
    <h2 className="text-xl font-bold">{fa ? "چگونه از این ابزار استفاده کنیم؟" : "How do I use this tool?"}</h2>
    <ol className="list-inside list-decimal space-y-2">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
    {guide.doc?.howItWorks && <><h2 className="text-xl font-bold">{fa ? "این ابزار چگونه کار می‌کند؟" : "How does it work?"}</h2>
      <ul className="list-inside list-disc space-y-2">{guide.doc.howItWorks.map(step => <li key={step}>{step}</li>)}</ul></>}
    <h2 className="text-xl font-bold">{fa ? "محدودیت‌ها و حریم خصوصی" : "Limitations and privacy"}</h2>
    <p>{guide.limit}</p><p>{guide.faq[1][1]}</p>
    <table className="w-full text-start text-sm"><caption className="sr-only">{fa ? "ویژگی‌های ابزار" : "Tool features"}</caption><tbody>
      <tr><th scope="row" className="p-2 text-start">{fa ? "هزینه" : "Cost"}</th><td>{fa ? "رایگان" : "Free"}</td></tr>
      <tr><th scope="row" className="p-2 text-start">{fa ? "محیط اجرا" : "Runtime"}</th><td>{fa ? "مرورگر با JavaScript فعال" : "Browser with JavaScript enabled"}</td></tr>
      <tr><th scope="row" className="p-2 text-start">{fa ? "زبان‌ها" : "Languages"}</th><td>{fa ? "فارسی و انگلیسی" : "Persian and English"}</td></tr>
    </tbody></table>
    <h2 className="text-xl font-bold">{fa ? "پرسش‌های متداول" : "Frequently asked questions"}</h2>
    {guide.faq.map(([question, answer]) => <details key={question} className="rounded-xl border border-[var(--app-border)] p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3">{answer}</p></details>)}
    {guide.related.length > 0 && <><h2 className="text-xl font-bold">{fa ? "ابزارهای مرتبط" : "Related tools"}</h2><ul className="flex flex-wrap gap-4">
      {guide.related.map(other => <li key={other.id}><Link href={localizedPath(other.href, locale)}>{toolInfo(other, locale).name}</Link></li>)}
    </ul></>}
    <p><Link href={`${url}.md`}>{fa ? "نسخه متنی Markdown" : "Markdown version"}</Link> · <Link href={`/${locale}/privacy`}>{fa ? "حریم خصوصی" : "Privacy"}</Link></p>
  </section>;
}
