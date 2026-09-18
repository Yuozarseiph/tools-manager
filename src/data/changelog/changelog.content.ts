import { useLanguage } from "@/context/LanguageContext";

export const changelogContent = {
  fa: {
    back: "بازگشت به صفحه اصلی",
    hero: {
      title: "سوابق تغییرات",
      subtitle:
        "نسخه‌ها، قابلیت‌های جدید، بهبودها و رفع خطاهای QodeForge را مرور کنید.",
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
      beta: "نسخه آزمایشی",
      note: "یادداشت",
    },
    search: {
      label: "جستجو در سوابق تغییرات",
      placeholder: "جستجوی نسخه یا تغییر...",
      clear: "پاک کردن جستجو",
      noResults: "نتیجه‌ای برای این جستجو پیدا نشد.",
      results: "نسخه پیدا شد",
    },
    release: {
      showChanges: "نمایش تغییرات",
      hideChanges: "بستن تغییرات",
    },
    note: "تاریخچه کامل نسخه‌ها در همین صفحه نگهداری می‌شود.",
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
        "Browse QodeForge releases, new features, improvements and fixes.",
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
      beta: "Beta",
      note: "Note",
    },
    search: {
      label: "Search changelog",
      placeholder: "Search versions or changes...",
      clear: "Clear search",
      noResults: "No matching changelog entries were found.",
      results: "versions found",
    },
    release: {
      showChanges: "Show changes",
      hideChanges: "Hide changes",
    },
    note: "The complete release history is kept on this page.",
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
