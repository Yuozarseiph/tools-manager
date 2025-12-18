// app/tools/(developer)/markdown/markdown.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const markdownContent = {
  fa: {
    id: "markdown",
    category: "developer",
    title: "ویرایشگر و پیش‌نمایش Markdown",
    description: "متن Markdown را بنویسید و همزمان پیش‌نمایش رندر‌شده آن را ببینید.",
    features: [
      "ویرایشگر زنده Markdown",
      "پیش‌نمایش ریسپانسیو و استایل‌شده",
      "پشتیبانی از تیتر، لیست، جدول و کد",
      "امکان شروع کار با متن نمونه"
    ],
    ui: {
      editor: {
        title: "ویرایشگر Markdown",
        placeholder: "متن Markdown خود را اینجا بنویسید..."
      },
      buttons: {
        clear: "حذف متن",
        copy: "کپی متن"
      },
      preview: {
        title: "پیش‌نمایش Markdown"
      },
      demo: {
        defaultMarkdown: "# خوش آمدید 👋\n\nاین یک نمونه متن **Markdown** است.\n\n- از لیست‌ها استفاده کنید\n- کد بنویسید: `const x = 1;`\n- تیترها، جدول‌ها و لینک‌ها را تست کنید.\n\n---\n\n[لینک نمونه](https://example.com)"
      },
      page: {
        title: "ویرایشگر Markdown",
        description: "یک ویرایشگر ساده برای نوشتن و پیش‌نمایش Markdown در مرورگر شما."
      }
    }
  },
  en: {
    id: "markdown",
    category: "developer",
    title: "Markdown editor & preview",
    description: "Write Markdown and preview the rendered result side by side.",
    features: [
      "Live Markdown editor",
      "Styled, responsive preview",
      "Supports headings, lists, tables and code",
      "Start quickly with a sample document"
    ],
    ui: {
      editor: {
        title: "Markdown editor",
        placeholder: "Write your Markdown here..."
      },
      buttons: {
        clear: "Clear text",
        copy: "Copy text"
      },
      preview: {
        title: "Markdown preview"
      },
      demo: {
        defaultMarkdown: "# Welcome 👋\n\nThis is a sample **Markdown** document.\n\n- Use lists\n- Write code: `const x = 1;`\n- Try headings, tables and links.\n\n---\n\n[Sample link](https://example.com)"
      },
      page: {
        title: "Markdown editor",
        description: "A simple Markdown editor with live preview in your browser."
      }
    }
  }
};

export type MarkdownToolContent = typeof markdownContent.fa;

export function useMarkdownContent() {
  const { locale } = useLanguage();
  return markdownContent[locale];
}
