import ImageToSvgClient from "./ImageToSvg";
import { getImageToSvgSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getImageToSvgSeo(locale);
 return pageMetadata(locale, "/tools/image-to-svg", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="image-to-svg" locale={locale} /><ImageToSvgClient /><ToolGuide slug="image-to-svg" locale={locale} /></>;
}
