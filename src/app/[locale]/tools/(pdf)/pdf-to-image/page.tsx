import PdfToImageClient from "./PdfToImage";
import { getPdfToImageSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getPdfToImageSeo(locale);
 return pageMetadata(locale, "/tools/pdf-to-image", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="pdf-to-image" locale={locale} /><PdfToImageClient /><ToolGuide slug="pdf-to-image" locale={locale} /></>;
}
