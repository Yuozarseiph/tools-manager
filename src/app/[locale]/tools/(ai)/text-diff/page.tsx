import AiTool from "@/components/tools/ai/AiTool";
import { AI_TOOLS } from "@/data/ai-tools";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["text-diff"][locale];
 return pageMetadata(locale, "/tools/text-diff", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="text-diff" locale={locale} /><AiTool id="text-diff" /><ToolGuide slug="text-diff" locale={locale} /></>;
}
