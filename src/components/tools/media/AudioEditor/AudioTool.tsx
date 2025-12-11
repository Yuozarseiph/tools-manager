"use client";

import { useState } from "react";
import { AudioLines } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import AudioTrimTool from "./tools/AudioTrimTool";
import AudioVolumeTool from "./tools/AudioVolumeTool";
import {
  useAudioEditorContent,
  type AudioEditorToolContent,
} from "./audio-editor.content";

const AUDIO_TABS = [
  { id: "trim" as const },
  { id: "volume" as const },
];

type TabId = (typeof AUDIO_TABS)[number]["id"];

export default function AudioTool() {
  const theme = useThemeColors();
  const content: AudioEditorToolContent = useAudioEditorContent();
  const [activeTab, setActiveTab] = useState<TabId>("trim");

  return (
    <div className={`rounded-2xl p-4 sm:p-6 ${theme.card} ${theme.border}`}>
      {/* سربرگ کوچک ابزار */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.primary}`}
        >
          <AudioLines className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-70">
            {content.ui.header.smallTitle}
          </span>
          <span className="text-sm opacity-80">
            {content.ui.header.subtitle}
          </span>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex gap-2 mb-4">
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
      <div className="mt-2">
        {activeTab === "trim" && <AudioTrimTool  />}
        {activeTab === "volume" && <AudioVolumeTool />}
      </div>
    </div>
  );
}
