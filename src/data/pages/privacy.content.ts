// data/pages/privacy.content.ts

export const privacyContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "سیاست حفظ حریم خصوصی",
      lead: "در Tools Manager، حفاظت از حریم خصوصی شما یک قابلیت اضافی نیست؛ بلکه اصل بنیادین طراحی این پلتفرم است. ما متعهد به شفافیت کامل در نحوه برخورد با داده‌ها هستیم.",
      lastUpdated: "آخرین بروزرسانی: ۱۲ آذر ۱۴۰۴",
    },
    principle1: {
      title: "اصل شماره یک: پردازش محلی و بدون سرور",
      intro:
        "Tools Manager هیچ سرور بک‌اند (Back-end) برای پردازش، ذخیره یا تحلیل فایل‌های کاربران ندارد. برخلاف بسیاری از سرویس‌های آنلاین که اطلاعات کاربران را به سرورهای خود منتقل می‌کنند، در اینجا:",
      points: {
        noUpload: "فایل‌های شما هرگز آپلود نمی‌شوند",
        noLeaveDevice: "هیچ داده‌ای از دستگاه شما خارج نمی‌شود",
        allInBrowser: "تمام پردازش‌ها ۱۰۰٪ در مرورگر شماست",
        onlyCpuRam: "فقط از CPU و RAM شما استفاده می‌شود",
      },
    },
    noData: {
      files: {
        title: "هیچ فایلی ذخیره نمی‌شود",
        body: "فایل‌های شما (PDF، تصویر، متن و...) تنها به‌صورت موقت در حافظه رم (RAM) مرورگر پردازش شده و بلافاصله پس از پایان عملیات، از حافظه پاک می‌شوند. هیچ نسخه‌ای ذخیره، آرشیو یا منتقل نمی‌گردد.",
      },
      account: {
        title: "هیچ حساب کاربری وجود ندارد",
        intro: "برای استفاده از ابزارهای ما:",
        bullets: {
          noSignup: "ثبت‌نام لازم نیست",
          noEmail: "ایمیل درخواست نمی‌شود",
          noPassword: "رمز عبور وجود ندارد",
        },
        anonymous: "شما کاملاً ناشناس هستید.",
      },
    },
    cookies: {
      title: "کوکی‌ها و Local Storage",
      noTrackingTitle: "عدم استفاده از کوکی‌های ردیاب",
      noTrackingBody:
        "ما از کوکی‌ها برای رهگیری کاربران، تحلیل رفتار، پروفایل‌سازی یا تبلیغات استفاده نمی‌کنیم.",
      localTitle: "استفاده محدود از Local Storage",
      localIntro:
        "تنها داده‌ای که به‌صورت محلی ذخیره می‌شود مربوط به تنظیمات ظاهری سایت است:",
      themeTitle: "انتخاب تم (Theme)",
      themeBody:
        "برای حفظ تجربه کاربری بهتر، تم انتخابی شما در حافظه مرورگر ذخیره می‌شود تا در مراجعه‌های بعدی همان ظاهر نمایش داده شود. این داده اطلاعات شخصی نیست و به هیچ سروری ارسال نمی‌شود.",
    },
    security: {
      title: "امنیت داده‌ها",
      intro:
        "با توجه به عدم وجود سرور ذخیره‌سازی، معماری ما عمداً به گونه‌ای انتخاب شده تا ریسک نشت اطلاعات به صفر نزدیک شود:",
      stats: {
        db: "پایگاه داده برای نفوذ",
        info: "اطلاعات برای سرقت",
        sale: "داده برای فروش",
      },
      quote: '"اگر داده‌ای نداریم، چیزی هم فاش نمی‌شود."',
    },
    footer: {
      changesTitle: "تغییرات در سیاست حریم خصوصی",
      changesBody:
        "در صورت تغییر این سیاست، تاریخ بروزرسانی تغییر خواهد کرد و نسخه جدید در همین صفحه منتشر می‌شود. استفاده مستمر از سایت به‌منزله پذیرش آخرین نسخه است.",
      contactTitle: "تماس با ما",
      contactBody:
        "در صورت داشتن هرگونه سؤال درباره حریم خصوصی، می‌توانید از بخش تماس با ما با پشتیبانی در ارتباط باشید.",
      contactButton: "تماس با پشتیبانی",
    },
  } as const,

  en: {
    back: "Back to home",
    hero: {
      title: "Privacy policy",
      lead: "At Tools Manager, privacy is not an optional feature; it is a core design principle. We are fully committed to being transparent about how we handle data.",
      lastUpdated: "Last updated: Dec 2, 2025",
    },
    principle1: {
      title: "Principle #1: Local, serverless processing",
      intro:
        "Tools Manager has no backend servers for processing, storing or analyzing user files. Unlike many online services that send your data to their servers, here:",
      points: {
        noUpload: "Your files are never uploaded",
        noLeaveDevice: "No data leaves your device",
        allInBrowser: "All processing happens 100% in your browser",
        onlyCpuRam: "Only your CPU and RAM are used",
      },
    },
    noData: {
      files: {
        title: "No files are stored",
        body: "Your files (PDFs, images, text, etc.) are processed temporarily in browser memory (RAM) and cleared immediately after the operation finishes. No copies are stored, archived or transferred.",
      },
      account: {
        title: "No user accounts",
        intro: "To use our tools:",
        bullets: {
          noSignup: "No registration required",
          noEmail: "No email requested",
          noPassword: "No passwords",
        },
        anonymous: "You remain completely anonymous.",
      },
    },
    cookies: {
      title: "Cookies and local storage",
      noTrackingTitle: "No tracking cookies",
      noTrackingBody:
        "We do not use cookies to track users, analyze behavior, build profiles or serve ads.",
      localTitle: "Limited use of local storage",
      localIntro:
        "The only data stored locally is related to the site's appearance settings:",
      themeTitle: "Theme selection",
      themeBody:
        "To provide a better experience, your selected theme is stored in the browser so the same look is used next time. This is not personal data and is never sent to any server.",
    },
    security: {
      title: "Data security",
      intro:
        "Because there is no storage backend, the architecture is intentionally designed to push the risk of data leaks as close to zero as possible:",
      stats: {
        db: "Databases to breach",
        info: "Information to steal",
        sale: "Data to sell",
      },
      quote: '"If we have no data, nothing can be leaked."',
    },
    footer: {
      changesTitle: "Privacy policy changes",
      changesBody:
        "If this policy is updated, the date will change and the new version will be published on this page. Continued use of the site means you accept the latest version.",
      contactTitle: "Contact us",
      contactBody:
        "If you have any questions about privacy, you can reach our support via the contact page.",
      contactButton: "Contact support",
    },
  } as const,
};

export type PrivacyContent = typeof privacyContent.fa;
