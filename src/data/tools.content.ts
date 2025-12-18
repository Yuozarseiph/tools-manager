// data/tools.content.ts

export const toolsContent = {
  fa: {
    categories: {
      all: "همه ابزارها",
      pdf: "PDF",
      image: "تصویر",
      developer: "برنامه‌نویسی",
      security: "امنیت",
      system: "سیستم",
      utility: "کاربردی",
      excel: "اکسل",
      audio: "صدا",
      powerpoint: "پاورپوینت",
    },
    search: {
      placeholder: "جستجو در ابزارها...",
    },
    item: {
      cta: "استفاده از ابزار",
    },
    empty: {
      title: "هیچ ابزاری در این دسته پیدا نشد :(",
      showAll: "نمایش همه ابزارها",
    },
    loadMore: "نمایش ابزارهای بیشتر",
    items: {
      "pdf-merge": {
        title: "ادغام فایل‌های PDF",
        description: "چندین فایل PDF را به سادگی بکشید و رها کنید تا به یک فایل واحد تبدیل شوند.",
        badge: "رایگان",
      },
      "text-to-pdf": {
        title: "متن به PDF",
        description: "تبدیل متون فارسی و انگلیسی به فایل PDF استاندارد و قابل دانلود.",
        badge: "جدید",
      },
      "word-to-pdf": {
        title: "تبدیل Word به PDF",
        description: "فایل Word (.docx) خود را آپلود کرده و به فرمت PDF تبدیل کنید.",
        badge: "جدید",
      },
      "image-to-pdf": {
        title: "تبدیل تصویر به PDF",
        description: "چندین تصویر را به ترتیب صفحات در یک فایل PDF واحد ترکیب کنید.",
        badge: "جدید",
      },
      "html-to-pptx": {
        title: "تبدیل HTML به پاورپوینت",
        description: "کد یا فایل HTML خود را به اسلایدهای PPTX قابل ویرایش تبدیل کنید.",
        badge: "جدید",
      },
      "image-compressor": {
        title: "کاهش حجم تصویر",
        description: "کاهش هوشمند حجم تصاویر PNG, JPG, WebP بدون افت کیفیت محسوس.",
        badge: "محبوب",
      },
      "image-resizer": {
        title: "تغییر سایز تصویر",
        description: "تغییر ابعاد تصویر به پیکسل یا درصد دلخواه با حفظ نسبت تصویر.",
        badge: "رایگان",
      },
      "image-converter": {
        title: "مبدل فرمت تصویر",
        description: "تبدیل JPG, PNG و WebP به یکدیگر با حفظ کیفیت بالا.",
        badge: "رایگان",
      },
      "color-picker": {
        title: "استخراج رنگ",
        description: "آپلود تصویر و استخراج کد رنگ (Hex/RGB) هر پیکسل با کلیک کردن.",
        badge: "طراحی",
      },
      "background-remover": {
        title: "حذف پس‌زمینه تصویر",
        description: "حذف خودکار پس‌زمینه با هوش مصنوعی. کاملاً آفلاین و بدون آپلود به سرور.",
        badge: "AI",
      },
      "user-agent": {
        title: "اطلاعات سیستم من",
        description: "نمایش جزئیات مرورگر، سیستم عامل، مدل گوشی و IP شما.",
        badge: "کاربردی",
      },
      "ip-checker": {
        title: "IP من چیه؟",
        description: "نمایش IP عمومی، نام کشور، شهر و سرویس‌دهنده اینترنت (ISP) شما.",
        badge: "محبوب",
      },
      "json-formatter": {
        title: "فرمت‌کننده JSON",
        description: "زیباسازی کدهای JSON به‌هم‌ریخته + نمایش گرافیکی (Visual Graph).",
        badge: "Dev",
      },
      "base64": {
        title: "مبدل Base64",
        description: "تبدیل متن به کد Base64 و برعکس. پشتیبانی کامل از زبان فارسی.",
        badge: "Dev",
      },
      "markdown-preview": {
        title: "پیش‌نمایش مارک‌داون",
        description: "تایپ و مشاهده زنده کدهای Markdown. مناسب برای نوشتن داکیومنت و README.",
        badge: "Dev",
      },
      "code-visualizer": {
        title: "تصویرسازی کد (Flowchart)",
        description: "تبدیل کدهای جاوا اسکریپت و C# به فلوچارت و گراف تصویری برای درک بهتر.",
        badge: "BETA",
      },
      "excel-viewer": {
        title: "نمایشگر اکسل و CSV",
        description: "آپلود، نمایش و جستجو در فایل‌های اکسل و CSV بدون نیاز به آفیس + تبدیل به JSON.",
        badge: "جدید",
      },
      "excel-editor": {
        title: "ویرایشگر اکسل",
        description: "ویرایش آنلاین فایل‌های اکسل، تغییر داده‌ها و ذخیره فایل جدید (XLSX).",
        badge: "Pro",
      },
      "excel-chart": {
        title: "رسم نمودار اکسل",
        description: "تبدیل داده‌های اکسل به نمودارهای تصویری و زیبا.",
        badge: "Pro",
      },
      "password-generator": {
        title: "ساخت و تست پسورد",
        description: "تولید رمزهای عبور غیرقابل هک + سنجش امنیت رمزهای شما.",
        badge: "امنیتی",
      },
      "hash-generator": {
        title: "تولید هش",
        description: "ساخت کدهای هش امن SHA-1, SHA-256, SHA-512 از متن به صورت آنی.",
        badge: "امنیت",
      },
      "date-converter": {
        title: "مبدل تاریخ",
        description: "تبدیل دقیق تاریخ شمسی به میلادی و برعکس (مناسب تقویم ایران).",
        badge: "کاربردی",
      },
      "word-counter": {
        title: "شمارشگر کلمات",
        description: "آنالیز دقیق متن شامل تعداد کلمات، کاراکترها، جملات و زمان مطالعه.",
        badge: "نویسندگی",
      },
      "unit-converter": {
        title: "مبدل واحد",
        description: "تبدیل سریع واحدهای طول، جرم، دما و... به یکدیگر.",
        badge: "رایگان",
      },
      "qr-gen": {
        title: "سازنده QR Code",
        description: "لینک و متن خود را به کدهای QR رنگی و قابل دانلود تبدیل کنید.",
        badge: "رایگان",
      },
      "audio-editor": {
        title: "ویرایشگر صوت (بتا)",
        description: "برش، پخش و ویرایش ساده‌ی فایل‌های صوتی به‌صورت کاملاً محلی در مرورگر شما، بدون آپلود روی سرور.",
        badge: "صوت",
      },
      "audio-extractor": {
        title: "استخراج صدا از ویدیو",
        description: "جداسازی صدا از فایل‌های ویدیویی و دانلود آن در فرمت‌های مختلف صوتی (MP3, WAV, OGG, M4A) به صورت کامل در مرورگر، بدون نیاز به آپلود.",
        badge: "صوت",
      },
      "image-to-svg": {
        title: "تبدیل تصویر به SVG وکتور",
        description: "تبدیل تصاویر بیت‌مپ (JPG, PNG, WebP) به گرافیک‌های وکتوری SVG با کیفیت بالا.",
        badge: "تصویر",
      },
      "image-editor": {
        title: "ویرایشگر تصویر",
        description: "برش، چرخش و وارونه‌سازی تصاویر به‌صورت مستقیم در مرورگر شما بدون آپلود.",
        badge: "تصویر",
      },
      "pdf-editor": {
        title: "ویرایشگر PDF",
        description: "ویرایش صفحات PDF در مرورگر — حذف یا نگهداری صفحات، پیش‌نمایش و دانلود فایل نهایی. تمام پردازش به‌صورت محلی در مرورگر انجام می‌شود.",
        badge: "PDF",
      },
    },
  } as const,

  en: {
    categories: {
      all: "All tools",
      pdf: "PDF",
      image: "Image",
      developer: "Developer",
      security: "Security",
      system: "System",
      utility: "Utilities",
      excel: "Excel",
      audio: "Audio",
      powerpoint: "PowerPoint",
    },
    search: {
      placeholder: "Search tools...",
    },
    item: {
      cta: "Use this tool",
    },
    empty: {
      title: "No tools found in this category :(",
      showAll: "Show all tools",
    },
    loadMore: "Show more tools",
    items: {
      "pdf-merge": {
        title: "Merge PDF files",
        description: "Drag and drop multiple PDF files to merge them into a single document.",
        badge: "Free",
      },
      "text-to-pdf": {
        title: "Text to PDF",
        description: "Convert Persian and English text into a standard, downloadable PDF file.",
        badge: "New",
      },
      "word-to-pdf": {
        title: "Word to PDF",
        description: "Upload a Word (.docx) file and convert it to PDF format.",
        badge: "New",
      },
      "image-to-pdf": {
        title: "Image to PDF",
        description: "Combine multiple images into a single PDF file in page order.",
        badge: "New",
      },
      "html-to-pptx": {
        title: "HTML to PowerPoint",
        description: "Convert your HTML code or .html file into fully editable PPTX slides.",
        badge: "New",
      },
      "image-compressor": {
        title: "Image compressor",
        description: "Smartly reduce the size of PNG, JPG and WebP images with minimal quality loss.",
        badge: "Popular",
      },
      "image-resizer": {
        title: "Image resizer",
        description: "Resize images by pixels or percentage while keeping the aspect ratio.",
        badge: "Free",
      },
      "image-converter": {
        title: "Image format converter",
        description: "Convert between JPG, PNG and WebP while preserving high quality.",
        badge: "Free",
      },
      "color-picker": {
        title: "Color picker",
        description: "Upload an image and pick Hex/RGB color codes from any pixel.",
        badge: "Design",
      },
      "background-remover": {
        title: "Background remover",
        description: "Automatically remove image backgrounds with AI, fully offline with no uploads.",
        badge: "AI",
      },
      "user-agent": {
        title: "My system info",
        description: "View browser details, operating system, device model and your IP.",
        badge: "Utility",
      },
      "ip-checker": {
        title: "What is my IP?",
        description: "Show your public IP, country, city and internet provider (ISP).",
        badge: "Popular",
      },
      "json-formatter": {
        title: "JSON formatter",
        description: "Beautify messy JSON and view it as a visual graph.",
        badge: "Dev",
      },
      "base64": {
        title: "Base64 converter",
        description: "Convert text to and from Base64, with full support for Persian.",
        badge: "Dev",
      },
      "markdown-preview": {
        title: "Markdown preview",
        description: "Type and preview Markdown live. Perfect for docs and READMEs.",
        badge: "Dev",
      },
      "code-visualizer": {
        title: "Code visualizer (flowchart)",
        description: "Turn JavaScript and C# code into flowcharts and visual graphs.",
        badge: "BETA",
      },
      "excel-viewer": {
        title: "Excel & CSV viewer",
        description: "Upload, view and search Excel and CSV files offline, with JSON export.",
        badge: "New",
      },
      "excel-editor": {
        title: "Excel editor",
        description: "Edit Excel files in the browser and save new XLSX files.",
        badge: "Pro",
      },
      "excel-chart": {
        title: "Excel chart builder",
        description: "Turn Excel data into clean, beautiful charts.",
        badge: "Pro",
      },
      "password-generator": {
        title: "Password generator & checker",
        description: "Create strong, unguessable passwords and test their strength.",
        badge: "Security",
      },
      "hash-generator": {
        title: "Hash generator",
        description: "Instantly generate secure SHA-1, SHA-256 and SHA-512 hashes from text.",
        badge: "Security",
      },
      "date-converter": {
        title: "Date converter",
        description: "Convert Jalali (Shamsi) and Gregorian dates back and forth.",
        badge: "Utility",
      },
      "word-counter": {
        title: "Word counter",
        description: "Analyze text: words, characters, sentences and estimated reading time.",
        badge: "Writing",
      },
      "unit-converter": {
        title: "Unit converter",
        description: "Quickly convert length, weight, temperature and more.",
        badge: "Free",
      },
      "qr-gen": {
        title: "QR code generator",
        description: "Turn your links and text into colorful, downloadable QR codes.",
        badge: "Free",
      },
      "audio-editor": {
        title: "Audio editor (beta)",
        description: "Cut, play and edit audio files locally in your browser with no uploads.",
        badge: "Audio",
      },
      "audio-extractor": {
        title: "Extract audio from video",
        description: "Separate audio from video files and download it in various audio formats (MP3, WAV, OGG, M4A) entirely in the browser, with no upload required.",
        badge: "Audio",
      },
      "image-to-svg": {
        title: "Image to SVG converter",
        description: "Convert bitmap images (JPG/PNG/WebP) into editable vector SVG output.",
        badge: "Image",
      },
      "image-editor": {
        title: "Image editor",
        description: "Crop, rotate and flip images directly in your browser with no uploads.",
        badge: "Image",
      },
      "pdf-editor": {
        title: "PDF Editor",
        description: "Edit PDF pages in the browser — remove or keep pages, preview and download the edited PDF. All processing happens locally in your browser, no uploads.",
        badge: "PDF",
      },
    },
  } as const,
};
export type ToolsContent = typeof toolsContent.fa;
