// app/changelog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ArrowRight, Calendar, Rocket, Wrench, Bug, Sparkles } from "lucide-react";

// تایپ برای changelog items
type ChangelogEntry = {
  version: string;
  date: string;
  type: "release" | "update" | "fix";
  changes: {
    category: "added" | "improved" | "fixed";
    items: string[];
  }[];
};

// داده‌های changelog - فعلاً فقط نسخه فعلی
const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "1.3.0 BETA",
    date: "14 آذر 1404",
    type: "release",
    changes: [
      {
        category: "added",
        items: [
          "Color Picker با قابلیت استخراج پالت رنگی",
          "Code Visualizer برای JavaScript و C#",
          "Text to PDF با پشتیبانی کامل از فونت فارسی",
          "Image Compressor با فشرده‌سازی بهینه",
          "25+ ابزار کاربردی در دسته‌های مختلف"
        ]
      },
      {
        category: "improved",
        items: [
          "بهبود عملکرد کلی سایت",
          "طراحی رابط کاربری مدرن‌تر",
          "پشتیبانی کامل از حالت تاریک",
          "بهینه‌سازی برای موبایل"
        ]
      },
      {
        category: "fixed",
        items: [
          "رفع مشکلات سازگاری با مرورگرهای مختلف",
          "بهبود پردازش فایل‌های بزرگ"
        ]
      }
    ]
  }
];

export default function ChangelogPage() {
  const theme = useThemeColors();
  const [selectedVersion, setSelectedVersion] = useState<string>(CHANGELOG_DATA[0].version);

  const currentEntry = CHANGELOG_DATA.find(e => e.version === selectedVersion) || CHANGELOG_DATA[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "added": return <Sparkles size={16} className="text-green-500" />;
      case "improved": return <Wrench size={16} className="text-blue-500" />;
      case "fixed": return <Bug size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "added": return "اضافه شده";
      case "improved": return "بهبود یافته";
      case "fixed": return "رفع شده";
      default: return "";
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        
        {/* هدر */}
        <div className="mb-8 lg:mb-12">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
          >
            <ArrowRight size={16} /> بازگشت به خانه
          </Link>

          <div className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden ${theme.card} ${theme.border}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${theme.secondary}`}>
                  <Rocket size={28} className={theme.accent} />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                  تاریخچه تغییرات
                </h1>
              </div>
              <p className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}>
                آخرین بروزرسانی‌ها، ویژگی‌های جدید و بهبودهای Tools Manager
              </p>
            </div>
            
            {/* دکوریشن */}
            <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`} />
            <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`} />
          </div>
        </div>

        {/* محتوا */}
        <div className="space-y-6">
          
          {/* نسخه فعلی */}
          <div className={`rounded-2xl border p-8 ${theme.card} ${theme.border}`}>
            
            {/* هدر نسخه */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-dashed border-opacity-30">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={`text-2xl font-bold ${theme.text}`}>
                    نسخه {currentEntry.version}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.primary}`}>
                    جاری
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${theme.textMuted}`}>
                  <Calendar size={14} />
                  <span>{currentEntry.date}</span>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-xl border ${theme.secondary} ${theme.border}`}>
                <span className={`text-xs font-bold ${theme.accent}`}>BETA</span>
              </div>
            </div>

            {/* تغییرات */}
            <div className="space-y-8">
              {currentEntry.changes.map((changeGroup, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-4">
                    {getCategoryIcon(changeGroup.category)}
                    <h3 className={`text-lg font-bold ${theme.text}`}>
                      {getCategoryTitle(changeGroup.category)}
                    </h3>
                  </div>
                  
                  <ul className="space-y-2 mr-6">
                    {changeGroup.items.map((item, itemIdx) => (
                      <li key={itemIdx} className={`flex items-start gap-3 text-sm ${theme.textMuted}`}>
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${theme.accent}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* پیام برای آینده */}
          <div className={`rounded-2xl border p-6 text-center ${theme.card} ${theme.border}`}>
            <p className={`text-sm ${theme.textMuted}`}>
              📅 تاریخچه کامل تغییرات پس از انتشار نسخه نهایی منتشر خواهد شد
            </p>
          </div>

          {/* Footer */}
          <div className={`text-center py-6 ${theme.textMuted}`}>
            <p className="text-sm">
              سوال یا پیشنهادی دارید؟{" "}
              <Link href="/contact" className={`font-bold hover:underline ${theme.accent}`}>
                تماس با ما
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
