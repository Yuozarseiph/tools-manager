import HtmlToPptxClient from "./HtmlToPptx";
import { getHtmlToPptxSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getHtmlToPptxSeo(locale);
 return pageMetadata(locale, "/tools/html-to-pptx", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="html-to-pptx" locale={locale} /><HtmlToPptxClient /><ToolGuide slug="html-to-pptx" locale={locale} /></>;
}
