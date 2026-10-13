import AudioEditorClient from "./AudioEditor";
import { getAudioEditorSeo } from "./content";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
import ToolGuide, { ToolBreadcrumb } from "@/components/seo/ToolGuide";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
 const locale = parseLocale((await params).locale); const seo = getAudioEditorSeo(locale);
 return pageMetadata(locale, "/tools/audio-editor", seo.title, seo.description, true);
}
export default async function Page({ params }: Props) {
 const locale = parseLocale((await params).locale);
 return <><ToolBreadcrumb slug="audio-editor" locale={locale} /><AudioEditorClient /><ToolGuide slug="audio-editor" locale={locale} /></>;
}
