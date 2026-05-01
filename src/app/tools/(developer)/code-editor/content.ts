// app/tools/(developer)/code-editor/content.ts

import { useLanguage } from "@/context/LanguageContext";

export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const codeEditorContent = {
  fa: {
    page: {
      title: "ویرایشگر کد آنلاین (Code Editor)",
      description:
        "ویرایشگر کد حرفه‌ای با Monaco Editor، پشتیبانی از HTML/CSS/JS/TS، پوشه‌بندی، AutoSave و ذخیره در مرورگر.",
    },
    seo: {
      title: "ویرایشگر کد آنلاین | Code Editor | Tools Manager",
      description:
        "ویرایشگر کد آنلاین با Monaco Editor. پشتیبانی از HTML، CSS، JavaScript، TypeScript و Python. ذخیره خودکار، پوشه‌بندی، export و import پروژه.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/code-editor",
      applicationCategory: "DeveloperApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "Online Code Editor",
      description:
        "Professional code editor with Monaco Editor, HTML/CSS/JS/TS support, folder management, AutoSave and browser storage.",
    },
    seo: {
      title: "Online Code Editor | Tools Manager",
      description:
        "Online code editor powered by Monaco Editor. Supports HTML, CSS, JavaScript, TypeScript and Python. Auto-save, folders, export and import projects.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/code-editor",
      applicationCategory: "DeveloperApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type CodeEditorContent = typeof codeEditorContent.fa;

export function useCodeEditorContent() {
  const { locale } = useLanguage();
  return codeEditorContent[locale];
}

export function useCodeEditorPageContent() {
  const content = useCodeEditorContent();
  return content.page;
}

export function getCodeEditorSeo(locale: "fa" | "en"): SeoContent {
  return codeEditorContent[locale].seo;
}
