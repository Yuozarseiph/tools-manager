import Link from "next/link";
import { agentToolDefinitions } from "@/lib/agent-tools";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const locale = parseLocale((await params).locale);
  return pageMetadata(locale, "/agents", locale === "fa" ? "راهنمای ایجنت‌ها" : "Agent integration guide", locale === "fa" ? "فهرست ابزارها، نسخه Markdown و ابزارهای قابل فراخوانی QodeForge برای ایجنت‌ها." : "Discover QodeForge Markdown guides, tool schemas and browser-local callable tools for agents.");
}
export default async function Page({ params }: Props) {
  const locale = parseLocale((await params).locale); const fa = locale === "fa";
  return <section className="seo-guide mx-auto max-w-5xl space-y-5 px-6 py-10">
    <h1 className="text-3xl font-bold">{fa ? "راهنمای ایجنت‌های هوش مصنوعی" : "AI agent integration guide"}</h1>
    <p>{fa ? "محتوای ابزارها به دو زبان در HTML و Markdown در دسترس است. توابع زیر فقط ورودی ارسال‌شده به خود تابع را در مرورگر پردازش می‌کنند و داده‌ای ذخیره یا ارسال نمی‌کنند." : "Tool guides are available in HTML and Markdown in two languages. The following functions process only the supplied arguments in the browser and do not store data or send network requests."}</p>
    <ul className="list-inside list-disc"><li><Link href="/llms.txt">llms.txt</Link></li><li><Link href="/llms-full.txt">llms-full.txt</Link></li><li><Link href="/agent-tools.json">{fa ? "تعریف ابزارها با JSON Schema" : "Tool definitions with JSON Schema"}</Link></li></ul>
    <p>{fa ? "در مرورگرهای سازگار، این توابع با WebMCP ثبت می‌شوند. در سایر مرورگرها، فراخوانی از طریق window.QodeForgeTools امکان‌پذیر است. این قابلیت API سرور نیست." : "On compatible browsers, these functions register through WebMCP. On other browsers, call window.QodeForgeTools. These are browser functions, not server API endpoints."}</p>
    <pre dir="ltr" className="overflow-auto rounded-xl bg-[var(--app-secondary-bg)] p-4 text-sm">{'await window.QodeForgeTools.execute("qodeforge_base64", { text: "سلام", action: "encode" })'}</pre>
    {agentToolDefinitions.map(tool => <details key={tool.name}><summary className="cursor-pointer font-bold" dir="ltr">{tool.name}</summary><p lang="en" dir="ltr">{tool.description}</p><pre dir="ltr" className="overflow-auto text-sm">{JSON.stringify(tool.inputSchema, null, 2)}</pre></details>)}
    <p><Link href={`/${locale}/tools/unit-converter`}>{fa ? "واحدهای پشتیبانی‌شده را در ابزار تبدیل واحد ببینید" : "See supported unit keys in the unit converter"}</Link></p>
  </section>;
}
