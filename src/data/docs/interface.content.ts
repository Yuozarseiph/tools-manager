import { OUTPUT_NAME_TOOLS } from "@/lib/output-name";

export function hasNamedDownload(id: string) {
  return OUTPUT_NAME_TOOLS.has(id) || id === "bank-tools" || id === "html-to-pptx";
}

export const interfaceContent = {
  fa: {
    saveStep: "برای دریافت فایل خروجی، نام آن را در پنجرهٔ ذخیره انتخاب کنید و «ذخیره فایل» را بزنید؛ پسوند متناسب با فرمت خروجی اضافه می‌شود.",
    saveQuestion: "نام فایل خروجی را کجا انتخاب کنم؟",
    saveAnswer: "هنگام درخواست خروجی قابل دانلود و پس از آماده شدن فایل، پنجرهٔ ذخیره باز می‌شود. نام پیشنهادی را نگه دارید یا تغییر دهید؛ نام فارسی هم پذیرفته می‌شود و پسوند از فرمت خروجی گرفته می‌شود. با انصراف، دانلودی شروع نمی‌شود. این پنجره مخصوص خروجی دانلودی است و فایل‌های متصل به دیسک در ویرایشگر کد همچنان از کنترل‌های ذخیرهٔ همان ویرایشگر استفاده می‌کنند.",
    activityQuestion: "وضعیت فایل و پردازش را کجا ببینم؟",
    activityAnswer: "وضعیت خواندن فایل یا دریافت منابع کنار همان بخش ورودی یا خروجی نمایش داده می‌شود. پیشرفت و حجم کل، در صورت قابل اندازه‌گیری بودن، نمایش داده می‌شوند؛ پیام پردازش به‌صورت متن کوتاه داخل ابزار می‌آید. خواندن محلی به معنی آپلود نیست. پیام ارسال خروجی به مرورگر، تأیید ذخیره شدن آن روی دیسک نیست؛ محل نهایی ذخیره را مرورگر تعیین می‌کند.",
  },
  en: {
    saveStep: "To download the prepared output, choose its name in the save dialog and select Save file; the extension follows the output format.",
    saveQuestion: "Where do I choose the output filename?",
    saveAnswer: "When you request a downloadable export and the file is ready, the save dialog opens. Keep or edit the suggested name; Unicode names are supported and the extension follows the output format. Cancelling starts no download. This dialog applies to downloadable exports; code-editor files connected to disk still use the editor's own save controls.",
    activityQuestion: "Where can I see file and processing status?",
    activityAnswer: "File-reading and resource-download status appears beside the relevant input or output controls. Progress and total size appear when measurable; processing uses a short inline message in the tool. Local reading is not an upload. Sending an export to the browser does not confirm a disk write; the browser controls the final save location.",
  },
} as const;
