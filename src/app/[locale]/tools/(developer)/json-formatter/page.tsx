import JsonFormatterClient from "./JsonFormatter";
import { getJsonFormatterSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getJsonFormatterSeo(locale);
 return pageMetadata(locale, "/tools/json-formatter", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="json-formatter" locale={locale} /><JsonFormatterClient /><ToolGuide slug="json-formatter" locale={locale} /></>;
}
