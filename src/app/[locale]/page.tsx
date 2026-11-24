import Home from "./Home";
import ToolListSchema from "@/features/seo/ToolListSchema";
import { parseLocale } from "@/lib/i18n/localized-path";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
 return <><Home /><ToolListSchema locale={parseLocale((await params).locale)} /></>;
}
