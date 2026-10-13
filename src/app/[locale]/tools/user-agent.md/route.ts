import { toolMarkdown } from "@/lib/tool-markdown";
import { parseLocale } from "@/lib/localized-path";
export const dynamic = "force-static";
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
 return new Response(toolMarkdown("user-agent", parseLocale((await params).locale)), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}

export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
