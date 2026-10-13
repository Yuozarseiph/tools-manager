import QrReaderClient from "./QrReader";
import { getQrReaderSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getQrReaderSeo(locale);
 return pageMetadata(locale, "/tools/qr-reader", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="qr-reader" locale={locale} /><QrReaderClient /><ToolGuide slug="qr-reader" locale={locale} /></>;
}
