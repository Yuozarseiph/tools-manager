import base from "../../../../public/manifest.json";
import { parseLocale } from "@/lib/localized-path";
export const dynamic = "force-static";
export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = parseLocale((await params).locale);
  return new Response(JSON.stringify({ ...base, id: "/", scope: "/", lang: locale, dir: locale === "fa" ? "rtl" : "ltr", start_url: `/${locale}` }), { headers: { "Content-Type": "application/manifest+json" } });
}
