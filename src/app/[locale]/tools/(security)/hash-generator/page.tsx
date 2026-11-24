import HashGeneratorClient from "./HashGenerator";
import { getHashGeneratorSeo } from "./content";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { parseLocale } from "@/lib/i18n/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/features/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getHashGeneratorSeo(locale);
 return pageMetadata(locale, "/tools/hash-generator", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="hash-generator" locale={locale} /><HashGeneratorClient /><ToolGuide slug="hash-generator" locale={locale} /></>;
}
