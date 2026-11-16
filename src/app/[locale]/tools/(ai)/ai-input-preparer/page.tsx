import AiWorkflow from "@/components/tools/ai/AiWorkflow";
import { AI_TOOLS } from "@/data/ai-tools";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["ai-input-preparer"][locale];
 return pageMetadata(locale, "/tools/ai-input-preparer", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="ai-input-preparer" locale={locale} /><AiWorkflow id="ai-input-preparer" /><ToolGuide slug="ai-input-preparer" locale={locale} /></>;
}
