import PdfMergeClient from "./PdfMerge";
import { getPdfMergeSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getPdfMergeSeo(locale);
 return pageMetadata(locale, "/tools/pdf-merge", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="pdf-merge" locale={locale} /><PdfMergeClient /><ToolGuide slug="pdf-merge" locale={locale} /></>;
}
