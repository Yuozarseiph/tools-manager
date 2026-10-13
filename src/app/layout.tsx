import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
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
      path: "../../public/fonts/IRANYekanXFaNum-Thin-B3kNNEqL.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanXFaNum-UltraLight-T64OGaPz.woff2",
      weight: "200",
      style: "normal",
    },
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

export const metadata: Metadata = {
  metadataBase: new URL("https://qodeforge.ir"),
  title: "QodeForge | ابزارهای آنلاین رایگان برای فایل، تصویر، PDF و کد",
  description:
    "ابزارهای آنلاین رایگان برای PDF، تصویر، فایل، صفحه‌گسترده و توسعه‌دهندگان؛ سریع، دوزبانه و با پردازش امن در مرورگر.",
  keywords: [
    "online tools",
    "free PDF tools",
    "image tools",
    "developer tools",
    "ابزار آنلاین",
    "ابزار PDF",
    "ابزارهای کاربردی فارسی",
    "QodeForge",
  ],
  applicationName: "QodeForge",
  authors: [{ name: "QodeForge" }],
  creator: "QodeForge",
  publisher: "QodeForge",
  category: "technology",
  alternates: {
    canonical: "https://qodeforge.ir/",
    languages: {
      "fa-IR": "https://qodeforge.ir/?lang=fa",
      "en-US": "https://qodeforge.ir/?lang=en",
      "x-default": "https://qodeforge.ir/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "QodeForge",
    url: "https://qodeforge.ir/",
    title: "QodeForge | ابزارهای آنلاین رایگان و سریع",
    description:
      "ابزارهای دوزبانه برای PDF، فایل، تصویر و توسعه با پردازش محلی در مرورگر.",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "QodeForge online tools",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "QodeForge | Free online tools",
    description:
      "Bilingual online tools for PDF, images, files and developers.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QodeForge",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <ThemeProvider>
        <LanguageProvider>
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
                    {
                      "@type": "WebApplication",
                      "@id": "https://qodeforge.ir/#application",
                      name: "QodeForge online tools",
                      alternateName: "ابزارهای آنلاین QodeForge",
                      url: "https://qodeforge.ir/",
                      applicationCategory: "UtilitiesApplication",
                      operatingSystem: "Any",
                      isAccessibleForFree: true,
                      inLanguage: ["fa-IR", "en-US"],
                    },
                  ],
                }),
              }}
            />
            <Header />
            {children}
            <InstallPWA />
            <Footer />
          </ThemeBody>
        </LanguageProvider>
      </ThemeProvider>
    </html>
  );
}
