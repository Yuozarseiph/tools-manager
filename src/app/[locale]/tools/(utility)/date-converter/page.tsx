import DateConverterClient from "./DateConverter";
import { getDateConverterSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getDateConverterSeo(locale);
 return pageMetadata(locale, "/tools/date-converter", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="date-converter" locale={locale} /><DateConverterClient /><ToolGuide slug="date-converter" locale={locale} /></>;
}
