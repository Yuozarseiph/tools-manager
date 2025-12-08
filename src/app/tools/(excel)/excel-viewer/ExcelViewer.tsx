"use client";

import Link from "next/link";
import { ArrowRight, FileSpreadsheet } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import ExcelViewerTool from "@/components/tools/excel-tools/excel-viewer/ExcelViewerTool";
import { useExcelViewerContent } from "./content";
import { useLanguage } from "@/context/LanguageContext";

export default function ExcelViewerPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();
  const { page, why } = useExcelViewerContent();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {t("docs.back")}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
          <div className="p-4 rounded-2xl w-fit shadow-lg shadow-green-600/20 bg-green-600">
            <FileSpreadsheet size={32} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${theme.text}`}>
              {page.title}
            </h1>
            <p
              className={`text-sm sm:text-base max-w-2xl leading-relaxed ${theme.textMuted}`}
            >
              {page.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full flex-1 mt-8">
        <ExcelViewerTool />

        <div className={`mt-12 max-w-3xl ${theme.textMuted} text-sm leading-7`}>
          <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>
            {why.title}
          </h3>
          <ul className="list-disc list-inside space-y-1 marker:text-green-500">
            {why.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
