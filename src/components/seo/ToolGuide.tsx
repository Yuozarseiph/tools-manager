import Link from "next/link";
import { ArrowUpLeft, BookOpen, ChevronDown, ChevronLeft, CircleHelp, FileText, Globe, ListChecks, LockKeyhole, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { guideData, toolInfo } from "@/lib/tool-guide";
import { localizedPath } from "@/lib/localized-path";
import { jsonLd, SITE_URL } from "@/lib/page-metadata";
import type { Locale } from "@/lib/locale-detection";

export function ToolBreadcrumb({ slug, locale }: { slug: string; locale: Locale }) {
  const tool = TOOLS.find(item => item.href === `/tools/${slug}`)!;
  const info = toolInfo(tool, locale);
  return <><nav aria-label={locale === "fa" ? "مسیر صفحه" : "Breadcrumb"} className="guide-breadcrumb mx-auto max-w-6xl px-4 pt-6 sm:px-6">
    <ol className="flex flex-wrap items-center gap-2">
      <li><Link href={`/${locale}`}>{locale === "fa" ? "خانه" : "Home"}</Link></li>
      <li aria-hidden="true"><ChevronLeft className="h-3 w-3 ltr:rotate-180" /></li>
      <li><Link href={`/${locale}/tools/${tool.category}`}>{toolsContent[locale].categories[tool.category]}</Link></li>
      <li aria-hidden="true"><ChevronLeft className="h-3 w-3 ltr:rotate-180" /></li><li aria-current="page">{info.name}</li>
    </ol>
  </nav></>;
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
  return <section aria-label={fa ? "راهنمای ابزار" : "Tool guide"} className="tool-guide mx-auto max-w-6xl space-y-5 px-4 py-10 sm:px-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <div className="guide-panel guide-intro">
      <div className="guide-heading"><span className="guide-icon"><BookOpen aria-hidden="true" /></span><div><span className="guide-eyebrow">{fa ? "بیشتر درباره این ابزار" : "GET TO KNOW THIS TOOL"}</span><h2>{fa ? `${guide.name} چیست؟` : `What is ${guide.name}?`}</h2></div></div>
      <p className="guide-copy mt-4">{guide.description}</p>
      <ul className="guide-badges mt-5"><li><Wallet aria-hidden="true" />{fa ? "استفاده رایگان" : "Free to use"}</li><li><Globe aria-hidden="true" />{fa ? "اجرا در مرورگر" : "Runs in your browser"}</li><li><Sparkles aria-hidden="true" />{fa ? "فارسی و انگلیسی" : "Persian & English"}</li></ul>
    </div>
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="guide-panel h-full">
        <div className="guide-heading"><span className="guide-icon"><ListChecks aria-hidden="true" /></span><h2>{fa ? "چگونه از این ابزار استفاده کنیم؟" : "How do I use this tool?"}</h2></div>
        <ol className="guide-steps mt-6">{guide.steps.map((step, index) => <li key={step}><span className="guide-step-number" aria-hidden="true">{(index + 1).toLocaleString(locale)}</span><p>{step}</p></li>)}</ol>
      </div>
      <div className="guide-panel h-full">
        <div className="guide-heading"><span className="guide-icon"><ShieldCheck aria-hidden="true" /></span><h2>{fa ? "محدودیت‌ها و حریم خصوصی" : "Limitations and privacy"}</h2></div>
        <p className="guide-copy mt-5">{guide.limit}</p>
        <div className="guide-note mt-5"><LockKeyhole className="h-5 w-5 shrink-0" aria-hidden="true" /><p>{guide.faq[1][1]}</p></div>
      </div>
    </div>
    {guide.doc?.howItWorks && <div className="guide-panel"><div className="guide-heading"><span className="guide-icon"><Sparkles aria-hidden="true" /></span><h2>{fa ? "این ابزار چگونه کار می‌کند؟" : "How does it work?"}</h2></div>
      <ul className="guide-copy mt-5 list-inside list-disc space-y-3">{guide.doc.howItWorks.map(step => <li key={step}>{step}</li>)}</ul></div>}
    <div className="guide-panel">
      <div className="guide-heading"><span className="guide-icon"><CircleHelp aria-hidden="true" /></span><div><h2>{fa ? "پرسش‌های متداول" : "Frequently asked questions"}</h2><p className="guide-copy text-sm">{fa ? "پاسخ‌های کوتاه، پیش از شروع کار" : "Quick answers before you get started"}</p></div></div>
      <div className="guide-faq mt-6">{guide.faq.map(([question, answer]) => <details key={question} name={`tool-faq-${slug}`}><summary><span>{question}</span><ChevronDown className="guide-chevron h-4 w-4 shrink-0" aria-hidden="true" /></summary><p className="guide-copy">{answer}</p></details>)}</div>
    </div>
    {guide.related.length > 0 && <div className="guide-panel"><div className="guide-heading"><span className="guide-icon"><tool.Icon aria-hidden="true" /></span><h2>{fa ? "ابزارهای مرتبط" : "Related tools"}</h2></div><ul className="mt-6 grid gap-3 sm:grid-cols-3">
      {guide.related.map(other => <li key={other.id}><Link className="guide-related" href={localizedPath(other.href, locale)}><other.Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{toolInfo(other, locale).name}</span><ArrowUpLeft className="ms-auto h-4 w-4 shrink-0 ltr:rotate-90" aria-hidden="true" /></Link></li>)}
    </ul></div>}
    <footer className="guide-footer"><span>{fa ? "راهنما و اطلاعات تکمیلی" : "Guides and resources"}</span><div className="flex flex-wrap gap-3"><Link href={`${url}.md`}><FileText className="h-4 w-4" aria-hidden="true" />{fa ? "نسخه متنی Markdown" : "Markdown version"}</Link><Link href={`/${locale}/privacy`}><ShieldCheck className="h-4 w-4" aria-hidden="true" />{fa ? "حریم خصوصی" : "Privacy"}</Link></div></footer>
  </section>;
}
