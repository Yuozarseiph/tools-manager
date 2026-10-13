import ExcelChartClient from "./ExcelChart";
import { getExcelChartSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getExcelChartSeo(locale);
 return pageMetadata(locale, "/tools/excel-chart", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="excel-chart" locale={locale} /><ExcelChartClient /><ToolGuide slug="excel-chart" locale={locale} /></>;
}
