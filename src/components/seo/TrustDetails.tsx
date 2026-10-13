import Link from "next/link";
import updated from "@/data/page-updated.json";
import type { Locale } from "@/lib/locale-detection";
export default function TrustDetails({ locale }: { locale: Locale }) {
  const fa = locale === "fa";
  return <section className="seo-guide mx-auto max-w-5xl space-y-3 px-6 py-8">
    <h2 className="text-xl font-bold">{fa ? "سازنده و اطلاعات پروژه" : "Creator and project information"}</h2>
    <p>{fa ? "QodeForge توسط XenonQode توسعه داده می‌شود." : "QodeForge is developed by XenonQode."} <a href="https://github.com/Yuozarseiph">GitHub</a></p>
    <p>{fa ? "آخرین تغییر این صفحه: " : "Page last changed: "}<time dateTime={updated["/about"]}>{updated["/about"].slice(0, 10)}</time></p>
    <p><Link href={`/${locale}/changelog`}>{fa ? "تاریخچه تغییرات" : "Changelog"}</Link> · <Link href={`/${locale}/contact`}>{fa ? "تماس با سازنده" : "Contact"}</Link> · <Link href={`/${locale}/privacy`}>{fa ? "جزئیات پردازش محلی و استثناهای شبکه" : "Local processing and network exceptions"}</Link></p>
  </section>;
}
