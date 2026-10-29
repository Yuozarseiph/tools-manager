import type { Viewport } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import type { Locale } from "@/lib/locale-detection";
import { PanelMotionProvider } from "@/components/ui/PanelMotion";
import ActivityCenter from "@/components/ui/ActivityCenter";
import ExportDialog from "@/components/ui/ExportDialog";
import Accessibility from "@/components/Accessibility";
import AgentTools from "@/components/AgentTools";
import LocalePreferenceGuard from "@/components/LocalePreferenceGuard";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeBody from "@/components/ThemeBody";
import InstallPWA from "@/components/InstallPWA";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// فونت ایران یکان - جایگزین Geist Sans برای فارسی
const iranYekan = localFont({
  src: [
    {
      path: "../../public/fonts/IRANYekanXFaNum-Light-C1K6kEyq.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-Regular-NJOSFezJ.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-Medium-DtIGUAVZ.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-DemiBold-DOu07JpD.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-Bold-DnKohisb.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-ExtraBlack-ChhGgIQc.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-Black-CChIAnIp.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  preload: false,
  variable: "--font-iran-yekan",
  display: "swap",
  fallback: ["tahoma", "arial", "sans-serif"],
});

// فونت وزیرمتن - برای تیترها یا استفاده خاص
const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
  fallback: ["tahoma", "arial", "sans-serif"],
});


export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function SiteLayout({
  children, locale,
}: Readonly<{
  children: React.ReactNode;
  locale: Locale;
}>) {
  return (
    <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script
          id="qodeforge-theme"
          dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('app-theme');var d=['royal-blue-dark','ruby-red-dark','emerald-green-dark','classic-dark','secret-purple'].includes(t);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch{}` }}
        />
      </head>
      <ThemeProvider>
        <LanguageProvider initialLocale={locale}>
          <ThemeBody
            className={`${iranYekan.variable} ${vazirmatn.variable} antialiased font-sans`}
          >
            <script
              id="qodeforge-structured-data"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "Organization",
                      "@id": "https://qodeforge.ir/#organization",
                      name: "QodeForge",
                      alternateName: "کد فورج",
                      url: "https://qodeforge.ir/",
                      logo: "https://qodeforge.ir/icons/icon-512.png",
                      sameAs: ["https://github.com/Yuozarseiph"],
                    },
                    {
                      "@type": "WebSite",
                      "@id": "https://qodeforge.ir/#website",
                      name: "QodeForge",
                      url: "https://qodeforge.ir/",
                      inLanguage: ["fa-IR", "en-US"],
                      publisher: {
                        "@id": "https://qodeforge.ir/#organization",
                      },
                    },
                  ],
                }),
              }}
            />
            <a className="skip-link" href="#main-content">{locale === "fa" ? "پرش به محتوای اصلی" : "Skip to main content"}</a>
            <PanelMotionProvider>
            <Header />
            <LocalePreferenceGuard />
            <main id="main-content" tabIndex={-1}>{children}</main>
            <ActivityCenter />
            <ExportDialog />
            <Accessibility />
            <AgentTools />
            <InstallPWA />
            <Footer />
            </PanelMotionProvider>
          </ThemeBody>
        </LanguageProvider>
      </ThemeProvider>
    </html>
  );
}
