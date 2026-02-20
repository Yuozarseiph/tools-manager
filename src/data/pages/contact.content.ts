// data/pages/contact.content.ts

export const contactContent = {
  fa: {
    back: "بازگشت به خانه",
    hero: {
      title: "تماس با ما 👋",
      lead: "اگر درباره این پروژه سوال، پیشنهاد یا گزارشی دارید، خوشحال می‌شویم از طریق این صفحه با ما در ارتباط باشید.",
    },
    supportEmail: {
      title: "ایمیل پشتیبانی پروژه",
      value: "Yousefshakerdev@gmail.com",
    },
    helpBox: {
      title: "در چه مواردی می‌توانید با ما تماس بگیرید؟",
      items: {
        cooperation: "پیشنهاد همکاری یا پروژه مرتبط با این ابزار",
        feature: "پیشنهاد بهبود یا درخواست قابلیت جدید برای پروژه",
        bug: "گزارش باگ یا مشکل فنی در ابزارها",
      },
      footer:
        "برای تمام موارد بالا می‌توانید از فرم تماس استفاده کنید یا مستقیماً ایمیل بزنید.",
    },
    social: {
      title: "راه‌های ارتباطی",
    },
    form: {
      title: "فرم تماس پروژه",
      nameLabel: "نام",
      emailLabel: "ایمیل",
      messageLabel: "پیام",
      namePlaceholder: "نام خود را وارد کنید",
      emailPlaceholder: "example@mail.com",
      messagePlaceholder: "پیام، پیشنهاد یا گزارش خود را بنویسید...",
      sending: "در حال ارسال...",
      send: "ارسال پیام",
      error: "ارسال پیام با مشکل مواجه شد. لطفاً دوباره تلاش کنید.",
      successTitle: "پیام شما دریافت شد",
      successBody: "ممنون از پیام شما. پس از بررسی، پاسخ داده خواهد شد.",
      newMessage: "ارسال پیام جدید",
    },
  } as const,

  en: {
    back: "Back to home",
    hero: {
      title: "Contact us 👋",
      lead: "If you have questions, suggestions, or reports related to this project, feel free to reach out using this page.",
    },
    supportEmail: {
      title: "Project support email",
      value: "Yousefshakerdev@gmail.com",
    },
    helpBox: {
      title: "How can you contact us?",
      items: {
        cooperation: "Project‑related collaboration or partnership",
        feature: "Suggest improvements or request new features",
        bug: "Report bugs or technical issues in the tools",
      },
      footer:
        "You can use the contact form or send an email directly for any of the above.",
    },
    social: {
      title: "Contact channels",
    },
    form: {
      title: "Project contact form",
      nameLabel: "Name",
      emailLabel: "Email",
      messageLabel: "Message",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "example@mail.com",
      messagePlaceholder: "Write your message, suggestion, or bug report…",
      sending: "Sending...",
      send: "Send message",
      error: "Failed to send the message. Please try again.",
      successTitle: "Message received",
      successBody:
        "Thank you for contacting us. We will review your message and respond if needed.",
      newMessage: "Send another message",
    },
  } as const,
};

export type ContactContent = typeof contactContent.fa;
