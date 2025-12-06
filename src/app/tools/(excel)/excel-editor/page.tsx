"use client";

import Link from "next/link";
import { ArrowRight, Edit3 } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import ExcelEditorTool from "@/components/tools/excel-tools/excel-editor/ExcelEditorTool";
import {
  useToolContent,
  type ExcelEditorToolContent
} from "@/hooks/useToolContent";
import { useLanguage } from "@/context/LanguageContext";

export default function ExcelEditorPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();
  const content =
    useToolContent<ExcelEditorToolContent>("excel-editor");

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" />{" "}
          {t("docs.back")}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
          <div className="p-4 rounded-2xl w-fit shadow-lg shadow-blue-600/20 bg-blue-600">
            <Edit3 size={32} className="text-white" />
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-4xl font-bold mb-2 ${theme.text}`}
            >
              {content.ui.page.title}
            </h1>
            <p
              className={`text-sm sm:text-base max-w-2xl leading-relaxed ${theme.textMuted}`}
            >
              {content.ui.page.description}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 w-full flex-1 mt-8">
        <ExcelEditorTool />
      </div>
    </div>
  );
}
