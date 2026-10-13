import CodeVisualizerClient from "./CodeVisualizer";
import { getCodeVisualizerSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getCodeVisualizerSeo(locale);
 return pageMetadata(locale, "/tools/code-visualizer", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="code-visualizer" locale={locale} /><CodeVisualizerClient /><ToolGuide slug="code-visualizer" locale={locale} /></>;
}
