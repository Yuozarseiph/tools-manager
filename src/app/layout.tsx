// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeBody from "@/components/ThemeBody"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tools Manager - جعبه ابزار آنلاین رایگان",
  description: "ابزارهای ادغام PDF، فشرده‌سازی عکس و ابزارهای توسعه‌دهندگان به صورت کاملاً امن و سمت کلاینت.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      
      <ThemeProvider>
        
        <ThemeBody 
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </ThemeBody>

      </ThemeProvider>
      
    </html>
  );
}
