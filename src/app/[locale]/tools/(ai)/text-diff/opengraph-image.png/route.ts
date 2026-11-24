import { ogImage } from "@/lib/seo/og-image";
import { TOOLS } from "@/config/tools";
import { toolInfo } from "@/lib/seo/tool-guide";
import { parseLocale } from "@/lib/i18n/localized-path";
export const dynamic = "force-static";
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
 const locale = parseLocale((await params).locale);
 return ogImage(toolInfo(TOOLS.find(tool => tool.href === "/tools/text-diff")!, locale).name, locale);
}

export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
