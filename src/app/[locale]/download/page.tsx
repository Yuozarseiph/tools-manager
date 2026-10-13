import Client from "./Client";
import { parseLocale } from "@/lib/localized-path";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/page-metadata";
type Props = { params: Promise<{ locale: string }> };
const copy = {"fa": {"title": "دانلود QodeForge", "description": "نصب QodeForge به‌عنوان وب‌اپلیکیشن پیش‌رونده برای دسترسی سریع‌تر به ابزارها."}, "en": {"title": "Download QodeForge", "description": "Install QodeForge as a progressive web app for faster access to its tools."}};
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return pageMetadata(locale, "/download", copy[locale].title, copy[locale].description);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
 "@context": "https://schema.org", "@type": "WebPage", name: copy[locale].title,
 description: copy[locale].description, url: `${SITE_URL}/${locale}/download`, inLanguage: locale,
 isPartOf: { "@id": `${SITE_URL}/#website` },
 }) }} /><Client /></>;
}
