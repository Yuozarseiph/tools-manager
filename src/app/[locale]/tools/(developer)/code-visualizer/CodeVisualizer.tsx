// app/tools/(developer)/code-visualizer/CodeVisualizer.tsx
"use client";
import dynamic from "next/dynamic";

import Link from "@/components/LocalizedLink";
import { ArrowRight, GitGraph } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
const CodeVisualizerTool = dynamic(() => import("@/components/tools/developer/code-visualizer/CodeVisualizerTool"));
import { useCodeVisualizerPageContent } from "./content";
import { HeaderContent } from "@/data/layout/header.content";
import { useLanguage } from "@/context/LanguageContext";

export default function CodeVisualizerClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const page = useCodeVisualizerPageContent();

  //  استفاده از HeaderContent
  const nav = HeaderContent[locale];

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-6 pt-10 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" />
          {locale === "fa" ? "بازگشت به خانه" : "Back to home"}
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <GitGraph size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>{page.title}</h1>
        </div>

        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          {page.description}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 w-full flex-1">
        <CodeVisualizerTool />
      </div>
    </div>
  );
}
