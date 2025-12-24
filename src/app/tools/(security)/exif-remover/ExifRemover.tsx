// app/tools/(security)/exif-remover/ExifRemover.tsx

"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

import ExifRemoverTool from "@/components/tools/security/exif-remover/ExifRemoverTool";
import { useExifRemoverPageContent } from "./content";

export default function ExifRemoverClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useExifRemoverPageContent();

  const isFa = locale === "fa";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${theme.secondary}`}>
            <ShieldCheck className={theme.accent} size={22} />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black ${theme.text}`}>
              {page.title}
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${theme.textMuted}`}>
              {page.description}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className={`shrink-0 inline-flex items-center gap-2 text-sm font-medium ${theme.textMuted} hover:${theme.accent}`}
        >
          <ArrowRight className={isFa ? "" : "rotate-180"} size={18} />
          {isFa ? "بازگشت" : "Back"}
        </Link>
      </div>

      {/* Tool */}
      <div
        className={`rounded-3xl border p-4 sm:p-6 ${theme.card} ${theme.border}`}
      >
        <ExifRemoverTool />
      </div>
    </div>
  );
}
