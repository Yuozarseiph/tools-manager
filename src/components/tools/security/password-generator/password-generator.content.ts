// app/tools/(security)/password-generator/password-generator.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const passwordGeneratorContent = {
  fa: {
    id: "password-generator",
    category: "developer",
    title: "تولید و تحلیل رمز عبور",
    description:
      "رمزهای عبور قوی و تصادفی بسازید یا قدرت رمز فعلی خود را ارزیابی کنید.",
    features: [
      "تولید رمز عبور با حروف بزرگ، حروف کوچک، اعداد و نمادها",
      "تنظیم طول رمز عبور بین 4 تا 64 کاراکتر",
      "نمایش نوار قدرت رمز عبور به صورت بصری",
      "تحلیل رمز عبور وارد شده و ارائهٔ پیام راهنما",
    ],
    ui: {
      tabs: {
        generate: "تولید رمز عبور",
        analyze: "تحلیل رمز عبور",
      },
      generate: {
        lengthLabel: "طول رمز عبور",
        options: {
          uppercase: "شامل حروف بزرگ انگلیسی (A-Z)",
          lowercase: "شامل حروف کوچک انگلیسی (a-z)",
          numbers: "شامل اعداد (0-9)",
          symbols: "شامل نمادها و کاراکترهای ویژه",
        },
        strength: {
          weak: "ضعیف",
          medium: "متوسط",
          strong: "قوی",
        },
        regenerateTitle: "تولید مجدد رمز عبور جدید",
        copyTitle: "کپی کردن رمز عبور در کلیپ‌بورد",
      },
      analyze: {
        inputPlaceholder: "رمز عبور خود را برای تحلیل وارد کنید...",
        showTitle: "نمایش رمز عبور",
        hideTitle: "مخفی کردن رمز عبور",
        messages: {
          weak: "این رمز عبور ضعیف است. از طول بیشتر و ترکیبی از حروف بزرگ، کوچک، اعداد و نمادها استفاده کنید.",
          medium:
            "این رمز عبور قابل قبول است اما می‌توان آن را با طول بیشتر و تنوع کاراکترها قوی‌تر کرد.",
          strong:
            "این رمز عبور قوی به نظر می‌رسد. در صورت امکان از مدیر رمز عبور برای نگهداری امن آن استفاده کنید.",
        },
      },
      page: {
        title: "ابزار تولید و تحلیل رمز عبور",
        description:
          "یک رمز عبور امن بسازید یا قدرت رمز فعلی خود را به‌صورت آنی بررسی کنید.",
      },
    },
  },
  en: {
    id: "password-generator",
    category: "developer",
    title: "Password generator & analyzer",
    description:
      "Generate strong random passwords or analyze the strength of an existing one.",
    features: [
      "Generate passwords with uppercase, lowercase, digits and symbols",
      "Control password length between 4 and 64 characters",
      "Visual strength meter for generated or entered passwords",
      "Helpful feedback messages about your password strength",
    ],
    ui: {
      tabs: {
        generate: "Generate password",
        analyze: "Analyze password",
      },
      generate: {
        lengthLabel: "Password length",
        options: {
          uppercase: "Include uppercase letters (A-Z)",
          lowercase: "Include lowercase letters (a-z)",
          numbers: "Include numbers (0-9)",
          symbols: "Include symbols and special characters",
        },
        strength: {
          weak: "Weak",
          medium: "Medium",
          strong: "Strong",
        },
        regenerateTitle: "Generate a new password",
        copyTitle: "Copy password to clipboard",
      },
      analyze: {
        inputPlaceholder: "Enter your password to analyze...",
        showTitle: "Show password",
        hideTitle: "Hide password",
        messages: {
          weak: "This password is weak. Use a longer password with a mix of upper/lowercase letters, numbers and symbols.",
          medium:
            "This password is acceptable but could be stronger with more length and character variety.",
          strong:
            "This password appears strong. Consider using a password manager to store it securely.",
        },
      },
      page: {
        title: "Password generator & analyzer",
        description:
          "Quickly generate secure passwords or check the strength of the ones you already use.",
      },
    },
  },
};

export type PasswordGeneratorToolContent = typeof passwordGeneratorContent.fa;

export function usePasswordGeneratorContent() {
  const { locale } = useLanguage();
  return passwordGeneratorContent[locale];
}
