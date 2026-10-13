import ColorPickerClient from "./ColorPicker";
import { getColorPickerSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getColorPickerSeo(locale);
 return pageMetadata(locale, "/tools/color-picker", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="color-picker" locale={locale} /><ColorPickerClient /><ToolGuide slug="color-picker" locale={locale} /></>;
}
