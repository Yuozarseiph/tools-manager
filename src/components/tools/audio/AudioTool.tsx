"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AudioLines } from "lucide-react";
import AudioTrimTool from "./tools/AudioTrimTool";
import AudioVolumeTool from "./tools/AudioVolumeTool";
import {
  useToolContent,
  type AudioEditorToolContent
} from "@/hooks/useToolContent";

const AUDIO_TABS = [
  { id: "trim" as const },
  { id: "volume" as const }
];

type TabId = (typeof AUDIO_TABS)[number]["id"];

export default function AudioTool() {
  const theme = useThemeColors();
  const content =
    useToolContent<AudioEditorToolContent>("audio-editor");
  const [activeTab, setActiveTab] =
    useState<TabId>("trim");

  return (
    <div className={`space-y-4 ${theme.bg}`}>
      {/* سربرگ کوچک ابزار */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-lg ${theme.secondary}`}>
          <AudioLines
            size={18}
            className={theme.accent}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${theme.text}`}
          >
            {content.ui.header.smallTitle}
          </p>
          <p
            className={`text-xs ${theme.textMuted}`}
          >
            {content.ui.header.subtitle}
          </p>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex flex-wrap gap-2 mb-2">
        {AUDIO_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? theme.primary
                : `${theme.card} ${theme.border}`
            }`}
          >
            {tab.id === "trim"
              ? content.ui.tabs.trim
              : content.ui.tabs.volume}
          </button>
        ))}
      </div>

      {/* محتوای تب‌ها */}
      <div
        className={`rounded-2xl border p-4 md:p-6 min-h-[320px] ${theme.card} ${theme.border}`}
      >
        {activeTab === "trim" && <AudioTrimTool />}
        {activeTab === "volume" && <AudioVolumeTool />}
      </div>
    </div>
  );
}
