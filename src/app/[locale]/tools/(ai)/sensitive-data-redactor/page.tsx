import AiTool from "@/features/tools/ai/AiTool";
import { AI_TOOLS } from "@/config/ai-tools";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const copy = AI_TOOLS["sensitive-data-redactor"][locale];
 return pageMetadata(locale, "/tools/sensitive-data-redactor", copy[0], copy[1], true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="sensitive-data-redactor" locale={locale} /><AiTool id="sensitive-data-redactor" /><ToolGuide slug="sensitive-data-redactor" locale={locale} /></>;
}
