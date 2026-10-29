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
        "محیط برنامه‌نویسی شبیه VS Code با CodeMirror، تب‌های چندفایلی، جست‌وجوی پروژه، میانبرها، ذخیره خودکار محلی و امکان باز کردن پوشه در مرورگرهای سازگار.",
    },
    seo: {
      title: "ویرایشگر کد آنلاین | Code Editor | QodeForge",
      description:
        "ویرایشگر کد با CodeMirror، تب‌های چندفایلی، جست‌وجوی پروژه، دسترسی سریع Ctrl+P، هایلایت زبان‌های رایج، ذخیره محلی و خروجی فایل.",
      canonical: "https://qodeforge.ir/tools/code-editor",
      applicationCategory: "DeveloperApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "Online Code Editor",
      description:
        "VS Code-inspired code workspace powered by CodeMirror, with multi-file tabs, project search, shortcuts, local autosave and browser-supported folder access.",
    },
    seo: {
      title: "Online Code Editor | QodeForge",
      description:
        "CodeMirror-powered web editor with file tabs, project search, Ctrl+P quick open, syntax highlighting, local autosave, import and export.",
      canonical: "https://qodeforge.ir/tools/code-editor",
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

