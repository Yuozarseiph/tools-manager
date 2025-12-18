// app/docs/content.ts
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
        "راهنمای کامل استفاده از ابزارهای Tools Manager، شامل توضیح قابلیت‌ها، نحوه کار و نکات حریم خصوصی هر ابزار.",
    },
    seo: {
      title: "مستندات Tools Manager | راهنمای ابزارها",
      description:
        "در این بخش می‌توانید توضیحات کامل، ویژگی‌ها و نحوه کار با ابزارهای مختلف (PDF، تصویر، اکسل، امنیت، سیستم و …) را ببینید.",
      canonical: "https://toolsmanager.yuozarseip.top/docs",
      ogTitle: "مستندات و راهنمای استفاده از ابزارهای Tools Manager",
      ogDescription:
        "قبل از استفاده از هر ابزار، صفحه مستندات آن را ببینید تا با محدودیت‌ها، نکات فنی و حریم خصوصی آن آشنا شوید.",
      applicationCategory: "Documentation",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
    ui: {
      back: "بازگشت به صفحه اصلی",
      hero: {
        title: "مستندات ابزارها",
        subtitle:
          "راهنمای استفاده از ابزارها، قابلیت‌ها، محدودیت‌ها و نکات حریم خصوصی هر ابزار را اینجا ببینید.",
        badge: "همیشه در حال بروزرسانی",
      },
      sidebar: {
        mobileTitle: "فهرست ابزارها",
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
      },
    } satisfies DocsPageUiContent,
  },

  en: {
    page: {
      title: "Tools Manager documentation",
      description:
        "Detailed guides for all Tools Manager utilities, including features, how they work and privacy notes.",
    },
    seo: {
      title: "Tools Manager docs | Tool guides",
      description:
        "Browse detailed descriptions, features and technical notes for PDF, image, Excel, security, system and other tools.",
      canonical: "https://toolsmanager.yuozarseip.top/docs",
      ogTitle: "Documentation and usage guide for Tools Manager tools",
      ogDescription:
        "Read each tool’s documentation to understand its capabilities, limitations, technical details and privacy behavior.",
      applicationCategory: "Documentation",
      inLanguage: "en-US",
    } satisfies SeoContent,
    ui: {
      back: "Back to home",
      hero: {
        title: "Tool documentation",
        subtitle:
          "Read usage guides, features, limitations, and privacy notes for each tool.",
        badge: "Continuously updated",
      },
      sidebar: {
        mobileTitle: "Tools list",
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
