import BankToolsClient from "./BankTools";
import { getBankToolsSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getBankToolsSeo(locale);
 return pageMetadata(locale, "/tools/bank", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="bank" locale={locale} /><BankToolsClient /><ToolGuide slug="bank" locale={locale} /></>;
}
