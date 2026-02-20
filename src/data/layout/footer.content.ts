// data/layout/footer.content.ts

export const footerContent = {
  fa: {
    text: "توسعه‌یافته توسط تیم XenonQode.",
    year: "© {year} ToolsManager.",
    madeBy: "ساخته‌شده توسط تیم XenonQode.",
    links: {
      docs: "مستندات",
      contact: "تماس",
      privacy: "حریم خصوصی",
      team: "XenonQode",
    },
    description:
      "ToolsManager مجموعه‌ای از ابزارهای تحت وب است که برای انجام سریع و ساده‌ی کارهای روزمره طراحی شده‌اند و مستقیماً در مرورگر اجرا می‌شوند.",
  } as const,

  en: {
    text: "Developed by the XenonQode team.",
    year: "© {year} ToolsManager.",
    madeBy: "Built by the XenonQode team.",
    links: {
      docs: "Docs",
      contact: "Contact",
      privacy: "Privacy",
      team: "XenonQode",
    },
    description:
      "ToolsManager is a collection of browser‑based tools designed to handle everyday tasks quickly and efficiently.",
  } as const,
};

export type FooterContent = typeof footerContent.fa;
