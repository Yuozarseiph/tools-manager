import { useLanguage } from "@/context/LanguageContext";

export const qrGeneratorContent = {
  fa: {
    contentTypes: {
      title: "محتوای QR Code",
      link: "لینک",
      text: "متن",
      wifi: "وای‌فای",
      email: "ایمیل",
    },
    inputs: {
      link: {
        label: "آدرس URL",
        placeholder: "https://toolsmanager.yuozarseiph.top",
      },
      text: {
        label: "متن",
        placeholder: "متن خود را وارد کنید...",
      },
      wifi: {
        ssid: {
          label: "نام شبکه (SSID)",
          placeholder: "My WiFi",
        },
        password: {
          label: "رمز عبور",
          placeholder: "password123",
        },
        encryption: {
          label: "نوع رمزنگاری",
          wpa: "WPA/WPA2",
          wep: "WEP",
          nopass: "بدون رمز",
        },
      },
      email: {
        address: {
          label: "آدرس ایمیل",
          placeholder: "example@gmail.com",
        },
        subject: {
          label: "موضوع",
          placeholder: "موضوع ایمیل",
        },
        body: {
          label: "متن پیام",
          placeholder: "متن پیام...",
        },
      },
    },
    styling: {
      title: "استایل و رنگ‌بندی",
      fgColor: "رنگ کــد",
      bgColor: "رنگ پس‌زمینه",
      quietZone: {
        label: "حاشیه امن (Quiet Zone)",
        unit: "px",
        hint: "نکته: برای اسکن بهتر، حاشیه را حداقل روی ۲۰ تنظیم کنید.",
      },
      size: {
        label: "اندازه خروجی",
        unit: "px",
      },
      dotStyle: {
        label: "طرح نقاط",
        square: "مربع",
        dots: "نقطه",
        rounded: "گرد",
        classy: "کلاسیک",
        extraRounded: "فوق گرد",
      },
      cornerStyle: {
        label: "مدل گوشه‌ها",
        square: "مربع",
        dot: "نقطه",
        extraRounded: "فوق گرد",
      },
    },
    logo: {
      title: "تنظیم لوگو",
      selectButton: "انتخاب فایل",
      removeButton: "حذف لوگو",
      hint: "فرمت‌های JPG، PNG و SVG (حداکثر ۲ مگابایت)",
      sizeLabel: "اندازه لوگو",
      sizeUnit: "%",
      errorSize: "حجم فایل نباید بیشتر از 2 مگابایت باشد",
    },
    preview: {
      title: "پیش‌نمایش نهایی",
      note: "تمامی کدهای تولید شده ۱۰۰٪ اسکن‌پذیر و استاندارد هستند.",
    },
    buttons: {
      downloadPng: "دانلود PNG",
      downloadSvg: "دانلود SVG",
    },
    tips: {
      title: "نکات مهم",
      tip1: "برای اسکن بهتر، حاشیه امن را حداقل 20 پیکسل قرار دهید",
      tip2: "کنتراست بالا بین رنگ کد و پس‌زمینه را حفظ کنید",
      tip3: "اندازه لوگو را بیش از 30% نکنید تا خوانایی حفظ شود",
      tip4: "برای چاپ، از فرمت SVG استفاده کنید",
    },
  },
  en: {
    contentTypes: {
      title: "QR Code Content",
      link: "Link",
      text: "Text",
      wifi: "WiFi",
      email: "Email",
    },
    inputs: {
      link: {
        label: "URL Address",
        placeholder: "https://toolsmanager.yuozarseiph.top",
      },
      text: {
        label: "Text",
        placeholder: "Enter your text...",
      },
      wifi: {
        ssid: {
          label: "Network Name (SSID)",
          placeholder: "My WiFi",
        },
        password: {
          label: "Password",
          placeholder: "password123",
        },
        encryption: {
          label: "Encryption Type",
          wpa: "WPA/WPA2",
          wep: "WEP",
          nopass: "No Password",
        },
      },
      email: {
        address: {
          label: "Email Address",
          placeholder: "example@gmail.com",
        },
        subject: {
          label: "Subject",
          placeholder: "Email subject",
        },
        body: {
          label: "Message",
          placeholder: "Message text...",
        },
      },
    },
    styling: {
      title: "Style & Colors",
      fgColor: "Code Color",
      bgColor: "Background Color",
      quietZone: {
        label: "Quiet Zone",
        unit: "px",
        hint: "Note: For better scanning, set margin to at least 20.",
      },
      size: {
        label: "Output Size",
        unit: "px",
      },
      dotStyle: {
        label: "Dot Style",
        square: "Square",
        dots: "Dots",
        rounded: "Rounded",
        classy: "Classy",
        extraRounded: "Extra Rounded",
      },
      cornerStyle: {
        label: "Corner Style",
        square: "Square",
        dot: "Dot",
        extraRounded: "Extra Rounded",
      },
    },
    logo: {
      title: "Logo Settings",
      selectButton: "Select File",
      removeButton: "Remove Logo",
      hint: "JPG, PNG and SVG formats (max 2MB)",
      sizeLabel: "Logo Size",
      sizeUnit: "%",
      errorSize: "File size must not exceed 2 megabytes",
    },
    preview: {
      title: "Final Preview",
      note: "All generated codes are 100% scannable and standard.",
    },
    buttons: {
      downloadPng: "Download PNG",
      downloadSvg: "Download SVG",
    },
    tips: {
      title: "Important Tips",
      tip1: "For better scanning, set quiet zone to at least 20 pixels",
      tip2: "Maintain high contrast between code color and background",
      tip3: "Don't make logo larger than 30% to preserve readability",
      tip4: "Use SVG format for printing",
    },
  },
};

export type QrGeneratorContent = typeof qrGeneratorContent.fa;

export function useQrGeneratorContent() {
  const { locale } = useLanguage();
  return qrGeneratorContent[locale];
}
