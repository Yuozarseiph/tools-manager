"use client";

import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ArrowRight, Calendar, Rocket, Wrench, Bug, Sparkles } from "lucide-react";
import { CHANGELOG_DATA, ChangelogEntry } from "@/data/changelog";

export default function ChangelogPage() {
  const theme = useThemeColors();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "added":
        return <Sparkles size={16} className="text-green-500" />;
      case "improved":
        return <Wrench size={16} className="text-blue-500" />;
      case "fixed":
        return <Bug size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "added":
        return "اضافه شده";
      case "improved":
        return "بهبود یافته";
      case "fixed":
        return "رفع شده";
      default:
        return "";
    }
  };

  const isLatest = (entry: ChangelogEntry, index: number) => index === 0;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
          >
            <ArrowRight size={16} /> بازگشت به خانه
          </Link>

          <div
            className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden ${theme.card} ${theme.border}`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${theme.secondary}`}>
                  <Rocket size={28} className={theme.accent} />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                  تاریخچه تغییرات
                </h1>
              </div>
              <p
                className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}
              >
                آخرین بروزرسانی‌ها، ویژگی‌های جدید و بهبودهای Tools Manager
              </p>
            </div>

            <div
              className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
            />
            <div
              className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
            />
          </div>
        </div>

        <div className="space-y-6">
          {CHANGELOG_DATA.map((entry, index) => (
            <div
              key={entry.version}
              className={`rounded-2xl border p-8 ${theme.card} ${theme.border}`}
            >
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-dashed border-opacity-30">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-2xl font-bold ${theme.text}`}>
                      نسخه {entry.version}
                    </h2>
                    {isLatest(entry, index) && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${theme.primary}`}
                      >
                        جاری
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${theme.textMuted}`}
                  >
                    <Calendar size={14} />
                    <span>{entry.date}</span>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border ${theme.secondary} ${theme.border}`}
                >
                  <span className={`text-xs font-bold ${theme.accent}`}>
                    {entry.type === "release" ? "RELEASE" : "BETA"}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {entry.changes.map((changeGroup, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(changeGroup.category)}
                      <h3 className={`text-lg font-bold ${theme.text}`}>
                        {getCategoryTitle(changeGroup.category)}
                      </h3>
                    </div>

                    <ul className="space-y-2 mr-6">
                      {changeGroup.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className={`flex items-start gap-3 text-sm ${theme.textMuted}`}
                        >
                          <span
                            className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${theme.accent}`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div
            className={`rounded-2xl border p-6 text-center ${theme.card} ${theme.border}`}
          >
            <p className={`text-sm ${theme.textMuted}`}>
              📅 تاریخچه کامل تغییرات نسخه‌های قدیمی‌تر در آینده به این صفحه
              اضافه خواهد شد.
            </p>
          </div>

          <div className={`text-center py-6 ${theme.textMuted}`}>
            <p className="text-sm">
              سوال یا پیشنهادی دارید؟{" "}
              <Link
                href="/contact"
                className={`font-bold hover:underline ${theme.accent}`}
              >
                تماس با ما
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
