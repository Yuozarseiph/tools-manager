// app/tools/(image)/background-remover/BackgroundRemover.tsx

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

import BackgroundRemoverTool from "@/components/tools/image/background-remover/BackgroundRemoverTool";
import { useBackgroundRemoverPageContent } from "./content";

export default function BackgroundRemoverClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useBackgroundRemoverPageContent();

  const isFa = locale === "fa";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${theme.secondary}`}>
            <Sparkles className={theme.accent} size={22} />
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

      <div
        className={`rounded-3xl border p-4 sm:p-6 ${theme.card} ${theme.border}`}
      >
        <BackgroundRemoverTool />
      </div>
    </div>
  );
}
