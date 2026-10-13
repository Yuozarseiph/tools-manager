import UnitConverterClient from "./UnitConverter";
import { getUnitConverterSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getUnitConverterSeo(locale);
 return pageMetadata(locale, "/tools/unit-converter", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="unit-converter" locale={locale} /><UnitConverterClient /><ToolGuide slug="unit-converter" locale={locale} /></>;
}
