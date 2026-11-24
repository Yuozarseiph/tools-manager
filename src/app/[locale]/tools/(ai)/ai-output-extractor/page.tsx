import AiWorkflow from "@/features/tools/ai/AiWorkflow";
import { AI_TOOLS } from "@/config/ai-tools";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["ai-output-extractor"][locale];
 return pageMetadata(locale, "/tools/ai-output-extractor", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="ai-output-extractor" locale={locale} /><AiWorkflow id="ai-output-extractor" /><ToolGuide slug="ai-output-extractor" locale={locale} /></>;
}
