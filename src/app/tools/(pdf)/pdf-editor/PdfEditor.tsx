"use client";

import PdfEditorTool from "@/components/tools/pdf/pdf-editor/PdfEditorTool";
import { useThemeColors } from "@/hooks/useThemeColors";
import { usePdfEditorPageContent } from "./content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PdfEditor() {
  const theme = useThemeColors();
  const { t } = useLanguage();

  const page = usePdfEditorPageContent();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href="/"
        className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
      >
        <ArrowRight size={16} className="ml-1" /> {t("docs.back")}
      </Link>

      <section className="space-y-3">
        <h1 className={`text-2xl md:text-3xl font-bold ${theme.text}`}>
          {page.title}
        </h1>
        <p className={`text-sm md:text-base ${theme.textMuted}`}>
          {page.description}
        </p>
      </section>

      <section className="mb-10">
        <PdfEditorTool />
      </section>

    </div>
  );
}
