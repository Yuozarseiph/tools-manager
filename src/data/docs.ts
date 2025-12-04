// data/docs.ts
import {
  Code2,
  FileJson,
  FileType,
  Image,
  Lock,
  ShieldCheck,
  MonitorSmartphone,
  Calculator,
  Calendar,
  QrCode,
  FileSpreadsheet,
  FileText,
  Hash,
  KeyRound,
  Ruler,
  Type,
} from "lucide-react";
import { DocSectionItem } from "@/types/docs";

export const DOCS_DATA: DocSectionItem[] = [
  // --- Developer Tools ---
  {
    id: "base64",
    title: "مبدل Base64",
    category: "ابزار توسعه‌دهندگان",
    icon: Code2,
    description:
      "رمزنگاری و رمزگشایی داده‌ها به فرمت Base64 که برای انتقال داده‌های باینری در محیط‌های متنی (مثل ایمیل یا URL) استفاده می‌شود.",
    features: [
      "پشتیبانی از UTF-8 (متون فارسی)",
      "تبدیل بلادرنگ (Real-time)",
      "بدون محدودیت حجم متن",
    ],
    howItWorks: [
      "متن ورودی به آرایه‌ای از بایت‌ها تبدیل می‌شود.",
      "از توابع داخلی btoa و atob مرورگر با یک لایه اصلاح‌کننده برای کاراکترهای یونیکد استفاده می‌شود.",
    ],
    privacyNote:
      "هیچ متنی ذخیره یا ارسال نمی‌شود. تبدیل‌ها کاملاً در حافظه مرورگر انجام می‌شوند.",
  },
  {
    id: "json-formatter",
    title: "فرمت‌کننده و اعتبارسنج JSON",
    category: "ابزار توسعه‌دهندگان",
    icon: FileJson,
    description:
      "ابزاری برای زیباسازی (Prettify)، فشرده‌سازی (Minify) و رفع خطاهای کدهای JSON نامرتب.",
    features: [
      "تشخیص خطای سینتکس با شماره خط",
      "قابلیت تا کردن (Collapsible) آبجکت‌ها",
      "تم رنگی برای خوانایی کد",
    ],
    howItWorks: [
      "استفاده از JSON.parse برای اعتبارسنجی و JSON.stringify برای فرمت‌دهی مجدد.",
    ],
  },
  {
    id: "code-visualizer",
    title: "مصورساز کد (Code Visualizer)",
    category: "ابزار توسعه‌دهندگان",
    icon: FileType,
    description:
      "تبدیل کدهای پیچیده به گراف‌های بصری و فلوچارت برای درک سریع‌تر منطق و ساختار برنامه.",
    features: [
      "پشتیبانی از زبان‌ JavaScript",
      "پشتیبانی از زبان C#",
      "رسم گراف روابط بین توابع و کلاس‌ها",
      "تشخیص خودکار نودها و یال‌ها (Nodes & Edges)",
    ],
    technicalNote: {
      title: "نحوه پردازش",
      content:
        "این ابزار کد شما را پارس کرده و ساختار آن را (بدون اجرا کردن) به یک گراف تبدیل می‌کند. برای JS از تحلیلگر AST و برای C# از Regex های پیشرفته برای استخراج متدها استفاده می‌شود.",
    },
    howItWorks: [
      "کد ورودی توسط پارسر مربوطه (JS یا C#) تحلیل می‌شود.",
      'توابع، کلاس‌ها و متغیرها به عنوان "گره" (Node) شناسایی می‌شوند.',
      'فراخوانی‌ها و وابستگی‌ها به عنوان "یال" (Edge) ترسیم می‌شوند.',
      "کتابخانه React Flow گراف نهایی را به صورت تعاملی رسم می‌کند.",
    ],
  },

  {
    id: "markdown-preview",
    title: "پیش‌نمایش زنده مارک‌داون",
    category: "ابزار توسعه‌دهندگان",
    icon: FileType,
    description:
      "ویرایشگر Markdown با قابلیت نمایش همزمان خروجی HTML، مناسب برای نوشتن داکیومنت و Readme.",
    features: [
      "پشتیبانی از جداول و کد بلاک‌ها",
      "خروجی مشابه GitHub",
      "اکسپورت به HTML",
    ],
  },

  // --- Excel Tools ---
  {
    id: "excel-chart",
    title: "رسم نمودار از اکسل",
    category: "اکسل و داده",
    icon: FileSpreadsheet,
    description:
      "تبدیل داده‌های فایل اکسل به نمودارهای تعاملی و زیبا (میله‌ای، دایره‌ای، خطی و منطقه‌ای).",
    features: [
      "پشتیبانی از فایل‌های حجیم",
      "تشخیص خودکار ستون‌های عددی",
      "شخصی‌سازی رنگ‌ها",
    ],
    howItWorks: [
      "فایل توسط کتابخانه XLSX پارس شده و داده‌ها به فرمت JSON برای کتابخانه Recharts تبدیل می‌شوند.",
    ],
  },
  {
    id: "excel-editor",
    title: "ویرایشگر آنلاین اکسل",
    category: "اکسل و داده",
    icon: FileSpreadsheet,
    description:
      "باز کردن و ویرایش فایل‌های XLSX و CSV بدون نیاز به نصب آفیس، با قابلیت جستجو و فیلتر.",
    features: [
      "صفحه‌بندی (Pagination) برای فایل‌های سنگین",
      "جستجوی آنی",
      "تاریخچه تغییرات (Undo)",
    ],
    privacyNote:
      "فایل اکسل شما در مرورگر پردازش شده و نسخه ویرایش شده مستقیماً در سیستم شما ساخته می‌شود.",
  },

  // --- Image Tools ---
  {
    id: "image-compressor",
    title: "فشرده‌سازی هوشمند تصاویر",
    category: "پردازش تصویر",
    icon: Image,
    description:
      "کاهش حجم تصاویر PNG و JPEG تا ۹۰٪ بدون افت محسوس کیفیت برای استفاده در وب.",
    features: [
      "تنظیم درصد فشرده‌سازی",
      "حذف متادیتا (EXIF)",
      "تغییر سایز خودکار",
    ],
    howItWorks: [
      "تصویر روی یک Canvas مخفی رسم شده و با الگوریتم‌های فشرده‌سازی مرورگر مجدداً انکود می‌شود.",
    ],
  },
  {
    id: "color-picker",
    title: "استخراج رنگ از تصویر",
    category: "پردازش تصویر",
    icon: Image,
    description:
      "آپلود عکس و استخراج کد رنگ (HEX, RGB) هر نقطه‌ای از آن به همراه پالت رنگی تصویر.",
    features: [
      "ذره‌بین برای دقت پیکسلی",
      "کپی سریع کد رنگ",
      "تولید پالت رنگی غالب",
    ],
    technicalNote: {
      title: "Canvas API",
      content:
        "ما از متد getImageData برای دسترسی به آرایه پیکسلی تصویر استفاده می‌کنیم.",
    },
  },

  // --- PDF Tools ---
  {
    id: "pdf-merge",
    title: "ادغام فایل‌های PDF",
    category: "مدیریت PDF",
    icon: FileText,
    description:
      "چسباندن چندین فایل PDF به یکدیگر و ساخت یک فایل واحد با ترتیب دلخواه.",
    features: [
      "بدون محدودیت تعداد فایل",
      "حفظ کیفیت اصلی صفحات",
      "Drag & Drop",
    ],
    technicalNote: {
      title: "کتابخانه pdf-lib",
      content:
        "عملیات ادغام با دستکاری ساختار داخلی PDF انجام می‌شود و نیازی به رندر مجدد صفحات نیست.",
    },
  },
  {
    id: "word-to-pdf",
    title: "تبدیل Word به PDF",
    category: "مدیریت PDF",
    icon: FileText,
    description:
      "تبدیل فایل‌های docx به PDF بدون به‌هم‌ریختگی فونت‌ها و استایل‌ها (تا حد امکان در مرورگر).",
    features: [
      "پشتیبانی از متن فارسی",
      "حفظ جداول و تصاویر",
      "بدون نیاز به سرور",
    ],
    privacyNote:
      "برخلاف سایر سرویس‌ها، فایل ورد شما آپلود نمی‌شود و تبدیل در مرورگر انجام می‌گیرد.",
  },

  // --- Security Tools ---
  {
    id: "password-generator",
    title: "پسورد ساز امن",
    category: "امنیت",
    icon: KeyRound,
    description:
      "تولید رمزهای عبور غیرقابل حدس با استفاده از منابع آنتروپی سیستم.",
    features: [
      "بدون الگوی تکراری",
      "استفاده از کاراکترهای خاص",
      "طول قابل تنظیم تا ۱۲۸ کاراکتر",
    ],
    technicalNote: {
      title: "CSPRNG",
      content:
        "از crypto.getRandomValues استفاده می‌شود که از نویز سخت‌افزاری سیستم برای تولید اعداد تصادفی استفاده می‌کند.",
    },
  },
  {
    id: "hash-generator",
    title: "مولد هش (Hashing)",
    category: "امنیت",
    icon: Hash,
    description:
      "تولید اثر انگشت دیجیتال (Hash) برای متون و فایل‌ها با الگوریتم‌های استاندارد.",
    features: [
      "پشتیبانی از SHA-256, SHA-512, MD5",
      "بررسی تغییر ناپذیری فایل",
      "سرعت بالا",
    ],
  },

  // --- System Tools ---
  {
    id: "ip-checker",
    title: "بررسی IP و موقعیت",
    category: "سیستم و شبکه",
    icon: MonitorSmartphone,
    description:
      "نمایش آی‌پی عمومی، نام سرویس‌دهنده اینترنت (ISP) و موقعیت تقریبی سرور.",
    features: ["پشتیبانی از IPv4 و IPv6", "تشخیص پروکسی/VPN", "نمایش روی نقشه"],
    technicalNote: {
      title: "API های خارجی",
      content:
        "برای دریافت اطلاعات IP از چندین API معتبر (مثل ipapi) به صورت همزمان استفاده می‌شود.",
    },
  },
  {
    id: "user-agent",
    title: "تحلیل User Agent",
    category: "سیستم و شبکه",
    icon: MonitorSmartphone,
    description:
      "استخراج اطلاعات مرورگر، سیستم عامل و دستگاه از رشته User Agent.",
    features: [
      "تشخیص نسخه دقیق مرورگر",
      "تشخیص نوع دستگاه (موبایل/دسکتاپ)",
      "بررسی موتور رندرینگ",
    ],
  },

  // --- Utility Tools ---
  {
    id: "qr-generator",
    title: "سازنده QR Code",
    category: "ابزار کاربردی",
    icon: QrCode,
    description:
      "ساخت کدهای کیوآر برای لینک، متن، ایمیل یا وای‌فای با قابلیت شخصی‌سازی.",
    features: [
      "تنظیم رنگ و پس‌زمینه",
      "تنظیم سطح اصلاح خطا (Error Correction)",
      "دانلود با فرمت PNG/SVG",
    ],
  },
  {
    id: "unit-converter",
    title: "مبدل واحدها",
    category: "ابزار کاربردی",
    icon: Ruler,
    description:
      "تبدیل واحدهای مختلف (طول، وزن، دما، حجم، سرعت و...) به یکدیگر.",
    features: [
      "دقت اعشاری بالا",
      "تبدیل آنی",
      "پشتیبانی از واحدهای امپریال و متریک",
    ],
  },
  {
    id: "date-converter",
    title: "مبدل تاریخ",
    category: "ابزار کاربردی",
    icon: Calendar,
    description: "تبدیل تاریخ شمسی به میلادی و قمری و برعکس.",
    features: ["تقویم جلالی دقیق", "محاسبه سال کبیسه", "نمایش مناسبت‌ها"],
  },
  {
    id: "word-counter",
    title: "شمارنده کلمات",
    category: "ابزار کاربردی",
    icon: Type,
    description: "شمارش تعداد کلمات، کاراکترها، جملات و پاراگراف‌های متن.",
    features: [
      "بدون احتساب فاصله (اختیاری)",
      "تخمین زمان مطالعه",
      "تحلیل تراکم کلمات",
    ],
  },
];
