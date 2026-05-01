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
  title: "Tools Manager - جعبه ابزار آنلاین رایگان",
  description:
    "ابزارهای ادغام PDF، فشرده‌سازی عکس و ابزارهای توسعه‌دهندگان به صورت کاملاً امن و سمت کلاینت.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tools Manager",
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
