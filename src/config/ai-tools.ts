export const AI_TOOLS = {
  "file-to-markdown": {
    fa: ["تبدیل فایل به Markdown", "فایل‌های TXT، DOCX و HTML را با حفظ تیتر، جدول، لینک و کد به Markdown مناسب هوش مصنوعی تبدیل کنید."],
    en: ["File to Markdown", "Convert TXT, DOCX and HTML files into clean Markdown for AI, preserving headings, tables, links and code."],
    features: [["تبدیل چند فایل و پیش‌نمایش امن", "حفظ ساختار سند و دانلود Markdown", "پردازش محلی؛ بدون ارسال فایل"], ["Batch conversion with safe preview", "Document structure and Markdown download", "Local processing without uploading files"]],
    steps: [["فایل TXT، DOCX یا HTML را انتخاب کنید یا متن HTML را وارد کنید.", "نتیجه تبدیل و پیش‌نمایش را بررسی کنید.", "Markdown را کپی یا دانلود کنید."], ["Choose TXT, DOCX or HTML files, or paste HTML.", "Review the converted source and preview.", "Copy or download the Markdown."]],
    limit: ["حداکثر ۲۰ فایل و ۲۰ مگابایت ورودی. فرمت‌های PDF و تصویر در این ابزار پشتیبانی نمی‌شوند. استایل بصری Word به ساختار Markdown تبدیل می‌شود؛ منابع خارجی پیش‌نمایش بارگذاری نمی‌شوند.", "Up to 20 files and 20 MB total. PDF and images are not supported here. Word styling is converted to Markdown structure; preview does not load remote resources."],
  },
  "project-to-markdown": {
    fa: ["بسته‌ساز پروژه برای هوش مصنوعی", "فایل‌ها یا پوشه کد را به یک Markdown شامل درخت پروژه، مسیرها و بلوک‌های کد تبدیل کنید؛ با انتخاب فایل و حذف مسیرهای حساس."],
    en: ["Project to Markdown", "Bundle selected project files into Markdown with a directory tree, file paths and fenced code, excluding dependencies and sensitive paths."],
    features: [["انتخاب پوشه یا چند فایل", "حذف وابستگی‌ها و مسیرهای حساس", "انتخاب دستی فایل‌های خروجی و درخت پروژه"], ["Folder and multiple-file selection", "Dependency and sensitive-path exclusions", "Choose output files and include a project tree"]],
    steps: [["پوشه یا فایل‌های پروژه را انتخاب کنید.", "فهرست فایل‌های مجاز و حذف‌شده را بازبینی و انتخاب‌ها را اصلاح کنید.", "بسته را بسازید و قبل از ارسال برای AI بازبینی کنید."], ["Select a project folder or individual files.", "Review included and excluded files and adjust selection.", "Build the bundle and review it before sharing with AI."]],
    limit: ["حداکثر ۳۰۰ فایل و ۲۰ مگابایت متن. فایل‌های باینری، وابستگی‌ها، .env و کلیدهای رایج کنار گذاشته می‌شوند. تشخیص مسیر حساس تضمین کامل نیست؛ خروجی را بازبینی کنید.", "Up to 300 files and 20 MB of text. Binary files, dependencies, .env and common key files are excluded. Path filters cannot guarantee secret detection; review the output."],
  },
  "text-cleaner": {
    fa: ["پاک‌سازی متن برای هوش مصنوعی", "فاصله‌ها و خط‌شکست‌های اضافی را حذف کنید، حروف فارسی را یکسان کنید و متن استخراج‌شده از سند را مرتب کنید."],
    en: ["AI Text Cleaner", "Clean extra whitespace and broken lines, normalize Persian characters and prepare extracted document text for AI."],
    features: [["تنظیم مستقل پاک‌سازی فاصله‌ها", "یکسان‌سازی ی و ک فارسی", "ادغام اختیاری خطوط شکسته"], ["Configurable whitespace cleanup", "Persian character normalization", "Optional broken-line joining"]],
    steps: [["متن را وارد کنید یا فایل متنی انتخاب کنید.", "گزینه‌های پاک‌سازی را با توجه به ساختار متن انتخاب کنید.", "متن اولیه و خروجی را بررسی و نتیجه را دریافت کنید."], ["Paste text or select a text file.", "Choose cleanup options to match the document structure.", "Review the input and output, then copy or download."]],
    limit: ["حداکثر ۲ میلیون نویسه. ادغام خطوط برای متن ساده است و ممکن است فاصله‌گذاری شعر یا کد را تغییر دهد؛ این گزینه اختیاری است.", "Maximum 2 million characters. Joining lines is intended for prose and may alter poetry or code formatting; it is optional."],
  },
  "text-chunker": {
    fa: ["تقسیم متن طولانی برای هوش مصنوعی", "متن طولانی را با اندازه دلخواه و هم‌پوشانی به بخش‌های شماره‌دار تقسیم کنید و مرز پاراگراف‌ها را تا جای ممکن حفظ کنید."],
    en: ["AI Text Chunker", "Split long text into numbered chunks with configurable size and overlap, preserving paragraph boundaries where possible."],
    features: [["اندازه بر حسب نویسه یا توکن تخمینی", "هم‌پوشانی قابل تنظیم", "خروجی بخش‌های شماره‌دار"], ["Character or estimated-token sizing", "Configurable overlap", "Numbered chunk output"]],
    steps: [["متن را وارد و واحد اندازه را انتخاب کنید.", "اندازه بخش و هم‌پوشانی کوچک‌تر از آن را تنظیم کنید.", "بخش‌های ساخته‌شده را بررسی و دانلود کنید."], ["Provide text and choose the size unit.", "Set chunk size and a smaller overlap.", "Review and download the generated chunks."]],
    limit: ["حداکثر ۲ میلیون نویسه و ۵۰۰ بخش. شمارش توکن تخمینی است و به توکنایزر مدل مشخصی وابسته نیست؛ برای محدودیت سخت مدل حاشیه امن بگذارید.", "Maximum 2 million characters and 500 chunks. Tokens are estimates, not a specific model tokenizer; leave headroom for hard model limits."],
  },
  "chat-to-markdown": {
    fa: ["تبدیل گفت‌وگو به Markdown", "متن چت یا JSON پیام‌ها را با تفکیک نقش کاربر، دستیار و سیستم و حفظ بلوک‌های کد به Markdown تبدیل کنید."],
    en: ["Chat to Markdown", "Turn chat text or JSON messages into Markdown with user, assistant and system roles while preserving code blocks."],
    features: [["پشتیبانی از آرایه messages در JSON", "تشخیص نقش‌های فارسی و انگلیسی", "حفظ کد و ترتیب پیام‌ها"], ["JSON messages-array support", "Persian and English role labels", "Preserve code blocks and message order"]],
    steps: [["JSON پیام‌ها یا متن دارای برچسب نقش را وارد کنید.", "خروجی نقش‌ها و ترتیب پیام‌ها را بررسی کنید.", "نسخه Markdown را کپی یا دانلود کنید."], ["Paste message JSON or role-labelled chat text.", "Review the detected roles and message order.", "Copy or download the Markdown."]],
    limit: ["حداکثر ۲ میلیون نویسه. JSON باید آرایه پیام یا شیء دارای messages باشد؛ خروجی اختصاصی همه سرویس‌های چت پشتیبانی نمی‌شود. تصاویر و پیوست‌ها به متن تبدیل نمی‌شوند.", "Maximum 2 million characters. JSON must be a message array or an object with messages; proprietary chat exports are not all supported. Images and attachments are not converted."],
  },
  "text-diff": {
    fa: ["مقایسه دو متن آنلاین", "تفاوت دو نسخه متن، Markdown یا پاسخ هوش مصنوعی را خط‌به‌خط با نمایش موارد افزوده و حذف‌شده ببینید."],
    en: ["Online Text Diff", "Compare two versions of text, Markdown or AI responses with a line-by-line view of additions and deletions."],
    features: [["مقایسه خط‌به‌خط در Worker", "نمایش مجزای حذف و اضافه", "نادیده‌گرفتن اختیاری فاصله و بزرگی حروف"], ["Line comparison in a worker", "Distinct added and removed lines", "Optional whitespace and case normalization"]],
    steps: [["نسخه قدیمی و نسخه جدید را در دو ورودی وارد کنید.", "گزینه‌های مقایسه را تنظیم و مقایسه را اجرا کنید.", "خطوط افزوده و حذف‌شده را ببینید و گزارش را دریافت کنید."], ["Enter the original and revised text.", "Choose comparison options and run the comparison.", "Review additions and deletions and download the report."]],
    limit: ["حداکثر ۲۰۰۰ خط در هر ورودی و ۲ میلیون نویسه مجموع. مقایسه متنی است و معنای دو پاسخ را ارزیابی نمی‌کند.", "Up to 2,000 lines per input and 2 million characters combined. This compares text, not semantic meaning."],
  },
  "sensitive-data-redactor": {
    fa: ["پوشاندن اطلاعات حساس متن", "ایمیل، شماره تلفن و کلیدهای رایج احتمالی را در متن پیدا کنید و پس از انتخاب خودتان، با برچسب جایگزین کنید."],
    en: ["Sensitive Data Redactor", "Find likely email addresses, phone numbers and common API keys in text, then replace only the matches you select."],
    features: [["بازبینی و تأیید هر مورد", "جایگزینی با برچسب نوع داده", "پردازش محلی و بدون ذخیره‌سازی متن"], ["Review and approve individual matches", "Replace with typed placeholders", "Local processing without saving input"]],
    steps: [["متن را وارد و جست‌وجو را اجرا کنید.", "موارد پیشنهادی را بررسی و موارد موردنظر را انتخاب کنید.", "پوشاندن را تأیید و متن خروجی را دریافت کنید."], ["Provide text and scan for potential sensitive data.", "Review matches and select the ones to redact.", "Apply redaction and copy or download the result."]],
    limit: ["حداکثر ۲ میلیون نویسه. تشخیص با الگوهای متنی انجام می‌شود؛ موارد جاافتاده و تشخیص اشتباه ممکن است. نام، آدرس و همه انواع کلید یا شماره شناسایی تشخیص داده نمی‌شوند.", "Maximum 2 million characters. Pattern matching can miss data or report false positives. Names, addresses and all key or identity-number formats are not detected."],
  },
  "ai-input-preparer": {
    fa: ["آماده‌ساز ورودی هوش مصنوعی","متن یا فایل را بازبینی کنید، اطلاعات حساس را بپوشانید و متن آمادهٔ ارسال و بخش‌های متناسب با بودجهٔ تقریبی توکن بگیرید."],
    en: ["AI Input Preparer","Review pasted text or a file, redact sensitive information, and prepare chunks for an estimated token budget."],
    features: [["ورود TXT، Markdown، HTML یا DOCX","بازبینی و انتخاب موارد حساس","تخمین توکن و بخش‌بندی"],["Import TXT, Markdown, HTML or DOCX","Review and select sensitive matches","Estimated token counts and chunking"]],
    steps: [["متن یا یک فایل وارد کنید.","موارد حساس را بازبینی و انتخاب کنید.","بودجهٔ تقریبی توکن را تعیین و خروجی را دریافت کنید."],["Paste text or import one file.","Review and select sensitive matches.","Set an optional estimated token budget and export the result."]],
    limit: ["حداکثر ۲۰۰ هزار نویسه و ۲ مگابایت برای فایل. شمارش توکن تخمینی است و تشخیص اطلاعات حساس ممکن است مواردی را جا بیندازد.","Up to 200,000 characters and a 2 MB file. Token counts are estimates, and sensitive-data detection can miss matches."],
  },
  "ai-response-review": {
    fa: ["ارزیابی پاسخ‌های هوش مصنوعی","دو پاسخ را کنار هم بگذارید، تفاوت خطوط را ببینید و بر اساس معیارهای خودتان به آن‌ها امتیاز دهید."],
    en: ["AI Response Review","Compare two responses side by side and score them against your own criteria."],
    features: [["مقایسهٔ خط‌به‌خط","معیار و امتیاز دستی","گزارش Markdown"],["Line-by-line differences","Custom criteria and manual scoring","Markdown report"]],
    steps: [["دو پاسخ را وارد کنید.","تفاوت‌ها و معیارها را بررسی کنید و امتیاز و یادداشت بنویسید.","گزارش مقایسه را کپی یا دانلود کنید."],["Paste both responses.","Review the differences, add criteria, and enter scores and notes.","Copy or download the review report."]],
    limit: ["حداکثر ۲۰۰ هزار نویسه و ۲ هزار خط در هر پاسخ، با ۱۲ معیار. امتیازها و تشخیص درستی پاسخ با شماست.","Up to 200,000 characters and 2,000 lines per response, with up to 12 criteria. You assign scores and verify factual accuracy."],
  },
  "ai-output-extractor": {
    fa: ["استخراج فایل از پاسخ هوش مصنوعی","از پاسخ چت، JSON معتبر، جدول CSV و بلوک کد Markdown را جدا کنید و هر بخش را جداگانه بگیرید."],
    en: ["AI Output Extractor","Extract valid JSON, CSV tables, and Markdown code blocks from a chat response."],
    features: [["اعتبارسنجی JSON","تبدیل جدول Markdown به CSV","دانلود جداگانهٔ بخش‌ها"],["JSON validation","Markdown tables to CSV","Individual downloads"]],
    steps: [["پاسخ را در کادر وارد کنید.","فایل‌های قابل استخراج و خطاهای JSON را بررسی کنید.","بخش دلخواه یا متن کامل را دانلود کنید."],["Paste the response.","Review extracted files and JSON validation results.","Download the part you need or the full response."]],
    limit: ["تا ۲۰۰ هزار نویسه و ۱۰۰ بخش. جدول باید قالب Markdown و سطر جداکننده داشته باشد. بلوک‌های کد اجرا نمی‌شوند.","Up to 200,000 characters and 100 parts. Tables must include a Markdown delimiter row. Code blocks are never executed."],
  },
  "prompt-builder": {
    fa: ["سازندهٔ پرامپت","هدف، ورودی و قالب پاسخ را در یک قالب شخصی بچینید و بار بعد فقط فیلدهای متغیر را پر کنید."],
    en: ["Prompt Builder","Combine a goal, input, and response format in a reusable template with fillable fields."],
    features: [["فیلدهای متغیر فارسی و انگلیسی","ذخیرهٔ محلی قالب‌ها","کپی و دانلود پرامپت"],["Persian and English placeholders","Local template storage","Copy and download the prompt"]],
    steps: [["هدف، ورودی و قالب پاسخ را تعریف کنید.","برای فیلد متغیر از {{موضوع}} استفاده کنید و مقدار هر فیلد را بنویسید.","پرامپت نهایی را دریافت کنید یا قالب را برای بعد ذخیره کنید."],["Define your goal, input, and response format.","Use a placeholder like {{topic}} and fill in its value.","Export the prompt or save the template for later."]],
    limit: ["حداکثر ۳۰ قالب و ۸ هزار نویسه در هر بخش قالب یا مقدار فیلد. قالب‌ها فقط در همین مرورگر ذخیره می‌شوند.","Up to 30 templates and 8,000 characters per template section or field value. Templates are stored in this browser only."],
  },
} as const;
export type AiToolId = keyof typeof AI_TOOLS;
export function aiToolsContent(locale: "fa" | "en") {
  return Object.fromEntries(Object.entries(AI_TOOLS).map(([id, tool]) => [id, { title: tool[locale][0], description: tool[locale][1], badge: locale === "fa" ? "جدید" : "New" }])) as Record<AiToolId, { title: string; description: string; badge: string }>;
}
