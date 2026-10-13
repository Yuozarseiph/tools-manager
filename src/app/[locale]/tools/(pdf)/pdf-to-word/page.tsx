import PdfToWordClient from "./PdfToWord";
import { getPdfToWordSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getPdfToWordSeo(locale);
 return pageMetadata(locale, "/tools/pdf-to-word", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="pdf-to-word" locale={locale} /><PdfToWordClient /><ToolGuide slug="pdf-to-word" locale={locale} /></>;
}
