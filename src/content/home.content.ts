export const homeContent = {
  fa: {
    hero: {
      titleLine1: "ابزارهای کاربردی، ساده و سریع",
      titleHighlight: "همه در یک جا",
      subtitle:
        "ابزارهای روزمره برای فایل‌ها، تصویر، PDF، توسعه و بیشتر؛ با تمرکز روی سرعت، سادگی و حریم خصوصی.",
      primaryAction: "مشاهده ابزارها",
      privacyNote: "پردازش بسیاری از ابزارها مستقیماً در مرورگر انجام می‌شود.",
    },
  } as const,

  en: {
    hero: {
      titleLine1: "Useful tools, simple and fast",
      titleHighlight: "all in one place",
      subtitle:
        "Everyday tools for files, images, PDFs, development and more, focused on speed, simplicity and privacy.",
      primaryAction: "Browse tools",
      privacyNote: "Many tools process your data directly in the browser.",
    },
  } as const,
};

export type HomeContent = typeof homeContent.fa;
