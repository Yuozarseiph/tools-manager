"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AudioLines } from "lucide-react";
import AudioTrimTool from "./tools/AudioTrimTool";

const AUDIO_TABS = [
  { id: "trim" as const, label: "برش صدا (بتا)" },
  // در آینده: { id: "convert", label: "تبدیل فرمت" } و ...
];

type TabId = (typeof AUDIO_TABS)[number]["id"];

export default function AudioTool() {
  const theme = useThemeColors();
  const [activeTab, setActiveTab] = useState<TabId>("trim");

  return (
    <div className={`space-y-4 ${theme.bg}`}>
      {/* سربرگ کوچک ابزار */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-lg ${theme.secondary}`}>
          <AudioLines size={18} className={theme.accent} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${theme.text}`}>ابزارهای صوتی</p>
          <p className={`text-xs ${theme.textMuted}`}>
            همه پردازش‌ها فقط روی دستگاه شما انجام می‌شود.
          </p>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 mb-2">
        {AUDIO_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                activeTab === tab.id
                  ? theme.primary
                  : `${theme.card} ${theme.border} hover:${theme.secondary}`
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* محتوای تب‌ها */}
      <div
        className={`rounded-2xl border p-4 md:p-6 min-h-[320px] ${theme.card} ${theme.border}`}
      >
        {activeTab === "trim" && <AudioTrimTool />}
      </div>
    </div>
  );
}
