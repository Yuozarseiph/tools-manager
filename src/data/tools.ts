import {
  FileStack,
  Image as ImageIcon,
  Braces,
  KeyRound,
  QrCode,
  Minimize2,
  Scaling,
  TextCursorInput,
  Scale,
  Binary,
  CalendarDays, // جدید
  Pipette, // جدید
  LucideIcon,
  ShieldCheck,
  FileCode,
  MonitorSmartphone,
  Globe,
  FileType,
} from "lucide-react";

// data/tools.ts
export interface Tool {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  href: string;
  status: "active" | "coming-soon";
  badge?: string;
  category: "pdf" | "image" | "developer" | "security" | "utility" | "system";
}

export const TOOLS: Tool[] = [
  // --- PDF ---
  {
    id: "pdf-merge",
    title: "ادغام فایل‌های PDF",
    description:
      "چندین فایل PDF را به سادگی بکشید و رها کنید تا به یک فایل واحد تبدیل شوند.",
    Icon: FileStack,
    href: "/tools/pdf-merge",
    status: "active",
    badge: "رایگان",
    category: "pdf",
  },
  {
    id: "text-to-pdf",
    title: "متن به PDF",
    description:
      "تبدیل متون فارسی و انگلیسی به فایل PDF استاندارد و قابل دانلود.",
    Icon: FileType, 
    href: "/tools/text-to-pdf",
    status: "active",
    badge: "جدید",
    category: "pdf",
  },

  // --- Image ---
  {
    id: "image-compressor",
    title: "کاهش حجم تصویر",
    description: "کاهش هوشمند حجم تصاویر PNG, JPG, WebP بدون افت کیفیت محسوس.",
    Icon: Minimize2,
    href: "/tools/image-compressor",
    status: "active",
    badge: "محبوب",
    category: "image",
  },
  {
    id: "image-resizer",
    title: "تغییر سایز تصویر",
    description: "تغییر ابعاد تصویر به پیکسل یا درصد دلخواه با حفظ نسبت تصویر.",
    Icon: Scaling,
    href: "/tools/image-resizer",
    status: "active",
    badge: "رایگان",
    category: "image",
  },
  {
    id: "image-converter",
    title: "مبدل فرمت تصویر",
    description: "تبدیل JPG, PNG و WebP به یکدیگر با حفظ کیفیت بالا.",
    Icon: ImageIcon,
    href: "/tools/image-converter",
    status: "active",
    badge: "رایگان",
    category: "image",
  },
  {
    id: "color-picker",
    title: "استخراج رنگ",
    description:
      "آپلود تصویر و استخراج کد رنگ (Hex/RGB) هر پیکسل با کلیک کردن.",
    Icon: Pipette,
    href: "/tools/color-picker",
    status: "active",
    badge: "طراحی",
    category: "image",
  },
  // --- System ---
  {
    id: "user-agent",
    title: "اطلاعات سیستم من",
    description: "نمایش جزئیات مرورگر، سیستم عامل، مدل گوشی و IP شما.",
    Icon: MonitorSmartphone,
    href: "/tools/user-agent",
    status: "active",
    badge: "کاربردی",
    category: "system",
  },
  {
    id: "ip-checker",
    title: "IP من چیه؟",
    description:
      "نمایش IP عمومی، نام کشور، شهر و سرویس‌دهنده اینترنت (ISP) شما.",
    Icon: Globe, // ایمپورت از lucide-react
    href: "/tools/ip-checker",
    status: "active",
    badge: "محبوب",
    category: "system",
  },

  // --- Developer ---
  {
    id: "json-formatter",
    title: "فرمت‌کننده JSON",
    description:
      "زیباسازی کدهای JSON به‌هم‌ریخته + نمایش گرافیکی (Visual Graph).",
    Icon: Braces,
    href: "/tools/json-formatter",
    status: "active",
    badge: "Dev",
    category: "developer",
  },
  {
    id: "base64",
    title: "مبدل Base64",
    description: "تبدیل متن به کد Base64 و برعکس. پشتیبانی کامل از زبان فارسی.",
    Icon: Binary,
    href: "/tools/base64",
    status: "active",
    badge: "Dev",
    category: "developer",
  },
  {
    id: "markdown-preview",
    title: "پیش‌نمایش مارک‌داون",
    description:
      "تایپ و مشاهده زنده کدهای Markdown. مناسب برای نوشتن داکیومنت و README.",
    Icon: FileCode, // ایمپورت از lucide-react
    href: "/tools/markdown-preview",
    status: "active",
    badge: "Dev",
    category: "developer",
  },

  // --- Security ---
  {
    id: "password-generator",
    title: "ساخت و تست پسورد", // یا "پسورد ساز حرفه‌ای"
    description: "تولید رمزهای عبور غیرقابل هک + سنجش امنیت رمزهای شما.",
    Icon: KeyRound,
    href: "/tools/password-generator",
    status: "active",
    badge: "امنیتی",
    category: "security",
  },
  {
    id: "hash-generator",
    title: "تولید هش",
    description:
      "ساخت کدهای هش امن SHA-1, SHA-256, SHA-512 از متن به صورت آنی.",
    Icon: ShieldCheck, // ایمپورت از lucide-react
    href: "/tools/hash-generator",
    status: "active",
    badge: "امنیت",
    category: "security", // دسته‌بندی جدید
  },

  // --- General Tools ---
  {
    id: "date-converter",
    title: "مبدل تاریخ",
    description: "تبدیل دقیق تاریخ شمسی به میلادی و برعکس (مناسب تقویم ایران).",
    Icon: CalendarDays,
    href: "/tools/date-converter",
    status: "active",
    badge: "کاربردی",
    category: "utility",
  },
  {
    id: "word-counter",
    title: "شمارشگر کلمات",
    description:
      "آنالیز دقیق متن شامل تعداد کلمات، کاراکترها، جملات و زمان مطالعه.",
    Icon: TextCursorInput,
    href: "/tools/word-counter",
    status: "active",
    badge: "نویسندگی",
    category: "utility",
  },
  {
    id: "unit-converter",
    title: "مبدل واحد",
    description: "تبدیل سریع واحدهای طول، جرم، دما و... به یکدیگر.",
    Icon: Scale,
    href: "/tools/unit-converter",
    status: "active",
    badge: "رایگان",
    category: "utility",
  },
  {
    id: "qr-gen",
    title: "سازنده QR Code",
    description: "لینک و متن خود را به کدهای QR رنگی و قابل دانلود تبدیل کنید.",
    Icon: QrCode,
    href: "/tools/qr-generator",
    status: "active",
    badge: "رایگان",
    category: "utility",
  },
];
