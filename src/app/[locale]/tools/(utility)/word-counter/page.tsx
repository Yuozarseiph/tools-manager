import WordCounterClient from "./WordCounter";
import { getWordCounterSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getWordCounterSeo(locale);
 return pageMetadata(locale, "/tools/word-counter", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="word-counter" locale={locale} /><WordCounterClient /><ToolGuide slug="word-counter" locale={locale} /></>;
}
