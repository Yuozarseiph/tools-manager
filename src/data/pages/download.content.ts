export const downloadContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "دانلود QodeForge",
      lead: "نسخه مناسب دستگاه خود را انتخاب کنید. نسخه وب بدون نصب در دسترس است و نسخه Windows را می‌توانید به‌صورت Setup یا Portable دریافت کنید.",
      badge: "نسخه وب: 26.4.1",
    },

    cards: {
      pwa: {
        title: "نسخه وب و PWA",
        desc: "مستقیماً در مرورگر اجرا می‌شود و در مرورگرهای پشتیبانی‌شده می‌توانید آن را مانند یک برنامه روی دستگاه نصب کنید.",
        cta: "باز کردن QodeForge",
        hint: "برای نصب PWA از گزینه Install یا Add to Home Screen مرورگر استفاده کنید.",
        version: "26.4.1",
      },

      windows: {
        title: "Windows",
        desc: "نسخه Setup برای نصب معمولی و نسخه Portable برای اجرا بدون نصب در دسترس است.",
        setupCta: "دانلود Setup",
        portableCta: "دانلود Portable",
        hint: "لینک‌های فعلی Windows مربوط به آخرین بیلد منتشرشده دسکتاپ هستند.",
        version: "26.3.1",
      },

      android: {
        title: "Android",
        desc: "نسخه اختصاصی Android در حال آماده‌سازی است.",
        cta: "به‌زودی",
        version: "در راه",
      },

      linux: {
        title: "Linux",
        desc: "نسخه اختصاصی Linux در نسخه‌های آینده منتشر خواهد شد.",
        cta: "به‌زودی",
        version: "در راه",
      },
    },

    notes: {
      title: "قبل از دانلود",
      items: {
        verify: "فایل‌های برنامه را فقط از منابع رسمی QodeForge دریافت کنید.",
        windows:
          "نسخه Windows فعلی ممکن است از نسخه وب جدیدتر یا قدیمی‌تر باشد؛ شماره نسخه هر کارت را بررسی کنید.",
        pwa: "نسخه وب برای استفاده روزمره نیازی به دانلود فایل اجرایی ندارد.",
      },
    },
  } as const,

  en: {
    back: "Back to home",
    hero: {
      title: "Download QodeForge",
      lead: "Choose the version that fits your device. The web app works without installation, while Windows is available as both Setup and Portable builds.",
      badge: "Web version: 26.4.1",
    },

    cards: {
      pwa: {
        title: "Web app & PWA",
        desc: "Runs directly in your browser and can be installed like an app on supported browsers and devices.",
        cta: "Open QodeForge",
        hint: "Use your browser's Install or Add to Home Screen option to install the PWA.",
        version: "26.4.1",
      },

      windows: {
        title: "Windows",
        desc: "Use Setup for a regular installation or Portable to run QodeForge without installing it.",
        setupCta: "Download Setup",
        portableCta: "Download Portable",
        hint: "The current Windows links point to the latest published desktop build.",
        version: "26.3.1",
      },

      android: {
        title: "Android",
        desc: "A dedicated Android build is in development.",
        cta: "Coming soon",
        version: "Planned",
      },

      linux: {
        title: "Linux",
        desc: "A dedicated Linux build is planned for a future release.",
        cta: "Coming soon",
        version: "Planned",
      },
    },

    notes: {
      title: "Before downloading",
      items: {
        verify:
          "Only download application files from official QodeForge sources.",
        windows:
          "The Windows build may not always match the web version; check the version shown on each card.",
        pwa: "The web version does not require an executable download for everyday use.",
      },
    },
  } as const,
};

export type DownloadContent = typeof downloadContent.fa;
