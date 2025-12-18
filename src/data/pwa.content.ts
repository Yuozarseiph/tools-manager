// data/pwa.content.ts

export const pwaContent = {
  fa: {
    install: {
      cta: "نصب اپلیکیشن",
      installing: "در حال نصب...",
      helper: "برای دسترسی سریع‌تر، اپ را روی دستگاه خود نصب کنید.",
    },
  } as const,

  en: {
    install: {
      cta: "Install app",
      installing: "Installing...",
      helper: "Install the app for faster access from your device.",
    },
  } as const,
};

export type PwaContent = typeof pwaContent.fa;
