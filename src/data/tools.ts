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
  Pipette,      // جدید
  LucideIcon
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  href: string;
  status: "active" | "coming-soon";
  badge?: string;
  category: "PDF" | "Image" | "Developer" | "Security" | "Tools";
}

export const TOOLS: Tool[] = [
  // --- PDF ---
  {
    id: "pdf-merge",
    title: "ادغام فایل‌های PDF",
    description: "چندین فایل PDF را به سادگی بکشید و رها کنید تا به یک فایل واحد تبدیل شوند.",
    Icon: FileStack,
    href: "/tools/pdf-merge",
    status: "active",
    badge: "رایگان",
    category: "PDF",
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
    category: "Image",
  },
  {
    id: "image-resizer",
    title: "تغییر سایز تصویر",
    description: "تغییر ابعاد تصویر به پیکسل یا درصد دلخواه با حفظ نسبت تصویر.",
    Icon: Scaling,
    href: "/tools/image-resizer",
    status: "active",
    badge: "رایگان",
    category: "Image",
  },
  {
    id: "image-converter",
    title: "مبدل فرمت تصویر",
    description: "تبدیل JPG, PNG و WebP به یکدیگر با حفظ کیفیت بالا.",
    Icon: ImageIcon,
    href: "/tools/image-converter",
    status: "active",
    badge: "رایگان",
    category: "Image",
  },
  {
    id: "color-picker",
    title: "استخراج رنگ",
    description: "آپلود تصویر و استخراج کد رنگ (Hex/RGB) هر پیکسل با کلیک کردن.",
    Icon: Pipette,
    href: "/tools/color-picker",
    status: "active",
    badge: "طراحی",
    category: "Image",
  },

  // --- Developer ---
  {
    id: "json-formatter",
    title: "فرمت‌کننده JSON",
    description: "زیباسازی کدهای JSON به‌هم‌ریخته + نمایش گرافیکی (Visual Graph).",
    Icon: Braces,
    href: "/tools/json-formatter",
    status: "active",
    badge: "Dev",
    category: "Developer",
  },
  {
    id: "base64",
    title: "مبدل Base64",
    description: "تبدیل متن به کد Base64 و برعکس. پشتیبانی کامل از زبان فارسی.",
    Icon: Binary,
    href: "/tools/base64",
    status: "active",
    badge: "Dev",
    category: "Developer",
  },

  // --- Security ---
  {
    id: "password-gen",
    title: "تولیدکننده رمز عبور",
    description: "ساخت پسوردهای فوق‌امن و غیرقابل هک با یک کلیک.",
    Icon: KeyRound,
    href: "/tools/password-generator",
    status: "active",
    badge: "Security",
    category: "Security",
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
    category: "Tools",
  },
  {
    id: "word-counter",
    title: "شمارشگر کلمات",
    description: "آنالیز دقیق متن شامل تعداد کلمات، کاراکترها، جملات و زمان مطالعه.",
    Icon: TextCursorInput,
    href: "/tools/word-counter",
    status: "active",
    badge: "نویسندگی",
    category: "Tools",
  },
  {
    id: "unit-converter",
    title: "مبدل واحد",
    description: "تبدیل سریع واحدهای طول، جرم، دما و... به یکدیگر.",
    Icon: Scale,
    href: "/tools/unit-converter",
    status: "active",
    badge: "رایگان",
    category: "Tools",
  },
  {
    id: "qr-gen",
    title: "سازنده QR Code",
    description: "لینک و متن خود را به کدهای QR رنگی و قابل دانلود تبدیل کنید.",
    Icon: QrCode,
    href: "/tools/qr-generator",
    status: "active",
    badge: "رایگان",
    category: "Tools",
  },
];
