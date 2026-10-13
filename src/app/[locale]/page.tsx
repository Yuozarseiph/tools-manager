import Home from "./Home";
import ToolDirectory from "@/components/seo/ToolDirectory";
import { parseLocale } from "@/lib/localized-path";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
 return <><Home /><ToolDirectory locale={parseLocale((await params).locale)} /></>;
}
