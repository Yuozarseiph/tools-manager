// app/tools/(calendar)/date-converter/date-converter.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const dateConverterContent = {
  fa: {
    id: "date-converter",
    category: "calendar",
    title: "تبدیل تاریخ شمسی، میلادی و قمری",
    description:
      "تاریخ را بین تقویم شمسی (جلالی)، میلادی و قمری (هجری) به‌صورت دقیق تبدیل کنید.",
    features: [
      "تبدیل شمسی به میلادی و قمری",
      "تبدیل میلادی به شمسی و قمری",
      "تبدیل قمری به شمسی و میلادی",
      "پشتیبانی از اعداد فارسی و عربی",
      "دکمه امروز برای تقویم مبدأ",
    ],
    ui: {
      labels: {
        conversionType: "نوع تبدیل",
      },
      conversions: {
        shamsiToGregorian: "شمسی به میلادی",
        gregorianToShamsi: "میلادی به شمسی",
        shamsiToHijri: "شمسی به قمری",
        hijriToShamsi: "قمری به شمسی",
        gregorianToHijri: "میلادی به قمری",
        hijriToGregorian: "قمری به میلادی",
      },
      inputs: {
        dayLabel: "روز",
        monthLabel: "ماه",
        yearLabel: "سال",
        placeholderShamsiYear: "مثلاً ۱۴۰۳",
        placeholderGregorianYear: "مثلاً ۲۰۲۴",
        placeholderHijriYear: "مثلاً ۱۴۴۵",
      },
      result: {
        title: "تاریخ تبدیل‌شده",
        invalid: "تاریخ وارد شده نامعتبر است.",
      },
    },
  },
  en: {
    id: "date-converter",
    category: "calendar",
    title: "Shamsi / Gregorian / Hijri Date Converter",
    description:
      "Accurately convert dates between Jalali (Shamsi), Gregorian, and Hijri calendars.",
    features: [
      "Convert Shamsi to Gregorian and Hijri",
      "Convert Gregorian to Shamsi and Hijri",
      "Convert Hijri to Shamsi and Gregorian",
      "Supports Persian and Arabic numerals",
      "Today button for the source calendar",
    ],
    ui: {
      labels: {
        conversionType: "Conversion type",
      },
      conversions: {
        shamsiToGregorian: "Shamsi to Gregorian",
        gregorianToShamsi: "Gregorian to Shamsi",
        shamsiToHijri: "Shamsi to Hijri",
        hijriToShamsi: "Hijri to Shamsi",
        gregorianToHijri: "Gregorian to Hijri",
        hijriToGregorian: "Hijri to Gregorian",
      },
      inputs: {
        dayLabel: "Day",
        monthLabel: "Month",
        yearLabel: "Year",
        placeholderShamsiYear: "e.g. 1403",
        placeholderGregorianYear: "e.g. 2024",
        placeholderHijriYear: "e.g. 1445",
      },
      result: {
        title: "Converted date",
        invalid: "The entered date is not valid.",
      },
    },
  },
};

export type DateConverterToolContent = typeof dateConverterContent.fa;

export function useDateConverterContent() {
  const { locale } = useLanguage();
  return dateConverterContent[locale];
}
