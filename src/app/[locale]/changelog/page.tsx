import Client from "./Client";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
const copy = {"fa": {"title": "تغییرات QodeForge", "description": "آخرین تغییرات، قابلیت‌ها و بهبودهای ابزارهای QodeForge."}, "en": {"title": "QodeForge changelog", "description": "Latest QodeForge releases, improvements and new features."}};
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return pageMetadata(locale, "/changelog", copy[locale].title, copy[locale].description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title,
 description: copy[locale].description, url: `${SITE_URL}/${locale}/changelog`, inLanguage: locale,
 isPartOf: { "@id": `${SITE_URL}/#website` },
 }) }} /><Client /></>;
}
