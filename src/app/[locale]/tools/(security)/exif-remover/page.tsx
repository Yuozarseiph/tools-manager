import ExifRemoverClient from "./ExifRemover";
import { getExifRemoverSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getExifRemoverSeo(locale);
 return pageMetadata(locale, "/tools/exif-remover", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="exif-remover" locale={locale} /><ExifRemoverClient /><ToolGuide slug="exif-remover" locale={locale} /></>;
}
