// app/tools/(image)/image-converter/ImageConverter.tsx
"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import ImageConverterTool from "@/components/tools/image/image-converter/ImageConverter";
import { useImageConverterPageContent } from "./content";
import { HeaderContent } from "@/data/layout/header.content";
import { useLanguage } from "@/context/LanguageContext";

export default function ImageConverterClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useImageConverterPageContent();

  // 🔥 استفاده از HeaderContent
  const nav = HeaderContent[locale];

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" />
          {locale === "fa" ? "بازگشت به خانه" : "Back to home"}
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <ImageIcon size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>{page.title}</h1>
        </div>

        <p className={`max-w-2xl leading-relaxed ${theme.textMuted}`}>
          {page.description}
          <span className="block mt-1 text-xs opacity-70">
            {page.subtitle}
          </span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <ImageConverterTool />
      </div>
    </div>
  );
}
