// data/layout/nav.content.ts

export const HeaderContent = {
  fa: {
    docs: "مستندات",
    contact: "تماس با ما",
    about: "درباره ما",
    changelog: "تاریخچه تغییرات",
    donate: "حمایت",
    brand: {
      nameMain: "Tools",
      nameAccent: "Manager",
    },
  } as const,

  en: {
    docs: "Docs",
    contact: "Contact",
    about: "About",
    changelog: "Changelog",
    donate: "Donate",
    brand: {
      nameMain: "Tools",
      nameAccent: "Manager",
    },
  } as const,
};

export type HeaderContent = typeof HeaderContent.fa;
