import { ogImage } from "@/lib/og-image";
import { parseLocale } from "@/lib/localized-path";
export const dynamic = "force-static";
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = parseLocale((await params).locale);
  return ogImage(locale === "fa" ? "ابزارهای آنلاین رایگان" : "Free online tools", locale);
}

export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
