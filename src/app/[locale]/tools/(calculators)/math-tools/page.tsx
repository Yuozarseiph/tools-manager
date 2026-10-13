import MathToolsClient from "./MathTools";
import { getMathToolsSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getMathToolsSeo(locale);
 return pageMetadata(locale, "/tools/math-tools", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="math-tools" locale={locale} /><MathToolsClient /><ToolGuide slug="math-tools" locale={locale} /></>;
}
