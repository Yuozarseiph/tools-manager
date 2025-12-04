"use client";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  ShieldCheck,
  Zap,
  Heart,
  Gift,
  Layers,
  Fingerprint,
  HelpCircle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        {/* --- Hero Section --- */}
        <div className="text-center mb-20">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 bg-blue-500/10 text-blue-600 dark:text-blue-400`}
          >
            <ShieldCheck size={16} />
            <span>شفاف، امن و همیشه رایگان</span>
          </div>
          <h1 className={`text-4xl md:text-6xl font-black mb-6 ${theme.text}`}>
            درباره{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tools Manager
            </span>
          </h1>
          <p
            className={`text-lg md:text-xl leading-loose max-w-3xl mx-auto ${theme.textMuted}`}
          >
            ما اینجا هستیم تا ابزارهایی کاربردی و رایگان ارائه بدیم که کار شما
            رو سریع، راحت و بدون دردسر انجام بدن. باور داریم هر ابزاری که
            می‌تواند رایگان باشد، نباید پولی شود و کاربران باید تجربه‌ای بدون
            تبلیغ، بدون ثبت‌نام و بدون ردیابی داشته باشند.
          </p>
        </div>

        {/* --- Philosophy Grid --- */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <FeatureCard
            icon={Gift}
            title="رایگان و واقعی"
            desc="همه ابزارهای ما کاملاً رایگان هستند، بدون محدودیت و تبلیغات مزاحم. هیچ مدل Freemium یا اشتراک پنهانی وجود ندارد."
            theme={theme}
            color="bg-green-500"
          />
          <FeatureCard
            icon={ShieldCheck}
            title="امنیت و حریم خصوصی"
            desc="هیچ داده‌ای از شما جمع‌آوری نمی‌شود. همه پردازش‌ها در مرورگر شما انجام می‌شود، بنابراین حتی اگر سایت هک شود، اطلاعاتی برای لو رفتن وجود ندارد."
            theme={theme}
            color="bg-blue-500"
          />
          <FeatureCard
            icon={Zap}
            title="استفاده سریع و ساده"
            desc="طراحی UI/UX تمیز و کاربرپسند باعث می‌شود ابزارها را به راحتی درک کنید و بدون دردسر از آن‌ها استفاده کنید."
            theme={theme}
            color="bg-amber-500"
          />
          <FeatureCard
            icon={Layers}
            title="یک ابزار واقعی و کاربردی"
            desc="این پروژه فراتر از نمونه کار است و به عنوان یک محصول مفید و کامل برای کاربران ساخته شده است."
            theme={theme}
            color="bg-purple-500"
          />
        </div>

        {/* --- Story Section --- */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 md:p-12 mb-24 border ${theme.border} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10`}
        >
          <div className="relative z-10">
            <h2 className={`text-3xl font-black mb-6 ${theme.text}`}>
              داستان پشت پروژه
            </h2>
            <div
              className={`space-y-6 text-lg leading-loose ${theme.textMuted}`}
            >
              <p>
                این پروژه با هدف ارائه ابزارهای کاربردی و رایگان شروع شد. هدف ما
                ساخت محصولی بود که مردم بتوانند بدون دغدغه و بدون از دست دادن
                زمان، کارهای خود را انجام دهند.
              </p>
              <p>
                این پروژه از صفر طراحی شده و هیچ ایده، کد یا ابزار پولی از
                دیگران استفاده نشده است. تمام طراحی‌ها و پیاده‌سازی‌ها شخصی و
                اختصاصی هستند تا بهترین تجربه ممکن را برای شما رقم بزنند.
              </p>
            </div>

            <div
              className={`mt-8 p-6 rounded-2xl border ${theme.border} bg-white/50 dark:bg-black/20 backdrop-blur-sm`}
            >
              <h3
                className={`font-bold text-xl mb-2 flex items-center gap-2 ${theme.text}`}
              >
                <Heart className="text-red-500 fill-red-500 animate-pulse" />{" "}
                دعوت به حمایت داوطلبانه
              </h3>
              <p className={`text-base ${theme.textMuted}`}>
                هدف ما ارائه رایگان ابزارهاست، اما اگر از پروژه رضایت دارید و
                می‌خواهید حمایت کنید، می‌توانید به صورت داوطلبانه کمک کنید. حتی
                کوچک‌ترین حمایت نشان‌دهنده قدردانی شما از تجربه‌ای است که بدون
                تبلیغ و بدون محدودیت دریافت کرده‌اید.
              </p>
              <a
                href="https://reymit.ir/yuozarseiph"
                target="_blank"
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/30"
              >
                حمایت از پروژه
              </a>
            </div>
          </div>

          {/* Decoration */}
          <Fingerprint className="absolute -right-10 -bottom-10 w-64 h-64 text-gray-200 dark:text-white/5 opacity-50 rotate-12" />
        </div>

        {/* --- FAQ Section --- */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`}
            >
              <HelpCircle size={24} />
            </div>
            <h2 className={`text-3xl font-black ${theme.text}`}>
              سوالات متداول
            </h2>
            <p className={`mt-2 ${theme.textMuted}`}>
              پاسخ به پرسش‌هایی که شاید برای شما هم پیش آمده باشد
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.q}
                answer={faq.a}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function FeatureCard({ icon: Icon, title, desc, theme, color }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${theme.card} ${theme.border} group`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10 text-opacity-100`}
      >
        <Icon size={24} className={color.replace("bg-", "text-")} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${theme.text}`}>{title}</h3>
      <p className={`text-sm leading-relaxed opacity-80 ${theme.textMuted}`}>
        {desc}
      </p>
    </div>
  );
}

function FAQItem({ question, answer, theme }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        isOpen ? "shadow-md" : ""
      } ${theme.card} ${theme.border}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-right font-bold text-lg transition-colors ${
          isOpen ? "text-blue-600" : theme.text
        }`}
      >
        {question}
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-600" : theme.textMuted
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`p-5 pt-0 leading-loose text-sm border-t ${theme.border} ${theme.textMuted}`}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Data ---

const faqs = [
  {
    q: "آیا برای استفاده از ابزارها باید ثبت‌نام کنم؟",
    a: "خیر، هیچ ثبت‌نامی لازم نیست. ما به تجربه کاربری بدون مانع اعتقاد داریم. همه ابزارها فوراً در مرورگر شما اجرا می‌شوند و نیازی به ارائه ایمیل یا اطلاعات شخصی نیست.",
  },
  {
    q: "آیا فایل‌ها یا داده‌های من روی سرور ذخیره می‌شوند؟",
    a: "خیر، این یکی از مهم‌ترین اصول ماست. تمام پردازش‌ها (مانند فشرده‌سازی عکس، تبدیل PDF و...) به صورت Client-Side و در مرورگر خودتان انجام می‌شود. هیچ فایلی آپلود نمی‌شود و هیچ اطلاعاتی از دستگاه شما خارج نمی‌گردد.",
  },
  {
    q: "آیا ابزارها محدودیت حجم دارند؟",
    a: "خیر، از آنجایی که پردازش در دستگاه خودتان انجام می‌شود، محدودیت حجم سرور وجود ندارد. تنها محدودیت، قدرت سخت‌افزاری (RAM و CPU) دستگاه شماست. ابزارها برای پردازش فایل‌های بزرگ بهینه‌سازی شده‌اند.",
  },
  {
    q: "آیا ابزارها تبلیغ دارند؟",
    a: "خیر، پروژه کاملاً رایگان و بدون تبلیغات مزاحم است. ما معتقدیم ابزارهای کاربردی باید تمیز و متمرکز بر انجام کار باشند، نه نمایش بنرهای تبلیغاتی.",
  },
  {
    q: "آیا می‌توانم فایل‌ها را به صورت آفلاین هم پردازش کنم؟",
    a: "بله، به دلیل معماری مدرن سایت (PWA و پردازش لوکال)، اکثر ابزارها پس از بارگذاری اولیه سایت، حتی بدون اتصال به اینترنت هم به درستی کار می‌کنند.",
  },
  {
    q: "آیا این پروژه کپی یا دزدیده شده است؟",
    a: "خیر، تمام ابزارها، رابط کاربری و کدنویسی‌ها حاصل تلاش شخصی و طراحی اختصاصی هستند. ما از هیچ قالب آماده یا کد دزدی استفاده نکرده‌ایم و هدفمان ارائه یک محصول اصیل و باکیفیت است.",
  },
  {
    q: "چرا رایگان ارائه شده است؟",
    a: "هدف ما کمک به جامعه وب و ارائه ابزارهای امن است. رایگان بودن یعنی کاربر تجربه‌ای بدون تبلیغ، بدون ردیابی و بدون دردسر داشته باشد. هزینه‌های سرور ناچیز است (چون پردازش سمت سرور نداریم) و حمایت‌های داوطلبانه کاربران برای ما ارزشمندترین دارایی است.",
  },
];
