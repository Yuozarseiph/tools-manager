import BackgroundRemoverClient from "./BackgroundRemover";
import { getBackgroundRemoverSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getBackgroundRemoverSeo(locale);
 return pageMetadata(locale, "/tools/background-remover", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="background-remover" locale={locale} /><BackgroundRemoverClient /><ToolGuide slug="background-remover" locale={locale} /></>;
}
