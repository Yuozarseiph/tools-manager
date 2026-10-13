import { TOOLS } from "@/data/tools";
import { toolInfo } from "@/lib/tool-guide";
import type { Locale } from "@/lib/locale-detection";
import Link from "next/link";
export default function DocsDirectory({ locale }: { locale: Locale }) {
  return <section className="seo-guide mx-auto max-w-7xl space-y-4 px-6 py-8">
    <details><summary className="cursor-pointer text-xl font-bold">{locale === "fa" ? "مستندات همه ابزارها" : "Documentation for every tool"}</summary>
      {TOOLS.filter(tool => tool.status === "active").map(tool => { const info = toolInfo(tool, locale); return <article key={tool.id} className="my-6 space-y-2">
        <h2 className="text-lg font-bold"><Link href={tool.href.startsWith("/") ? `/${locale}${tool.href}` : tool.href}>{info.name}</Link></h2><p>{info.description}</p>
        {info.doc?.howItWorks && <ol className="list-inside list-decimal">{info.doc.howItWorks.map(step => <li key={step}>{step}</li>)}</ol>}
      </article>; })}
    </details>
  </section>;
}
