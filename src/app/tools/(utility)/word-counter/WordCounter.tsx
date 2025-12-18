// app/tools/(utility)/word-counter/WordCounter.tsx
"use client";

import Link from "next/link";
import { ArrowRight, TextCursorInput } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import WordCounterTool from "@/components/tools/utility/word-counter/WordCounterTool";
import { useWordCounterPageContent } from "./content";
import { useLanguage } from "@/context/LanguageContext";

export default function WordCounterClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useWordCounterPageContent();

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
            <TextCursorInput size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>{page.title}</h1>
        </div>

        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          {page.description}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
        <WordCounterTool />
      </div>
    </div>
  );
}
