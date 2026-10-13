import IPCheckerClient from "./IPChecker";
import { getIPCheckerSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getIPCheckerSeo(locale);
 return pageMetadata(locale, "/tools/ip-checker", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="ip-checker" locale={locale} /><IPCheckerClient /><ToolGuide slug="ip-checker" locale={locale} /></>;
}
