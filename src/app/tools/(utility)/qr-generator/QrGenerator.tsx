"use client";

import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import QrGeneratorTool from "@/components/tools/QrGeneratorTool";
import {
  useToolContent,
  type QrGeneratorToolContent,
} from "@/hooks/useToolContent";
import { useLanguage } from "@/context/LanguageContext";

export default function QrGeneratorPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();
  const content =
    useToolContent<QrGeneratorToolContent>("qr-generator");

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {t("docs.back")}
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <QrCode size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>
            {content.ui.page.title}
          </h1>
        </div>

        <p
          className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}
        >
          {content.ui.page.description}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 w-full flex-1">
        <QrGeneratorTool />
      </div>
    </div>
  );
}
