import ImageEditorClient from "./ImageEditor";
import { getImageEditorSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getImageEditorSeo(locale);
 return pageMetadata(locale, "/tools/image-editor", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="image-editor" locale={locale} /><ImageEditorClient /><ToolGuide slug="image-editor" locale={locale} /></>;
}
