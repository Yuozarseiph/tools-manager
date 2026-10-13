import ExcelViewerClient from "./ExcelViewer";
import { getExcelViewerSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getExcelViewerSeo(locale);
 return pageMetadata(locale, "/tools/excel-viewer", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="excel-viewer" locale={locale} /><ExcelViewerClient /><ToolGuide slug="excel-viewer" locale={locale} /></>;
}
