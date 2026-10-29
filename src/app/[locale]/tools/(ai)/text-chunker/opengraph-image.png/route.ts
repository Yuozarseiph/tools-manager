import { ogImage } from "@/lib/og-image";
import { TOOLS } from "@/data/tools";
import { toolInfo } from "@/lib/tool-guide";
import { parseLocale } from "@/lib/localized-path";
export const dynamic = "force-static";
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
 const locale = parseLocale((await params).locale);
 return ogImage(toolInfo(TOOLS.find(tool => tool.href === "/tools/text-chunker")!, locale).name, locale);
}

export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
