import DocsClient from "./Docs";
import DocsDirectory from "@/components/seo/DocsDirectory";
import { getDocsSeo } from "./content";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getDocsSeo(locale);
 return pageMetadata(locale, "/docs", seo.title, seo.description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "CollectionPage", name: getDocsSeo(locale).title,
 url: `${SITE_URL}/${locale}/docs`, inLanguage: locale,
 }) }} /><DocsClient /><DocsDirectory locale={locale} /></>;
}
