import AiTool from "@/features/tools/ai/AiTool";
import { AI_TOOLS } from "@/config/ai-tools";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["text-cleaner"][locale];
 return pageMetadata(locale, "/tools/text-cleaner", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="text-cleaner" locale={locale} /><AiTool id="text-cleaner" /><ToolGuide slug="text-cleaner" locale={locale} /></>;
}
