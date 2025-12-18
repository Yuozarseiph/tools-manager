// app/tools/(developer)/hash-generator/hash-generator.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const hashGeneratorContent = {
  fa: {
    id: "hash-generator",
    category: "developer",
    title: "تولید هش آنلاین",
    description:
      "متن خود را وارد کنید و هش آن را با الگوریتم‌های مختلف رمزنگاری مثل SHA-1 و SHA-256 محاسبه و کپی کنید.",
    features: [
      "پشتیبانی از الگوریتم‌های SHA-1، SHA-256، SHA-384 و SHA-512",
      "محاسبهٔ خودکار هش با هر تغییر در ورودی",
      "امکان کپی سریع مقدار هش در کلیپ‌بورد",
      "نمایش تمیز و خوانا با فونت مونو برای هش‌ها",
    ],
    ui: {
      input: {
        label: "متن ورودی برای تولید هش",
        placeholder: "متن یا رشتهٔ مورد نظر خود را اینجا وارد کنید...",
      },
      algorithms: {
        sha1: "SHA-1",
        sha256: "SHA-256",
        sha384: "SHA-384",
        sha512: "SHA-512",
      },
      hashRow: {
        empty: "برای مشاهده مقدار هش، ابتدا متنی را وارد کنید.",
      },
      page: {
        title: "ابزار تولید هش",
        description:
          "یک رشته وارد کنید و هش آن را با الگوریتم‌های مختلف امنیتی به‌سرعت دریافت کنید.",
      },
    },
  },
  en: {
    id: "hash-generator",
    category: "developer",
    title: "Online hash generator",
    description:
      "Enter any text and compute its hash using cryptographic algorithms like SHA‑1 and SHA‑256.",
    features: [
      "Supports SHA-1, SHA-256, SHA-384 and SHA-512 algorithms",
      "Automatically updates hashes when the input changes",
      "One‑click copy to clipboard for each hash",
      "Clean, monospace display for hash values",
    ],
    ui: {
      input: {
        label: "Input text to hash",
        placeholder: "Type or paste the text you want to hash...",
      },
      algorithms: {
        sha1: "SHA-1",
        sha256: "SHA-256",
        sha384: "SHA-384",
        sha512: "SHA-512",
      },
      hashRow: {
        empty: "Enter some text above to see its hash.",
      },
      page: {
        title: "Hash generator tool",
        description:
          "Quickly compute secure hashes for any string using several common algorithms.",
      },
    },
  },
};

export type HashGeneratorToolContent = typeof hashGeneratorContent.fa;

export function useHashGeneratorContent() {
  const { locale } = useLanguage();
  return hashGeneratorContent[locale];
}
