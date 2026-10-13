import Client from "./Client";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
const copy = {"fa": {"title": "تماس با QodeForge", "description": "راه‌های تماس با تیم QodeForge برای بازخورد، پیشنهاد و گزارش مشکل."}, "en": {"title": "Contact QodeForge", "description": "Contact the QodeForge team with feedback, suggestions or bug reports."}};
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return pageMetadata(locale, "/contact", copy[locale].title, copy[locale].description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title,
 description: copy[locale].description, url: `${SITE_URL}/${locale}/contact`, inLanguage: locale,
 isPartOf: { "@id": `${SITE_URL}/#website` },
 }) }} /><Client /></>;
}
