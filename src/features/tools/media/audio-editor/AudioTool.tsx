"use client";

import { useState } from "react";
import { AudioLines } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import AudioTrimTool from "./tools/AudioTrimTool";
import AudioVolumeTool from "./tools/AudioVolumeTool";
import AudioWaveformEqTool from "./tools/AudioWaveformEqTool";
import { useAudioEditorContent, type AudioEditorToolContent } from "./audio-editor.content";

const AUDIO_TABS = [
  { id: "trim" as const },
  { id: "volume" as const },
  { id: "equalizer" as const }
];

type TabId = (typeof AUDIO_TABS)[number]["id"];

export default function AudioTool() {
  const theme = useThemeColors();
  const content: AudioEditorToolContent = useAudioEditorContent();
  const [activeTab, setActiveTab] = useState<TabId>("trim");

  const tabsAny = (content.ui as any)?.tabs ?? {};

  return (
    <div className={`rounded-2xl p-4 sm:p-6 ${theme.card} ${theme.border}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.primary}`}>
          <AudioLines className="w-6 h-6 text-white" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-70">{content.ui.header.smallTitle}</span>
          <span className="text-sm opacity-80">{content.ui.header.subtitle}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {AUDIO_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? theme.primary : `${theme.card} ${theme.border}`
            }`}
            type="button"
          >
            {tab.id === "trim" && (tabsAny.trim ?? "Trim")}
            {tab.id === "volume" && (tabsAny.volume ?? "Volume")}
            {tab.id === "equalizer" && (tabsAny.equalizer ?? "Equalizer")}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {activeTab === "trim" && <AudioTrimTool />}
        {activeTab === "volume" && <AudioVolumeTool />}
        {activeTab === "equalizer" && <AudioWaveformEqTool />}
      </div>
    </div>
  );
}
