import Client from "./Client";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
const copy = {"fa": {"title": "حریم خصوصی QodeForge", "description": "سیاست حریم خصوصی QodeForge و توضیح پردازش محلی فایل‌ها در مرورگر."}, "en": {"title": "QodeForge privacy policy", "description": "QodeForge privacy policy and details about local browser processing."}};
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return pageMetadata(locale, "/privacy", copy[locale].title, copy[locale].description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title,
 description: copy[locale].description, url: `${SITE_URL}/${locale}/privacy`, inLanguage: locale,
 isPartOf: { "@id": `${SITE_URL}/#website` },
 }) }} /><Client /></>;
}
