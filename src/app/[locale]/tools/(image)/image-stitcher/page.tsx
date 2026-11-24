import ImageStitcherClient from "./ImageStitcher";
import { getImageStitcherSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getImageStitcherSeo(locale);
 return pageMetadata(locale, "/tools/image-stitcher", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="image-stitcher" locale={locale} /><ImageStitcherClient /><ToolGuide slug="image-stitcher" locale={locale} /></>;
}
