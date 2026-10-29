// app/tools/(calculators)/bank/content.ts

import { useLanguage } from "@/context/LanguageContext";

//  Type مشترک برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const bankToolsContent = {
  fa: {
    page: {
      title: "ابزارهای بانکی و مالی",
      description:
        "محاسبه وام، سود سپرده، خرید اقساطی، پس‌انداز و قیمت لحظه‌ای سکه، طلا و ارز - همه در یک مکان.",
    },
    seo: {
      title: "ابزارهای بانکی و مالی آنلاین | QodeForge",
      description:
        "محاسبه اقساط وام، سود سپرده بانکی، خرید اقساطی، پس‌انداز و مشاهده قیمت لحظه‌ای سکه، طلا و ارز به صورت رایگان.",
      canonical: "https://qodeforge.ir/tools/bank",
      ogTitle: "ابزارهای بانکی و مالی (Bank & Financial Tools)",
      ogDescription:
        "محاسبه دقیق اقساط وام، سود سپرده، خرید اقساطی، رشد پس‌انداز و قیمت لحظه‌ای طلا و ارز - همه در یک ابزار.",
      applicationCategory: "FinanceApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Bank & Financial Tools",
      description:
        "Calculate loans, deposit interest, installment purchases, savings and live prices of gold, coins and currencies - all in one place.",
    },
    seo: {
      title: "Online Bank & Financial Tools | QodeForge",
      description:
        "Calculate loan installments, bank deposit interest, installment purchases, savings growth and view live prices of gold, coins and currencies for free.",
      canonical: "https://qodeforge.ir/tools/bank",
      ogTitle: "Bank & Financial Tools",
      ogDescription:
        "Accurately calculate loan installments, deposit interest, installment purchases, savings growth and live gold and currency prices - all in one tool.",
      applicationCategory: "FinanceApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type BankToolsContent = typeof bankToolsContent.fa;

//  Hook برای استفاده در کامپوننت Client
export function useBankToolsContent() {
  const { locale } = useLanguage();
  return bankToolsContent[locale];
}

//  Hook مخصوص page content
export function useBankToolsPageContent() {
  const content = useBankToolsContent();
  return content.page;
}

//  تابع برای دریافت SEO (برای page.tsx)
export function getBankToolsSeo(locale: "fa" | "en"): SeoContent {
  return bankToolsContent[locale].seo;
}

