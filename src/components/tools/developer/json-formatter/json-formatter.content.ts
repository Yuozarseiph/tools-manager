// app/tools/(developer)/json-formatter/json-formatter.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const jsonFormatterContent = {
  fa: {
    id: "json-formatter",
    category: "developer",
    title: "فرمت و مصورسازی JSON",
    description: "JSON خود را مرتب، فشرده و به صورت گراف درختی مشاهده کنید.",
    features: [
      "زیباسازی (Prettify) ساختار JSON با تورفتگی مناسب",
      "فشرده‌سازی (Minify) برای کاهش حجم",
      "آپلود و دانلود راحت فایل JSON",
      "نمایش گراف درختی ساختار JSON"
    ],
    ui: {
      upload: {
        button: "آپلود فایل JSON",
        sizeHintPrefix: "حجم ورودی:"
      },
      toolbar: {
        minify: "فشرده‌سازی JSON",
        prettify: "زیباسازی JSON",
        clear: "حذف ورودی"
      },
      input: {
        placeholder: "کد JSON را اینجا پیست یا تایپ کنید..."
      },
      error: {
        prefix: "خطا در پردازش JSON: "
      },
      tabs: {
        code: "کد",
        graph: "گراف"
      },
      output: {
        copyTitle: "کپی خروجی JSON",
        downloadTitle: "دانلود JSON قالب‌بندی‌شده"
      },
      codeView: {
        placeholder: "{\n  \"مثال\": \"خروجی JSON شما اینجا نمایش داده می‌شود\"\n}"
      },
      graphView: {
        emptyText: "برای مشاهده گراف، یک JSON معتبر وارد کنید."
      },
      page: {
        title: "فرمت و مصورسازی JSON",
        description: "با این ابزار می‌توانید JSON را مرتب، فشرده و به صورت گراف درختی مشاهده کنید."
      }
    }
  },
  en: {
    id: "json-formatter",
    category: "developer",
    title: "JSON formatter & visualizer",
    description: "Prettify, minify and visualize your JSON as a tree graph.",
    features: [
      "Prettify JSON with proper indentation",
      "Minify JSON to reduce size",
      "Upload and download JSON files easily",
      "Visualize JSON structure as a graph"
    ],
    ui: {
      upload: {
        button: "Upload JSON file",
        sizeHintPrefix: "Input size:"
      },
      toolbar: {
        minify: "Minify JSON",
        prettify: "Prettify JSON",
        clear: "Clear input"
      },
      input: {
        placeholder: "Paste or type your JSON here..."
      },
      error: {
        prefix: "Error while parsing JSON: "
      },
      tabs: {
        code: "Code",
        graph: "Graph"
      },
      output: {
        copyTitle: "Copy formatted JSON",
        downloadTitle: "Download formatted JSON"
      },
      codeView: {
        placeholder: "{\n  \"example\": \"Your formatted JSON will appear here\"\n}"
      },
      graphView: {
        emptyText: "Enter a valid JSON to see the graph visualization."
      },
      page: {
        title: "JSON formatter & visualizer",
        description: "Format, compress and visualize JSON in your browser."
      }
    }
  }
};

export type JsonFormatterToolContent = typeof jsonFormatterContent.fa;

export function useJsonFormatterContent() {
  const { locale } = useLanguage();
  return jsonFormatterContent[locale];
}
