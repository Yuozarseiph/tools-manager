// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeBody from "@/components/ThemeBody";
import InstallPWA from "@/components/InstallPWA";
import { Vazirmatn } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazir",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
          <ThemeBody className={`${vazir.variable} antialiased font-sans`}>
            <Header />
            {children}
            <InstallPWA />
             <Footer/>
          </ThemeBody>
        </LanguageProvider>
      </ThemeProvider>
    </html>
  );
}
