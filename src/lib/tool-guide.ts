import { TOOLS, type Tool } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import docs from "@/data/docs/docs.content.json";
import { supplementalDocs } from "@/data/docs/supplemental.docs";
import type { Locale } from "./locale-detection";
import constraints from "@/data/tool-constraints.json";

type Doc = { id: string; title: string; description: string; features?: string[]; howItWorks?: string[] };
export function toolInfo(tool: Tool, locale: Locale) {
  const item = toolsContent[locale].items[tool.id as keyof typeof toolsContent.fa.items];
  const slug = tool.href.split("/").pop()!;
  const doc = [...docs[locale] as Doc[], ...supplementalDocs[locale]].find(entry => entry.id === slug || entry.id === tool.id);
  return { name: item?.title ?? doc?.title ?? slug, description: item?.description ?? doc?.description ?? "", doc };
}

export function networkNote(tool: Tool, locale: Locale): string {
  const fa = locale === "fa";
  if (tool.href.endsWith("/ip-checker")) return fa
    ? "برای نمایش IP و موقعیت تقریبی، درخواست به سرویس‌های ipapi، ip-api، ipify و ipwhois ارسال می‌شود؛ این سرویس‌ها IP شما را دریافت می‌کنند."
    : "IP and approximate location lookups send requests to ipapi, ip-api, ipify and ipwhois; these services receive your IP address.";
  if (tool.href.endsWith("/code-editor")) return fa
    ? "فایل‌های ویرایشگر کد در Local Storage مرورگر ذخیره می‌شوند؛ برای حذف آن‌ها از امکانات پاک‌سازی ویرایشگر یا تنظیمات مرورگر استفاده کنید."
    : "The code editor saves its files in browser local storage. Clear them using the editor controls or browser settings.";
  if (tool.category === "banking" || tool.href.endsWith("/bank")) return fa
    ? "مدیریت هزینه‌ها تراکنش‌های واردشده را در Local Storage مرورگر نگه می‌دارد. این اطلاعات به سرور QodeForge ارسال نمی‌شوند."
    : "The expense manager keeps entered transactions in browser local storage. They are not sent to a QodeForge server.";
  const remote = ["background-remover", "image-to-text", "audio-extractor"].includes(tool.href.split("/").pop()!);
  return fa
    ? `پردازش ورودی در مرورگر انجام می‌شود.${remote ? " بارگذاری اولیه مدل‌ها، بسته‌های زبان یا موتور پردازش به اینترنت نیاز دارد." : ""} ورود آدرس اینترنتی فایل، دریافت منابع خارجی یا نمایش محتوای دارای لینک خارجی ممکن است درخواست شبکه ایجاد کند.`
    : `Input processing takes place in your browser.${remote ? " Initial model, language pack or processing engine downloads require internet access." : ""} Loading a file URL, external resources or content containing external links can make network requests.`;
}

export function guideData(tool: Tool, locale: Locale) {
  const fa = locale === "fa";
  const info = toolInfo(tool, locale);
  const steps = fa ? [
    `ورودی موردنیاز «${info.name}» را در بخش ابزار وارد یا انتخاب کنید.`,
    "تنظیمات موجود را متناسب با نتیجه دلخواه انتخاب کنید.",
    "نتیجه و پیام‌های ابزار را بررسی کنید و در صورت وجود گزینه خروجی، آن را ذخیره کنید.",
  ] : [
    `Enter or select the input required by ${info.name}.`,
    "Choose the available settings for your intended result.",
    "Review the result and any messages, then save it if an export option is available.",
  ];
  const input = (constraints as Record<string, { acceptedFormats: string[]; maxFiles?: number }>)[tool.href.split("/").pop()!];
  const formatNote = input?.acceptedFormats.length ? `${fa ? "فرمت‌های ورودی" : "Accepted input formats"}: ${input.acceptedFormats.join(", ")}. ` : "";
  const countNote = input?.maxFiles ? `${fa ? "حداکثر تعداد فایل در هر انتخاب" : "Maximum files per selection"}: ${input.maxFiles}. ` : "";
  const limit = formatNote + countNote + (fa
    ? "فرمت‌های پذیرفته‌شده و محدودیت‌های ورودی در کنترل‌های همین ابزار مشخص‌اند. ظرفیت فایل و سرعت پردازش به حافظه و توان دستگاه بستگی دارد؛ خروجی را پیش از استفاده بررسی کنید."
    : "Accepted formats and input constraints are shown in this tool's controls. File capacity and processing speed depend on device memory and performance; review the output before use.");
  const faq = fa ? [
    ["آیا استفاده از این ابزار رایگان است؟", "بله؛ استفاده از ابزارهای فعال QodeForge رایگان است و به حساب کاربری نیاز ندارد."],
    ["پردازش داده کجا انجام می‌شود؟", networkNote(tool, locale)],
    ["محدودیت‌های ورودی و خروجی چیست؟", limit],
    ["اگر نتیجه مورد انتظار را نگرفتم چه کنم؟", "فرمت و تنظیمات ورودی را بررسی کنید؛ برای فایل‌های سنگین ورودی کوچک‌تری امتحان کنید و جزئیات خطا را از صفحه تماس گزارش دهید."],
    ["این ابزار چه قابلیت‌هایی دارد؟", info.doc?.features?.join("؛ ") || info.description],
  ] : [
    ["Is this tool free?", "Yes. Active QodeForge tools are free and do not require an account."],
    ["Where is my data processed?", networkNote(tool, locale)],
    ["What are the input and output limitations?", limit],
    ["What if the result is unexpected?", "Check the input format and settings; try a smaller input for large files and report error details through the contact page."],
    ["What can this tool do?", info.doc?.features?.join("; ") || info.description],
  ];
  const related = TOOLS.filter(other => other.status === "active" && other.category === tool.category && other.id !== tool.id).slice(0, 3);
  return { ...info, steps, limit, faq, related };
}
