import Client from "./Client";
import TrustDetails from "@/components/seo/TrustDetails";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
const copy = {"fa": {"title": "درباره QodeForge", "description": "درباره جعبه‌ابزار آنلاین QodeForge و رویکرد آن به سرعت و حریم خصوصی."}, "en": {"title": "About QodeForge", "description": "Learn about QodeForge, a fast and privacy-friendly online toolbox."}};
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return pageMetadata(locale, "/about", copy[locale].title, copy[locale].description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title,
 description: copy[locale].description, url: `${SITE_URL}/${locale}/about`, inLanguage: locale,
 isPartOf: { "@id": `${SITE_URL}/#website` },
 }) }} /><Client /><TrustDetails locale={locale} /></>;
}
