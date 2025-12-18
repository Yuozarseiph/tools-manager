// app/tools/(presentation)/html-to-pptx/html-to-pptx.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const htmlToPptxContent = {
  fa: {
    id: "html-to-pptx",
    category: "developer",
    title: "تبدیل HTML به پاورپوینت (PPTX)",
    description:
      "محتوای HTML خود را به صورت اسلایدهای پاورپوینت ساختارمند تبدیل و به صورت فایل PPTX دانلود کنید.",
    features: [
      "پشتیبانی از تگ‌های متنی رایج، لیست‌ها و جداول ساده",
      "استخراج خودکار بدنهٔ HTML از فایل‌های کامل",
      "تنظیم خودکار پس‌زمینه و استایل اسلایدهای عنوان، بخش و محتوا",
      "اجرای کامل در مرورگر بدون نیاز به نصب نرم‌افزار",
    ],
    ui: {
      upload: {
        title: "آپلود فایل HTML",
        subtitle:
          "فایل HTML یا HTM خود را انتخاب کنید تا محتوای آن به اسلایدهای پاورپوینت تبدیل شود.",
      },
      editor: {
        title: "محتوای HTML خام",
        placeholder:
          "<h1>عنوان ارائه</h1>\n<p>این متن به یک اسلاید تبدیل می‌شود...</p>",
        hint: "می‌توانید محتوای بدنهٔ HTML را بدون تگ <body> وارد کنید. تگ‌های heading، پاراگراف، لیست و جدول به اسلایدهای جداگانه تبدیل می‌شوند.",
      },
      filename: {
        label: "نام فایل خروجی (PPTX)",
      },
      labels: {
        themeColor: "رنگ تم اصلی",
      },
      buttons: {
        convertIdle: "تبدیل به پاورپوینت",
        convertLoading: "در حال ساخت پاورپوینت...",
      },
      progress: {
        idle: "",
        preparing: "در حال آماده‌سازی محتوا و تحلیل ساختار HTML...",
        exporting: "در حال تولید اسلایدها و ذخیرهٔ فایل PPTX...",
        success: "فایل پاورپوینت با موفقیت ساخته شد.",
      },
      errors: {
        invalidType: "فقط فایل‌های HTML یا HTM پشتیبانی می‌شوند.",
        emptyContent:
          "محتوایی در فایل HTML پیدا نشد. لطفاً فایل را بررسی کنید.",
        genericPrefix: "در هنگام پردازش HTML خطایی رخ داد:",
        unknown: "خطای ناشناخته در فرآیند تبدیل.",
        noSlides:
          "هیچ اسلاید معتبری در HTML پیدا نشد. لطفاً ساختار HTML را بررسی کنید یا از تگ‌های heading، p، ul/li و table استفاده کنید.",
      },
      preview: {
        title: "پیش‌نمایش متن HTML",
        empty:
          "پس از وارد کردن یا آپلود HTML، محتوای آن به‌صورت متن در این بخش نمایش داده می‌شود.",
      },
      guide: {
        title: "نکات تبدیل HTML به پاورپوینت",
        items: [
          "برای بهترین نتیجه، از ساختار سادهٔ HTML با تگ‌های heading، p، ul/li و table استفاده کنید.",
          "ردیف اول جدول به‌عنوان هدر در نظر گرفته می‌شود و استایل متمایز دریافت می‌کند.",
          "در صورت طولانی بودن متن، ابزار به‌طور خودکار آن را در چند اسلاید تقسیم می‌کند.",
          "اگر در خروجی مشکل دیدید، HTML را ساده‌تر و بدون استایل‌های پیچیده امتحان کنید.",
        ],
      },
      page: {
        title: "ابزار تبدیل HTML به پاورپوینت",
        description:
          "کد HTML خود را مستقیماً در مرورگر به فایل پاورپوینت قابل ارائه (PPTX) تبدیل کنید.",
      },
    },
  },
  en: {
    id: "html-to-pptx",
    category: "developer",
    title: "HTML to PowerPoint (PPTX) converter",
    description:
      "Convert your HTML content into structured PowerPoint slides and download it as a PPTX file.",
    features: [
      "Supports common text tags, lists and simple tables",
      "Automatically extracts the <body> content from full HTML files",
      "Applies different backgrounds for title, section and content slides",
      "Runs entirely in the browser with no installation required",
    ],
    ui: {
      upload: {
        title: "Upload HTML file",
        subtitle:
          "Select an HTML or HTM file to convert its content into PowerPoint slides.",
      },
      editor: {
        title: "Raw HTML content",
        placeholder:
          "<h1>Presentation title</h1>\n<p>This text will become a slide...</p>",
        hint: "You can paste only the HTML body content without the <body> tag. Headings, paragraphs, lists and tables will be converted into slides.",
      },
      filename: {
        label: "Output file name (PPTX)",
      },
      labels: {
        themeColor: "Primary theme color",
      },
      buttons: {
        convertIdle: "Convert to PowerPoint",
        convertLoading: "Generating PowerPoint...",
      },
      progress: {
        idle: "",
        preparing: "Preparing content and analyzing HTML structure...",
        exporting: "Generating slides and saving PPTX file...",
        success: "PowerPoint file has been created successfully.",
      },
      errors: {
        invalidType: "Only HTML or HTM files are supported.",
        emptyContent:
          "No content was found in the HTML file. Please check the file.",
        genericPrefix: "An error occurred while processing the HTML:",
        unknown: "Unknown error during conversion.",
        noSlides:
          "No valid slides were found in the HTML. Please review the structure or use headings, paragraphs, lists and tables.",
      },
      preview: {
        title: "HTML text preview",
        empty:
          "After entering or uploading HTML, its content will be shown here as plain text.",
      },
      guide: {
        title: "Tips for HTML to PowerPoint conversion",
        items: [
          "For best results, use simple HTML structure with heading, p, ul/li and table tags.",
          "The first row of a table is treated as a header row and styled differently.",
          "If the text is long, the tool will automatically split it across multiple slides.",
          "If the output looks wrong, try simplifying the HTML and removing complex styles.",
        ],
      },
      page: {
        title: "HTML to PowerPoint converter tool",
        description:
          "Convert your HTML code into a ready‑to‑use PowerPoint (PPTX) presentation directly in the browser.",
      },
    },
  },
};

export type HtmlToPptxToolContent = typeof htmlToPptxContent.fa;

export function useHtmlToPptxContent() {
  const { locale } = useLanguage();
  return htmlToPptxContent[locale];
}
