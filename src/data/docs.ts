// data/docs.ts
import {
  Code2,
  FileJson,
  FileType,
  Image,
  MonitorSmartphone,
  Calendar,
  QrCode,
  FileSpreadsheet,
  FileText,
  Hash,
  KeyRound,
  Ruler,
  Type,
  Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DocSectionItem } from "@/types/docs";
import type { Locale } from "@/context/LanguageContext";

// ---------- Types ----------

export type DocCategoryKey =
  | "developer"
  | "excel"
  | "image"
  | "pdf"
  | "security"
  | "system"
  | "utility"
  | "audio";

type DocFromJson = Omit<DocSectionItem, "icon" | "category"> & {
  category: DocCategoryKey;
};

// ---------- Icon map ----------

const FALLBACK_ICON: LucideIcon = FileType;

const ICONS_BY_ID: Record<string, LucideIcon> = {
  // Developer
  base64: Code2,
  "json-formatter": FileJson,
  "code-visualizer": FileType,
  // دقت کن id داخل json هم "markdown" باشد، نه چیز دیگر
  markdown: FileType,

  // Excel
  "excel-chart": FileSpreadsheet,
  "excel-editor": FileSpreadsheet,

  // Image
  "image-compressor": Image,
  "color-picker": Image,

  // PDF
  "pdf-merge": FileText,
  "word-to-pdf": FileText,

  // Security
  "password-generator": KeyRound,
  "hash-generator": Hash,

  // System
  "ip-checker": MonitorSmartphone,
  "user-agent": MonitorSmartphone,

  // Utility
  "qr-generator": QrCode,
  "unit-converter": Ruler,
  "date-converter": Calendar,
  "word-counter": Type,

  // Audio
  "audio-editor": Sparkles
};

// ---------- Content imports (FA) ----------

import base64Fa from "./docs/tools/fa/base64.fa.json";
import jsonFormatterFa from "./docs/tools/fa/json-formatter.fa.json";
import codeVisualizerFa from "./docs/tools/fa/code-visualizer.fa.json";
import markdownFa from "./docs/tools/fa/markdown.fa.json";

import excelChartFa from "./docs/tools/fa/excel-chart.fa.json";
import excelEditorFa from "./docs/tools/fa/excel-editor.fa.json";

import imageCompressorFa from "./docs/tools/fa/image-compressor.fa.json";
import colorPickerFa from "./docs/tools/fa/color-picker.fa.json";

import pdfMergeFa from "./docs/tools/fa/pdf-merge.fa.json";
import wordToPdfFa from "./docs/tools/fa/word-to-pdf.fa.json";

import passwordGeneratorFa from "./docs/tools/fa/password-generator.fa.json";
import hashGeneratorFa from "./docs/tools/fa/hash-generator.fa.json";

import ipCheckerFa from "./docs/tools/fa/ip-checker.fa.json";
import userAgentFa from "./docs/tools/fa/user-agent.fa.json";

import qrGeneratorFa from "./docs/tools/fa/qr-generator.fa.json";
import unitConverterFa from "./docs/tools/fa/unit-converter.fa.json";
import dateConverterFa from "./docs/tools/fa/date-converter.fa.json";
import wordCounterFa from "./docs/tools/fa/word-counter.fa.json";

import audioEditorFa from "./docs/tools/fa/audio-editor.fa.json";

// ---------- Content imports (EN) ----------

import base64En from "./docs/tools/en/base64.en.json";
import jsonFormatterEn from "./docs/tools/en/json-formatter.en.json";
import codeVisualizerEn from "./docs/tools/en/code-visualizer.en.json";
import markdownEn from "./docs/tools/en/markdown.en.json";

import excelChartEn from "./docs/tools/en/excel-chart.en.json";
import excelEditorEn from "./docs/tools/en/excel-editor.en.json";

import imageCompressorEn from "./docs/tools/en/image-compressor.en.json";
import colorPickerEn from "./docs/tools/en/color-picker.en.json";

import pdfMergeEn from "./docs/tools/en/pdf-merge.en.json";
import wordToPdfEn from "./docs/tools/en/word-to-pdf.en.json";

import passwordGeneratorEn from "./docs/tools/en/password-generator.en.json";
import hashGeneratorEn from "./docs/tools/en/hash-generator.en.json";

import ipCheckerEn from "./docs/tools/en/ip-checker.en.json";
import userAgentEn from "./docs/tools/en/user-agent.en.json";

import qrGeneratorEn from "./docs/tools/en/qr-generator.en.json";
import unitConverterEn from "./docs/tools/en/unit-converter.en.json";
import dateConverterEn from "./docs/tools/en/date-converter.en.json";
import wordCounterEn from "./docs/tools/en/word-counter.en.json";

import audioEditorEn from "./docs/tools/en/audio-editor.en.json";

// ---------- Helpers ----------

function withIcons(docs: DocFromJson[]): DocSectionItem[] {
  return docs.map((doc) => {
    const icon = ICONS_BY_ID[doc.id];

    if (!icon) {
      // کمک برای دیباگ اگر دوباره آیکن کم باشد
      console.error(
        "[docs] Missing icon mapping for tool id:",
        doc.id
      );
    }

    return {
      ...doc,
      icon: icon ?? FALLBACK_ICON
    };
  });
}

const FA_DOCS_RAW: DocFromJson[] = [
  base64Fa,
  jsonFormatterFa,
  codeVisualizerFa,
  markdownFa,
  excelChartFa,
  excelEditorFa,
  imageCompressorFa,
  colorPickerFa,
  pdfMergeFa,
  wordToPdfFa,
  passwordGeneratorFa,
  hashGeneratorFa,
  ipCheckerFa,
  userAgentFa,
  qrGeneratorFa,
  unitConverterFa,
  dateConverterFa,
  wordCounterFa,
  audioEditorFa
] as DocFromJson[];

const EN_DOCS_RAW: DocFromJson[] = [
  base64En,
  jsonFormatterEn,
  codeVisualizerEn,
  markdownEn,
  excelChartEn,
  excelEditorEn,
  imageCompressorEn,
  colorPickerEn,
  pdfMergeEn,
  wordToPdfEn,
  passwordGeneratorEn,
  hashGeneratorEn,
  ipCheckerEn,
  userAgentEn,
  qrGeneratorEn,
  unitConverterEn,
  dateConverterEn,
  wordCounterEn,
  audioEditorEn
] as DocFromJson[];

// ---------- Public API ----------

export const DOCS_BY_LOCALE: Record<Locale, DocSectionItem[]> = {
  fa: withIcons(FA_DOCS_RAW),
  en: withIcons(EN_DOCS_RAW)
};

export const DOCS_DATA: DocSectionItem[] = DOCS_BY_LOCALE.fa;
export type { DocSectionItem };
