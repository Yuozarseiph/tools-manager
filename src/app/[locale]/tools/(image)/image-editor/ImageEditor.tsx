// app/tools/(image)/image-editor/ImageEditor.tsx
"use client";
import dynamic from "next/dynamic";

import Link from "@/components/LocalizedLink";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
const ImageEditorTool = dynamic(() => import("@/components/tools/image/image-editor/ImageEditorTool"));
import { useImageEditorPageContent } from "./content";
import { HeaderContent } from "@/data/layout/header.content";
import { useLanguage } from "@/context/LanguageContext";

export default function ImageEditorClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useImageEditorPageContent();

  //  استفاده از HeaderContent
  const nav = HeaderContent[locale];

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      {/* Header ساده مثل بقیه ابزارها */}
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

        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          {page.description}
        </p>
      </div>

      {/* محوطه ابزار */}
      <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
        <ImageEditorTool />
      </div>
    </div>
  );
}
