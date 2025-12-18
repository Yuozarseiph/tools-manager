// data/pages/contact.content.ts

export const contactContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "تماس با ما 👋",
      lead: "ما همیشه آماده شنیدن نظرات شما هستیم. چه پیشنهادی برای بهتر شدن داشته باشید و چه بخواهید مشکلی را گزارش کنید، در خدمتیم.",
    },
    supportEmail: {
      title: "ایمیل پشتیبانی",
      value: "Yousefshakerdev@gmail.com",
    },
    helpBox: {
      title: "چطور می‌توانیم کمک کنیم؟",
      items: {
        cooperation: "پیشنهاد همکاری و پروژه مشترک",
        feature: "درخواست ویژگی یا ابزار جدید",
        bug: "گزارش باگ و مشکلات فنی سایت",
      },
      footer:
        "برای همه موارد بالا می‌توانید از فرم مقابل استفاده کنید یا مستقیماً ایمیل بزنید.",
    },
    social: {
      title: "شبکه‌های اجتماعی من",
    },
    form: {
      title: "فرم تماس",
      nameLabel: "نام شما",
      emailLabel: "ایمیل",
      messageLabel: "متن پیام",
      namePlaceholder: "نام خود را وارد کنید",
      emailPlaceholder: "example@mail.com",
      messagePlaceholder: "توضیحات، درخواست یا گزارش خود را بنویسید...",
      sending: "در حال ارسال...",
      send: "ارسال پیام",
      error: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      successTitle: "پیام شما دریافت شد!",
      successBody: "ممنون از ارتباطت. به زودی پاسخ می‌دم.",
      newMessage: "ارسال پیام جدید",
    },
  } as const,

  en: {
    back: "Back to home",
    hero: {
      title: "Contact us 👋",
      lead: "We are always happy to hear from you. Whether you have suggestions for improvements or want to report an issue, we are here to help.",
    },
    supportEmail: {
      title: "Support email",
      value: "Yousefshakerdev@gmail.com",
    },
    helpBox: {
      title: "How can we help?",
      items: {
        cooperation: "Collaboration and joint projects",
        feature: "Request a new feature or tool",
        bug: "Report bugs or technical issues",
      },
      footer:
        "For all of the above you can use the form or send an email directly.",
    },
    social: {
      title: "My social profiles",
    },
    form: {
      title: "Contact form",
      nameLabel: "Your name",
      emailLabel: "Email",
      messageLabel: "Message",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "example@mail.com",
      messagePlaceholder: "Write your request, suggestion or bug report…",
      sending: "Sending...",
      send: "Send message",
      error: "Something went wrong. Please try again.",
      successTitle: "Your message has been received!",
      successBody: "Thanks for reaching out. You'll get a reply soon.",
      newMessage: "Send another message",
    },
  } as const,
};

export type ContactContent = typeof contactContent.fa;
