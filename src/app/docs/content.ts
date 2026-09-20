import { useLanguage } from "@/context/LanguageContext";

export const DOC_CATEGORIES = [
  "pdf",
  "image",
  "developer",
  "security",
  "utility",
  "system",
  "excel",
  "audio",
  "presentation",
  "calculator",
  "banking",
  "game",
] as const;

export type DocsCategory = (typeof DOC_CATEGORIES)[number];

export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export type DocsPageUiContent = {
  back: string;
  hero: {
    title: string;
    subtitle: string;
    badge: string;
  };
  sidebar: {
    mobileTitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    noResults: string;
    openMenu: string;
    closeMenu: string;
  };
  nav: {
    prev: string;
    next: string;
  };
  footer: {
    question: string;
    contactCta: string;
  };
  categories: Record<DocsCategory, string>;
};

export const docsContent = {
  fa: {
    page: {
      title: "مستندات و راهنمای ابزارها",
      description:
        "راهنمای کامل استفاده از ابزارهای QodeForge، شامل قابلیت‌ها، نحوه کار، نکات فنی و حریم خصوصی هر ابزار.",
    },
    seo: {
      title: "مستندات QodeForge | راهنمای ابزارها",
      description:
        "راهنمای ابزارهای QodeForge برای PDF، تصویر، توسعه، اکسل، امنیت، سیستم و ابزارهای کاربردی.",
      canonical: "https://qodeforge.ir/docs",
      ogTitle: "مستندات و راهنمای ابزارهای QodeForge",
      ogDescription:
        "قابلیت‌ها، محدودیت‌ها، نحوه کار و نکات حریم خصوصی ابزارهای QodeForge را ببینید.",
      applicationCategory: "Documentation",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
    ui: {
      back: "بازگشت به صفحه اصلی",
      hero: {
        title: "مستندات ابزارها",
        subtitle:
          "راهنمای قابلیت‌ها، نحوه کار، محدودیت‌ها و حریم خصوصی ابزارهای QodeForge.",
        badge: "به‌روزرسانی مداوم",
      },
      sidebar: {
        mobileTitle: "فهرست ابزارها",
        searchPlaceholder: "جستجو در مستندات...",
        searchLabel: "جستجو در مستندات",
        noResults: "موردی پیدا نشد",
        openMenu: "باز کردن فهرست مستندات",
        closeMenu: "بستن فهرست مستندات",
      },
      nav: {
        prev: "قبلی",
        next: "بعدی",
      },
      footer: {
        question: "سوال یا پیشنهادی دارید؟",
        contactCta: "تماس با ما",
      },
      categories: {
        pdf: "PDF",
        image: "تصویر",
        developer: "توسعه‌دهنده",
        security: "امنیت",
        utility: "ابزارهای کاربردی",
        system: "سیستم",
        excel: "اکسل",
        audio: "صوت",
        presentation: "پاورپوینت",
        calculator: "محاسبات",
        banking: "بانکی و مالی",
        game: "سرگرمی",
      },
    } satisfies DocsPageUiContent,
  },

  en: {
    page: {
      title: "QodeForge documentation",
      description:
        "Detailed guides for QodeForge tools, including features, how they work, technical notes and privacy information.",
    },
    seo: {
      title: "QodeForge docs | Tool guides",
      description:
        "Browse QodeForge documentation for PDF, image, developer, Excel, security, system and utility tools.",
      canonical: "https://qodeforge.ir/docs",
      ogTitle: "QodeForge tool documentation",
      ogDescription:
        "Read capabilities, limitations, technical details and privacy information for QodeForge tools.",
      applicationCategory: "Documentation",
      inLanguage: "en-US",
    } satisfies SeoContent,
    ui: {
      back: "Back to home",
      hero: {
        title: "Tool documentation",
        subtitle:
          "Capabilities, usage details, limitations and privacy information for QodeForge tools.",
        badge: "Continuously updated",
      },
      sidebar: {
        mobileTitle: "Tools list",
        searchPlaceholder: "Search documentation...",
        searchLabel: "Search documentation",
        noResults: "No documentation found",
        openMenu: "Open documentation list",
        closeMenu: "Close documentation list",
      },
      nav: {
        prev: "Previous",
        next: "Next",
      },
      footer: {
        question: "Have a question or suggestion?",
        contactCta: "Contact us",
      },
      categories: {
        pdf: "PDF",
        image: "Image",
        developer: "Developer",
        security: "Security",
        utility: "Utility",
        system: "System",
        excel: "Excel",
        audio: "Audio",
        presentation: "PowerPoint",
        calculator: "Calculators",
        banking: "Banking & finance",
        game: "Games",
      },
    } satisfies DocsPageUiContent,
  },
} as const;

export function getDocsSeo(locale: "fa" | "en"): SeoContent {
  return docsContent[locale].seo;
}

export function useDocsPageContent() {
  const { locale } = useLanguage();
  return docsContent[locale];
}
