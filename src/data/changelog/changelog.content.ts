// data/changelog/changelog.content.ts
import { useLanguage } from "@/context/LanguageContext";
// data/changelog/changelog.content.ts

export const changelogContent = {
  fa: {
    back: "بازگشت به صفحه اصلی",
    hero: {
      title: "سوابق تغییرات",
      subtitle:
        "آخرین به‌روزرسانی‌ها و تغییرات اصلی در ابزارهای ما را بررسی کنید.",
    },
    versionLabel: "نسخه",
    currentLabel: "آخرین نسخه",
    type: {
      release: "انتشار",
      fix: "رفع خطا",
      update: "به‌روزرسانی",
    },
    categories: {
      added: "اضافه شده",
      improved: "بهبود یافته",
      fixed: "رفع خطا",
    },
    note: "تغییرات بیشتر در مستندات و مخزن کد ما قابل مشاهده است.",
    contact: {
      question: "سوالی دارید؟",
      contact: "تماس با ما",
    },
  },
  en: {
    back: "Back to home",
    hero: {
      title: "Changelog",
      subtitle:
        "Check out the latest updates and major changes across our tools.",
    },
    versionLabel: "Version",
    currentLabel: "Latest",
    type: {
      release: "Release",
      fix: "Fix",
      update: "Update",
    },
    categories: {
      added: "Added",
      improved: "Improved",
      fixed: "Fixed",
    },
    note: "More detailed changes are available in our docs and source repo.",
    contact: {
      question: "Have a question?",
      contact: "Contact us",
    },
  },
};

export type ChangelogContent = (typeof changelogContent)["fa"];


export function useChangelogContent() {
  const { locale } = useLanguage();
  return changelogContent[locale];
}
