import ExcelEditorClient from "./ExcelEditor";
import { getExcelEditorSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getExcelEditorSeo(locale);
 return pageMetadata(locale, "/tools/excel-editor", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="excel-editor" locale={locale} /><ExcelEditorClient /><ToolGuide slug="excel-editor" locale={locale} /></>;
}
