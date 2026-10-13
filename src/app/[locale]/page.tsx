import Home from "./Home";
import ToolListSchema from "@/components/seo/ToolListSchema";
import { parseLocale } from "@/lib/localized-path";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
 return <><Home /><ToolListSchema locale={parseLocale((await params).locale)} /></>;
}
