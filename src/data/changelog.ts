// data/changelog.ts
import { Sparkles, Wrench, Bug } from "lucide-react";

export type ChangelogCategory = "added" | "improved" | "fixed";
export type ChangelogType = "release" | "update" | "fix";

export type ChangelogEntry = {
  version: string;
  date: string;
  type: ChangelogType;
  changes: {
    category: ChangelogCategory;
    items: string[];
  }[];
};

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "1.3.1 BETA",
    date: "14 آذر 1404",
    type: "update",
    changes: [
      {
        category: "added",
        items: [
          "اضافه شدن ویرایشگر صوت (Audio Editor) با امکان برش صدا و خروجی WAV",
          "قابلیت Fade In و Fade Out برای نرم‌تر شدن شروع و پایان صدا",
          "صفحه تاریخچه تغییرات (Changelog) برای مشاهده آپدیت‌های نسخه‌ها"
        ]
      },
      {
        category: "improved",
        items: [
          "بهبود طراحی و توضیحات مستندات ابزارها در صفحه Docs",
          "بهینه‌سازی نمایش کارت ابزارها در موبایل و تبلت",
          "هماهنگ‌سازی رنگ‌بندی ابزار جدید صوت با تم روشن و تیره"
        ]
      },
      {
        category: "fixed",
        items: [
          "رفع چند باگ جزئی در ابزار تبدیل Word به PDF هنگام استفاده از فونت‌های فارسی",
          "رفع مشکل رندر برخی آیکون‌ها در مرورگرهای قدیمی‌تر",
          "بهبود مدیریت خطا در زمان بارگذاری فایل‌های بسیار بزرگ در ابزارهای PDF و تصویر"
        ]
      }
    ]
  },
  {
    version: "1.3.0 BETA",
    date: "14 آذر 1404",
    type: "update",
    changes: [
      {
        category: "added",
        items: [
          "Color Picker با قابلیت استخراج پالت رنگی",
          "Code Visualizer برای JavaScript و C#",
          "Text to PDF با پشتیبانی کامل از فونت فارسی",
          "Image Compressor با فشرده‌سازی بهینه",
          "25+ ابزار کاربردی در دسته‌های مختلف"
        ]
      },
      {
        category: "improved",
        items: [
          "بهبود عملکرد کلی سایت",
          "طراحی رابط کاربری مدرن‌تر",
          "پشتیبانی کامل از حالت تاریک",
          "بهینه‌سازی برای موبایل"
        ]
      },
      {
        category: "fixed",
        items: [
          "رفع مشکلات سازگاری با مرورگرهای مختلف",
          "بهبود پردازش فایل‌های بزرگ"
        ]
      }
    ]
  }
];
