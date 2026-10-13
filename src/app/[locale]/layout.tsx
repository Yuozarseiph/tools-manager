import type { Metadata } from "next";
import SiteLayout, { viewport } from "@/components/SiteLayout";
import { pageMetadata } from "@/lib/page-metadata";
import { parseLocale } from "@/lib/localized-path";
export { viewport };
export const dynamicParams = false;
export function generateStaticParams() { return [{ locale: "fa" }, { locale: "en" }]; }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
 const locale = parseLocale((await params).locale);
 return { ...pageMetadata(locale, "/", locale === "fa" ? "ابزارهای آنلاین رایگان" : "Free online tools",
 locale === "fa" ? "ابزارهای رایگان PDF، تصویر، صدا، اکسل و برنامه‌نویسی را در مرورگر استفاده کنید؛ بدون ثبت‌نام، به فارسی و انگلیسی و با راهنمای کاربرد و حریم خصوصی." : "Free tools for PDF, images, audio, spreadsheets and code. Work in your browser without an account, with Persian and English guides and privacy details."),
 metadataBase: new URL("https://qodeforge.ir"), applicationName: "QodeForge", creator: "XenonQode",
 manifest: `/${locale}/manifest.webmanifest`, icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
 robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
 appleWebApp: { capable: true, statusBarStyle: "default", title: "QodeForge" } };
}
export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
 return <SiteLayout locale={parseLocale((await params).locale)}>{children}</SiteLayout>;
}
