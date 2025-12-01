// components/home/ToolsGrid.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileStack,
  Image as ImageIcon,
  Braces,    // آیکون JSON
  KeyRound,  // آیکون پسورد
  QrCode,    // آیکون QR
  ArrowLeft,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";

const tools = [
  {
    id: "pdf-merge",
    title: "ادغام فایل‌های PDF",
    description: "چندین فایل PDF را به سادگی بکشید و رها کنید تا به یک فایل واحد تبدیل شوند.",
    Icon: FileStack,
    href: "/tools/pdf-merge",
    status: "active",
    badge: "رایگان",
  },
  {
    id: "image-converter",
    title: "مبدل فرمت تصویر",
    description: "تبدیل JPG, PNG و WebP به یکدیگر با حفظ کیفیت بالا.",
    Icon: ImageIcon,
    href: "/tools/image-converter",
    status: "active",
    badge: "رایگان",
  },
  {
    id: "json-formatter", // آی‌دی یکتا
    title: "فرمت‌کننده JSON",
    description: "زیباسازی کدهای JSON به‌هم‌ریخته + نمایش گرافیکی (Visual Graph).",
    Icon: Braces,
    href: "/tools/json-formatter",
    status: "active",
    badge: "محبوب", // چون گراف داره، محبوبه!
  },
  {
    id: "password-gen",
    title: "تولیدکننده رمز عبور",
    description: "ساخت پسوردهای فوق‌امن و غیرقابل هک با یک کلیک.",
    Icon: KeyRound,
    href: "/tools/password-generator",
    status: "active",
    badge: "امنیتی",
  },
  {
    id: "qr-gen",
    title: "سازنده QR Code",
    description: "لینک و متن خود را به کدهای QR رنگی و قابل دانلود تبدیل کنید.",
    Icon: QrCode,
    href: "/tools/qr-generator",
    status: "active",
    badge: "رایگان",
  },
];

export default function ToolsGrid() {
  const theme = useThemeColors();

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link
            href={tool.href}
            className={`relative group block p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
            ${theme.card} ${theme.border}
            ${
              tool.status === "coming-soon"
                ? "opacity-60 grayscale pointer-events-none"
                : ""
            }`}
          >
            {/* آیکون */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors duration-300 ${theme.secondary}`}
            >
              <tool.Icon className={`w-7 h-7 ${theme.accent}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${theme.text}`}>
                  {tool.title}
                </h2>
                {tool.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border ${theme.border} ${theme.bg} ${theme.textMuted}`}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                {tool.description}
              </p>
            </div>

            {/* دکمه مخفی */}
            <div
              className={`mt-6 pt-6 border-t flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300 ${theme.border} ${theme.accent}`}
            >
              استفاده از ابزار <ArrowLeft size={16} className="mr-2" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
