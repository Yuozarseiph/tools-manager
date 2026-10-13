import WordToPdfClient from "./WordToPdf";
import { getWordToPdfSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getWordToPdfSeo(locale);
 return pageMetadata(locale, "/tools/word-to-pdf", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="word-to-pdf" locale={locale} /><WordToPdfClient /><ToolGuide slug="word-to-pdf" locale={locale} /></>;
}
