// app/tools/(presentation)/html-to-pptx/html-to-pptx.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const htmlToPptxContent = {
  fa: {
    id: "html-to-pptx",
    category: "developer",
    title: "تبدیل HTML به پاورپوینت (PPTX)",
    description:
      "محتوای HTML خود را به صورت اسلایدهای پاورپوینت حرفه‌ای و ساختارمند تبدیل کنید.",
    features: [
      "پشتیبانی از تگ‌های متنی، لیست‌ها، جداول و تصاویر",
      "تم‌های رنگی آماده و قابلیت شخصی‌سازی کامل",
      "انتخاب فونت و نسبت تصویر اسلایدها",
      "حالت‌های مختلف تبدیل: خودکار، دستی و پیوسته",
      "شماره‌گذاری خودکار اسلایدها و پاورقی دلخواه",
      "اجرای کامل در مرورگر بدون نیاز به نصب نرم‌افزار",
    ],
    ui: {
      upload: {
        title: "📁 آپلود فایل HTML",
        subtitle:
          "فایل HTML یا HTM خود را انتخاب کنید تا به اسلایدهای پاورپوینت تبدیل شود.",
      },
      editor: {
        title: "📝 محتوای HTML",
        placeholder:
          "<h1>عنوان ارائه</h1>\n<p>این متن به یک اسلاید تبدیل می‌شود...</p>\n<img src='image.jpg' alt='تصویر'>\n<table>...</table>",
        hint: "تگ‌های heading، پاراگراف، لیست، جدول و تصویر پشتیبانی می‌شوند. می‌توانید از استایل‌های inline هم استفاده کنید.",
      },
      filename: {
        label: "📄 نام فایل خروجی",
      },
      labels: {
        themeColor: "🎨 رنگ تم",
        conversionMode: "⚙️ حالت تبدیل",
        headingBreakLevels: "📊 سطوح تیتر جداکننده",
        includeImages: "🖼️ درج تصاویر",
        footerText: "📌 متن پاورقی",
        presetTheme: "🎭 تم آماده",
        fontFamily: "🔤 فونت",
        fontSize: "📏 اندازه فونت پایه",
        aspectRatio: "📐 نسبت تصویر",
        lineSpacing: "↕️ فاصله خطوط",
        slideTransition: "🔄 انیمیشن اسلاید",
      },
      modes: {
        auto: "خودکار (بر اساس تیترها)",
        manual: "دستی (کلاس‌های slide.)",
        continuous: "پیوسته (تک اسلاید)",
      },
      themes: {
        modern: "مدرن",
        classic: "کلاسیک",
        minimal: "مینیمال",
        dark: "دارک",
        ocean: "اقیانوس",
        forest: "جنگل",
        sunset: "غروب",
        custom: "سفارشی",
      },
      fonts: {
        default: "پیش‌فرض",
        vazir: "وزیر",
        shabnam: "شبنم",
        sahel: "ساحل",
        iranSans: "ایران سنس",
        calibri: "Calibri",
        arial: "Arial",
        tahoma: "Tahoma",
        timesNewRoman: "Times New Roman",
        georgia: "Georgia",
        verdana: "Verdana",
        roboto: "Roboto",
        openSans: "Open Sans",
        lato: "Lato",
        montserrat: "Montserrat",
      },
      aspectRatios: {
        "16:9": "16:9 (صفحه عریض)",
        "4:3": "4:3 (استاندارد)",
        "16:10": "16:10 (مانیتور)",
      },
      transitions: {
        none: "بدون انیمیشن",
        fade: "محو شدن",
        slide: "اسلاید",
        zoom: "بزرگنمایی",
        flip: "چرخش",
        rotate: "چرخش سه بعدی",
      },
      buttons: {
        convertIdle: "🚀 تبدیل به پاورپوینت",
        convertLoading: "⏳ در حال ساخت...",
        preview: "👁️ پیش‌نمایش",
        downloadSample: "📥 دانلود نمونه HTML",
      },
      progress: {
        idle: "",
        preparing: "🔍 تحلیل ساختار HTML...",
        exporting: "📦 تولید اسلایدها...",
        loadingImages: "🖼️ بارگذاری تصاویر...",
        success: "✅ فایل پاورپوینت با موفقیت ساخته شد!",
      },
      errors: {
        invalidType: "❌ فقط فایل‌های HTML یا HTM پشتیبانی می‌شوند.",
        emptyContent: "❌ محتوایی در فایل HTML پیدا نشد.",
        genericPrefix: "❌ خطا در پردازش HTML:",
        unknown: "❌ خطای ناشناخته در فرآیند تبدیل.",
        noSlides:
          "❌ هیچ اسلاید معتبری پیدا نشد. از تگ‌های heading، p، ul/li و table استفاده کنید.",
        imageLoadError: "⚠️ خطا در بارگذاری تصویر از {0}",
      },
      preview: {
        title: "📋 پیش‌نمایش ساختار",
        empty: "پس از وارد کردن HTML، ساختار اسلایدها اینجا نمایش داده می‌شود.",
        slidesFound: "📑 {count} اسلاید",
        blocksFound: "📦 {count} بلاک",
        headingsFound: "📝 {count} عنوان",
        imagesFound: "🖼️ {count} تصویر",
        tablesFound: "📊 {count} جدول",
        listsFound: "📋 {count} لیست",
      },
      guide: {
        title: "💡 نکات طلایی برای بهترین خروجی",
        items: [
          "از ساختار ساده و سلسله‌مراتبی با تگ‌های heading استفاده کنید",
          "برای جداول، سطر اول به‌عنوان هدر با استایل متفاوت نمایش داده می‌شود",
          "تصاویر با src معتبر به‌صورت خودکار در اسلایدها قرار می‌گیرند",
          "متن‌های طولانی به‌طور خودکار در چند اسلاید تقسیم می‌شوند",
          "با کلاس‌های `.title-slide`، `.section-slide` و `.end-slide` نوع اسلاید را مشخص کنید",
          "برای بهترین نتیجه، از فونت‌های استاندارد و اندازه مناسب استفاده کنید",
        ],
      },
      page: {
        title: "ابزار تبدیل HTML به پاورپوینت",
        description:
          "کد HTML خود را به یک ارائه پاورپوینت حرفه‌ای و زیبا تبدیل کنید",
      },
    },
  },
  en: {
    id: "html-to-pptx",
    category: "developer",
    title: "HTML to PowerPoint (PPTX) converter",
    description:
      "Convert your HTML content into professional, structured PowerPoint slides.",
    features: [
      "Supports text tags, lists, tables and images",
      "Ready-made color themes with full customization",
      "Font and aspect ratio selection",
      "Multiple conversion modes: auto, manual and continuous",
      "Auto slide numbering and custom footer",
      "Runs entirely in the browser with no installation required",
    ],
    ui: {
      upload: {
        title: "📁 Upload HTML file",
        subtitle:
          "Select an HTML or HTM file to convert into PowerPoint slides.",
      },
      editor: {
        title: "📝 HTML Content",
        placeholder:
          "<h1>Presentation Title</h1>\n<p>This text will become a slide...</p>\n<img src='image.jpg' alt='Image'>\n<table>...</table>",
        hint: "Headings, paragraphs, lists, tables and images are supported. You can also use inline styles.",
      },
      filename: {
        label: "📄 Output filename",
      },
      labels: {
        themeColor: "🎨 Theme Color",
        conversionMode: "⚙️ Conversion Mode",
        headingBreakLevels: "📊 Break Levels",
        includeImages: "🖼️ Include Images",
        footerText: "📌 Footer Text",
        presetTheme: "🎭 Preset Theme",
        fontFamily: "🔤 Font",
        fontSize: "📏 Base Font Size",
        aspectRatio: "📐 Aspect Ratio",
        lineSpacing: "↕️ Line Spacing",
        slideTransition: "🔄 Slide Transition",
      },
      modes: {
        auto: "Auto (by headings)",
        manual: "Manual (.slide classes)",
        continuous: "Continuous (single slide)",
      },
      themes: {
        modern: "Modern",
        classic: "Classic",
        minimal: "Minimal",
        dark: "Dark",
        ocean: "Ocean",
        forest: "Forest",
        sunset: "Sunset",
        custom: "Custom",
      },
      fonts: {
        default: "Default",
        vazir: "Vazir",
        shabnam: "Shabnam",
        sahel: "Sahel",
        iranSans: "Iran Sans",
        calibri: "Calibri",
        arial: "Arial",
        tahoma: "Tahoma",
        timesNewRoman: "Times New Roman",
        georgia: "Georgia",
        verdana: "Verdana",
        roboto: "Roboto",
        openSans: "Open Sans",
        lato: "Lato",
        montserrat: "Montserrat",
      },
      aspectRatios: {
        "16:9": "16:9 (Widescreen)",
        "4:3": "4:3 (Standard)",
        "16:10": "16:10 (Monitor)",
      },
      transitions: {
        none: "No Animation",
        fade: "Fade",
        slide: "Slide",
        zoom: "Zoom",
        flip: "Flip",
        rotate: "3D Rotate",
      },
      buttons: {
        convertIdle: "🚀 Convert to PowerPoint",
        convertLoading: "⏳ Generating...",
        preview: "👁️ Preview",
        downloadSample: "📥 Download Sample HTML",
      },
      progress: {
        idle: "",
        preparing: "🔍 Analyzing HTML structure...",
        exporting: "📦 Generating slides...",
        loadingImages: "🖼️ Loading images...",
        success: "✅ PowerPoint file created successfully!",
      },
      errors: {
        invalidType: "❌ Only HTML or HTM files are supported.",
        emptyContent: "❌ No content found in HTML file.",
        genericPrefix: "❌ Error processing HTML:",
        unknown: "❌ Unknown conversion error.",
        noSlides:
          "❌ No valid slides found. Use headings, p, ul/li and table tags.",
        imageLoadError: "⚠️ Failed to load image from {0}",
      },
      preview: {
        title: "📋 Structure Preview",
        empty: "After entering HTML, the slide structure will be shown here.",
        slidesFound: "📑 {count} slides",
        blocksFound: "📦 {count} blocks",
        headingsFound: "📝 {count} headings",
        imagesFound: "🖼️ {count} images",
        tablesFound: "📊 {count} tables",
        listsFound: "📋 {count} lists",
      },
      guide: {
        title: "💡 Tips for Best Results",
        items: [
          "Use simple, hierarchical structure with heading tags",
          "First table row is styled as header automatically",
          "Valid image sources are placed in slides automatically",
          "Long texts are split across multiple slides automatically",
          "Use `.title-slide`, `.section-slide`, `.end-slide` classes for slide types",
          "For best results, use standard fonts and appropriate sizes",
        ],
      },
      page: {
        title: "HTML to PowerPoint Converter",
        description:
          "Convert your HTML code into a beautiful, professional PowerPoint presentation",
      },
    },
  },
};

export type HtmlToPptxToolContent = typeof htmlToPptxContent.fa;

export function useHtmlToPptxContent() {
  const { locale } = useLanguage();
  return htmlToPptxContent[locale];
}
