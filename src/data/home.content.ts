// content/home.content.ts

export const homeContent = {
  fa: {
    hero: {
      titleLine1: "ابزارهای کاربردی،",
      titleHighlight: "سریع، امن و همیشه رایگان",
      subtitle:
        "تمام پردازش‌ها در مرورگر شما انجام می‌شود. فایل‌های شما هرگز آپلود نمی‌شوند و حریم خصوصی شما ۱۰۰٪ تضمین شده است.",
    },
  } as const,

  en: {
    hero: {
      titleLine1: "Powerful tools,",
      titleHighlight: "fast, secure and always free",
      subtitle:
        "All processing happens in your browser. Your files are never uploaded and your privacy is 100% protected.",
    },
  } as const,
};

// تایپ خودکار
export type HomeContent = typeof homeContent.fa;
