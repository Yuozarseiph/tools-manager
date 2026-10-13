import TextToPdfClient from "./TextToPdf";
import { getTextToPdfSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getTextToPdfSeo(locale);
 return pageMetadata(locale, "/tools/text-to-pdf", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="text-to-pdf" locale={locale} /><TextToPdfClient /><ToolGuide slug="text-to-pdf" locale={locale} /></>;
}
