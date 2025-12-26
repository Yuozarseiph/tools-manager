// src/data/pages/download.content.ts
export const downloadContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "دانلود Tools Manager",
      lead: "نسخه مناسب سیستم‌عامل خود را انتخاب کنید. نسخه‌های Android و Linux به‌زودی اضافه می‌شوند.",
      badge: "آخرین نسخه: 3.0.0-Beta.0",
    },

    cards: {
      pwa: {
        title: "نسخه PWA (وب اپ)",
        desc: "بدون نصب از طریق مرورگر اجرا می‌شود و می‌توانید به Home Screen اضافه‌اش کنید.",
        cta: "باز کردن نسخه PWA",
        hint: "پیشنهاد: Chrome / Edge",
      },
      windows: {
        title: "Windows",
        desc: "دو نسخه ارائه می‌شود: Setup برای نصب عادی و Portable برای اجرا بدون نصب.",
        setupCta: "دانلود Setup",
        portableCta: "دانلود Portable",
        hint: "سازگار با ویندوز 10 و بالاتر",
      },
      android: {
        title: "Android",
        desc: "نسخه اندروید به‌زودی منتشر می‌شود.",
        cta: "به‌زودی",
      },
      linux: {
        title: "Linux",
        desc: "نسخه لینوکس به‌زودی منتشر می‌شود.",
        cta: "به‌زودی",
      },
    },

    notes: {
      title: "نکات مهم",
      items: {
        verify: "فایل‌ها را فقط از همین صفحه دانلود کنید.",
        beta: "این نسخه Beta است و ممکن است برخی بخش‌ها در حال تغییر باشند.",
        pwa: "برای نصب PWA، در مرورگر گزینه Install / Add to Home Screen را بزنید.",
      },
    },
  } as const,

  en: {
    back: "Back to home",
    hero: {
      title: "Download Tools Manager",
      lead: "Choose the right build for your platform. Android and Linux builds are coming soon.",
      badge: "Latest: 3.0.0-Beta.0",
    },

    cards: {
      pwa: {
        title: "PWA (Web App)",
        desc: "Runs in your browser and can be installed to your home screen.",
        cta: "Open PWA",
        hint: "Recommended: Chrome / Edge",
      },
      windows: {
        title: "Windows",
        desc: "Two options: Setup (installer) and Portable (no installation).",
        setupCta: "Download Setup",
        portableCta: "Download Portable",
        hint: "Compatible with Windows 10+",
      },
      android: {
        title: "Android",
        desc: "Android build will be released soon.",
        cta: "Coming soon",
      },
      linux: {
        title: "Linux",
        desc: "Linux build will be released soon.",
        cta: "Coming soon",
      },
    },

    notes: {
      title: "Notes",
      items: {
        verify: "Download files only from this page.",
        beta: "This is a beta release and features may change.",
        pwa: "To install the PWA, use Install / Add to Home Screen in your browser.",
      },
    },
  } as const,
};

export type DownloadContent = typeof downloadContent.fa;
