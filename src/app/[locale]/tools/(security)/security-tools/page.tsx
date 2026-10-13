import SecurityToolsClient from "./SecurityTools";
import { getSecurityToolsSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getSecurityToolsSeo(locale);
 return pageMetadata(locale, "/tools/security-tools", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="security-tools" locale={locale} /><SecurityToolsClient /><ToolGuide slug="security-tools" locale={locale} /></>;
}
