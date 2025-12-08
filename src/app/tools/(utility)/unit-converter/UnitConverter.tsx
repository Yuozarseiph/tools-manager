"use client";

import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import UnitConverterTool from "@/components/tools/utility/unit-converter/UnitConverterTool";
import { useUnitConverterPageContent } from "./content";
import { useLanguage } from "@/context/LanguageContext";

export default function UnitConverterPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();
  const page = useUnitConverterPageContent();

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
            <Scale size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>
            {page.title}
          </h1>
        </div>

        <p
          className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}
        >
          {page.description}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
        <UnitConverterTool />
      </div>
    </div>
  );
}
