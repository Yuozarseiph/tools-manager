// data/pages/privacy.content.ts

export const privacyContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "سیاست حفظ حریم خصوصی",
      lead: "در کد فورج (QodeForge)، حفاظت از حریم خصوصی شما یک قابلیت اضافی نیست؛ بلکه اصل بنیادین طراحی این پلتفرم است. ما متعهد به شفافیت کامل در نحوه برخورد با داده‌ها هستیم.",
      lastUpdated: "آخرین بروزرسانی: ۲۱ مهر ۱۴۰۵",
    },
    principle1: {
      title: "اصل شماره یک: پردازش محلی و بدون سرور",
      intro:
        "کد فورج هیچ سرور بک‌اند (Back-end) برای پردازش، ذخیره یا تحلیل فایل‌های کاربران ندارد. برخلاف بسیاری از سرویس‌های آنلاین که اطلاعات کاربران را به سرورهای خود منتقل می‌کنند، در اینجا:",
      points: {
        noUpload: "فایل‌های شما هرگز آپلود نمی‌شوند",
        noLeaveDevice: "استثناهای شبکه: بررسی IP، دریافت فایل از URL، بارگذاری مدل‌ها و فرم تماس",
        allInBrowser: "پردازش فایل‌های انتخاب‌شده در مرورگر انجام می‌شود",
        onlyCpuRam: "فقط از CPU و RAM شما استفاده می‌شود",
      },
    },
    noData: {
      files: {
        title: "هیچ فایلی ذخیره نمی‌شود",
        body: "QodeForge فایل‌های انتخاب‌شده برای پردازش محلی را روی سرور خود ذخیره نمی‌کند. فایل‌ها تا زمان نیاز در حافظه مرورگر باقی می‌مانند؛ زمان آزادسازی حافظه را مرورگر تعیین می‌کند. فایل‌های ویرایشگر کد و تراکنش‌های مدیریت هزینه در Local Storage ذخیره می‌شوند و با پاک‌سازی داده‌های مرورگر قابل حذف‌اند.",
      },
      account: {
        title: "هیچ حساب کاربری وجود ندارد",
        intro: "برای استفاده از ابزارهای ما:",
        bullets: {
          noSignup: "ثبت‌نام لازم نیست",
          noEmail: "ایمیل درخواست نمی‌شود",
          noPassword: "رمز عبور وجود ندارد",
        },
        anonymous: "برای ابزارهای محلی حساب کاربری لازم نیست. میزبان سایت و سرویس‌های خارجی می‌توانند IP درخواست‌های شبکه را دریافت کنند.",
      },
    },
    cookies: {
      title: "کوکی‌ها و Local Storage",
      noTrackingTitle: "عدم استفاده از کوکی‌های ردیاب",
      noTrackingBody:
        "کد برنامه برای ابزارهای محلی کوکی ردیابی تنظیم نمی‌کند. بررسی IP از سرویس‌های خارجی استفاده می‌کند؛ فرم تماس پیام و اطلاعات واردشده را از طریق EmailJS ارسال می‌کند. این سرویس‌ها سیاست حریم خصوصی خود را دارند.",
      localTitle: "استفاده محدود از Local Storage",
      localIntro:
        "تنظیمات ظاهری، زبان، پین‌ها، فایل‌های ویرایشگر کد و تراکنش‌های مدیریت هزینه در مرورگر ذخیره می‌شوند:",
      themeTitle: "انتخاب تم (Theme)",
      themeBody:
        "برای حفظ تجربه کاربری بهتر، تم، زبان و تنظیمات ابزارهای انتخابی شما در حافظه مرورگر ذخیره می‌شوند تا در مراجعه‌های بعدی همان تجربه نمایش داده شود. این داده‌ها اطلاعات شخصی نیستند و به هیچ سروری ارسال نمی‌شوند.",
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
      lead: "At QodeForge, privacy is not an optional feature; it is a core design principle. We are fully committed to being transparent about how we handle data.",
      lastUpdated: "Last updated: October 13, 2026",
    },
    principle1: {
      title: "Principle #1: Local, serverless processing",
      intro:
        "QodeForge has no backend servers for processing, storing or analyzing user files. Unlike many online services that send your data to their servers, here:",
      points: {
        noUpload: "Your files are never uploaded",
        noLeaveDevice: "Network exceptions: IP lookup, URL imports, model downloads and the contact form",
        allInBrowser: "Selected files are processed in your browser",
        onlyCpuRam: "Only your CPU and RAM are used",
      },
    },
    noData: {
      files: {
        title: "No files are stored",
        body: "QodeForge does not store files selected for local processing on its server. Files remain in browser memory while needed; the browser controls memory cleanup. Code editor files and expense-manager transactions are saved in local storage and can be deleted by clearing browser data.",
      },
      account: {
        title: "No user accounts",
        intro: "To use our tools:",
        bullets: {
          noSignup: "No registration required",
          noEmail: "No email requested",
          noPassword: "No passwords",
        },
        anonymous: "Local tools do not require an account. The site host and external services can receive the IP address of network requests.",
      },
    },
    cookies: {
      title: "Cookies and local storage",
      noTrackingTitle: "No tracking cookies",
      noTrackingBody:
        "The application code does not set tracking cookies for local tools. IP lookup uses external services; the contact form sends the entered message and contact details through EmailJS. Those services have their own privacy policies.",
      localTitle: "Limited use of local storage",
      localIntro:
        "Appearance, language, pins, code editor files and expense-manager transactions are stored locally in the browser:",
      themeTitle: "Theme selection",
      themeBody:
        "To provide a better experience, your selected theme, language and tool preferences are stored in the browser so the same experience is used next time. This is not personal data and is never sent to any server.",
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
