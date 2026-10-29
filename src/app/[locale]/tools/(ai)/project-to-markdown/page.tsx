import AiTool from "@/components/tools/ai/AiTool";
import { AI_TOOLS } from "@/data/ai-tools";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["project-to-markdown"][locale];
 return pageMetadata(locale, "/tools/project-to-markdown", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="project-to-markdown" locale={locale} /><AiTool id="project-to-markdown" /><ToolGuide slug="project-to-markdown" locale={locale} /></>;
}
