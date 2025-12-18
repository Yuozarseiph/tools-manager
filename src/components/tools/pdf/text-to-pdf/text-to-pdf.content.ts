// components/tools/pdf/text-to-pdf/text-to-pdf.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const textToPdfContent = {
  fa: {
    id: "text-to-pdf",
    category: "pdf",
    title: "تبدیل متن به PDF",
    description:
      "متن فارسی یا انگلیسی خود را با تنظیم اندازه و چینش تبدیل به فایل PDF قابل دانلود کنید.",
    features: [
      "پشتیبانی از متن‌های فارسی و انگلیسی",
      "تنظیم اندازه فونت و چینش (چپ، راست، وسط)",
      "استفاده از فونت فارسی برای نمایش بهتر متن",
      "تولید مستقیم فایل PDF در مرورگر و امکان دانلود",
    ],
    ui: {
      toolbar: {
        alignLeftTitle: "چینش متن به چپ",
        alignCenterTitle: "چینش متن به مرکز",
        alignRightTitle: "چینش متن به راست",
        generateButtonIdle: "تبدیل به PDF و دانلود",
        generateButtonLoading: "در حال ساخت فایل PDF...",
      },
      editor: {
        placeholder: "متن مورد نظر خود را اینجا بنویسید...",
        counterSuffixChars: "کاراکتر",
        counterSeparator: "در",
        counterSuffixLines: "خط",
      },
      guide: {
        title: "راهنمای استفاده از تبدیل متن به PDF",
        items: [
          "برای بهترین نمایش فارسی، از حروف و علائم استاندارد فارسی استفاده کنید.",
          "در صورت داشتن متن طولانی، بهتر است اندازه فونت را کمی کوچک‌تر انتخاب کنید.",
          "می‌توانید بعد از ساخت PDF، آن را در هر نرم‌افزار نمایش PDF باز و چاپ کنید.",
          "در هنگام ساخت PDF، از بستن صفحه مرورگر خودداری کنید.",
        ],
      },
      alerts: {
        error: "در هنگام ساخت فایل PDF مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      },
      page: {
        title: "تبدیل متن به PDF",
        description:
          "با چند کلیک، متن خود را به یک فایل PDF مرتب و قابل چاپ تبدیل کنید.",
      },
    },
  },
  en: {
    id: "text-to-pdf",
    category: "pdf",
    title: "Text to PDF converter",
    description:
      "Convert your plain text (Persian or English) into a downloadable PDF with custom font size and alignment.",
    features: [
      "Supports both Persian and English text",
      "Control font size and alignment (left, right, center)",
      "Uses a Persian‑friendly font for better rendering",
      "Generates a PDF directly in the browser for download",
    ],
    ui: {
      toolbar: {
        alignLeftTitle: "Align text to left",
        alignCenterTitle: "Align text to center",
        alignRightTitle: "Align text to right",
        generateButtonIdle: "Generate & download PDF",
        generateButtonLoading: "Generating PDF...",
      },
      editor: {
        placeholder: "Type or paste your text here...",
        counterSuffixChars: "characters",
        counterSeparator: "in",
        counterSuffixLines: "lines",
      },
      guide: {
        title: "How to use the text to PDF tool",
        items: [
          "For best Persian rendering, use standard Persian letters and punctuation.",
          "For long documents, consider using a slightly smaller font size.",
          "You can open the generated PDF in any PDF viewer and print it.",
          "Avoid closing the browser tab while the PDF is being generated.",
        ],
      },
      alerts: {
        error: "An error occurred while generating the PDF. Please try again.",
      },
      page: {
        title: "Text to PDF converter",
        description: "Quickly turn your text into a clean, printable PDF file.",
      },
    },
  },
};

export type TextToPdfToolContent = typeof textToPdfContent.fa;

export function useTextToPdfContent() {
  const { locale } = useLanguage();
  return textToPdfContent[locale];
}
