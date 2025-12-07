"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import ImageConverter from "@/components/tools/ImageConverter";
import {
  useToolContent,
  type ImageConverterToolContent,
} from "@/hooks/useToolContent";
import { useLanguage } from "@/context/LanguageContext";

export default function ImageConverterPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();
  const content =
    useToolContent<ImageConverterToolContent>("image-converter");

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {t("docs.back")}
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <ImageIcon size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>
            {content.ui.page.title}
          </h1>
        </div>

        <p className={`max-w-2xl leading-relaxed ${theme.textMuted}`}>
          {content.ui.page.description}
          <span className="block mt-1 text-xs opacity-70">
            {content.ui.page.subtitle}
          </span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <ImageConverter />
      </div>
    </div>
  );
}
