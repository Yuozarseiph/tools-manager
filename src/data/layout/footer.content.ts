// data/layout/footer.content.ts

export const footerContent = {
  fa: {
    text: "ساخته شده با ❤️ در قلب. © 1404 - تمام حقوق محفوظ است.",
    year: "© {year} ToolsManager.",
    madeBy: "ساخته‌شده با عشق توسط تیم YUOZARSEIPH.",
    links: {
      docs: "مستندات",
      contact: "تماس",
      privacy: "حریم خصوصی",
      team: "تیم YUOZARSEIPH",
    },
    description:
      "ToolsManager مجموعه‌ای از ابزارهای تحت وب برای کارهای روزمره توسعه‌دهندگان، تولیدکنندگان محتوا و کاربران عادی است؛ همه‌چیز به‌صورت رایگان و در مرورگر شما.",
  } as const,

  en: {
    text: "Made with ❤️ in Heart. © 2025 - All rights reserved.",
    year: "© {year} ToolsManager.",
    madeBy: "Built with care by the YUOZARSEIPH team.",
    links: {
      docs: "Docs",
      contact: "Contact",
      privacy: "Privacy",
      team: "YUOZARSEIPH Team",
    },
    description:
      "ToolsManager is a collection of browser-based tools for developers, content creators, and everyday users — fast, free, and privacy‑friendly.",
  } as const,
};

export type FooterContent = typeof footerContent.fa;
