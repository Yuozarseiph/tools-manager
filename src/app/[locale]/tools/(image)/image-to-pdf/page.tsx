import ImageToPdfClient from "./ImageToPdf";
import { getImageToPdfSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getImageToPdfSeo(locale);
 return pageMetadata(locale, "/tools/image-to-pdf", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="image-to-pdf" locale={locale} /><ImageToPdfClient /><ToolGuide slug="image-to-pdf" locale={locale} /></>;
}
