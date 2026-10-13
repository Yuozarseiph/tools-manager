import CodeEditorClient from "./CodeEditor";
import { getCodeEditorSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getCodeEditorSeo(locale);
 return pageMetadata(locale, "/tools/code-editor", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="code-editor" locale={locale} /><CodeEditorClient /><ToolGuide slug="code-editor" locale={locale} /></>;
}
