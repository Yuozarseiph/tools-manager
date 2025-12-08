"use client";

import { useState, useMemo } from "react";
import { Trash2, Copy, Check, Clock, AlignLeft } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useWordCounterContent,
  type WordCounterToolContent,
} from "./word-counter.content";

export default function WordCounterTool() {
  const theme = useThemeColors();
  const content: WordCounterToolContent = useWordCounterContent();

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const cleanText = text.trim();
    if (!cleanText) {
      return {
        words: 0,
        chars: 0,
        charsNoSpace: 0,
        sentences: 0,
        paragraphs: 0,
        time: 0,
      };
    }

    const words = cleanText.split(/\s+/).filter((w) => w !== "").length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = cleanText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const paragraphs = cleanText
      .split(/\n+/)
      .filter((p) => p.trim().length > 0).length;
    const time = Math.ceil(words / 200);

    return {
      words,
      chars,
      charsNoSpace,
      sentences,
      paragraphs,
      time,
    };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* ادیتور متن */}
      <div
        className={`lg:col-span-2 flex flex-col rounded-3xl border shadow-sm overflow-hidden h-[500px] ${theme.card} ${theme.border}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${theme.border} ${theme.bg}`}
        >
          <span className={`font-bold text-sm ${theme.text}`}>
            {content.ui.editor.title}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setText("")}
              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title={content.ui.buttons.clearTitle}
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                copied ? "bg-green-100 text-green-700" : theme.secondary
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? content.ui.buttons.copied : content.ui.buttons.copy}
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={content.ui.editor.placeholder}
          className={`flex-1 w-full p-6 resize-none focus:outline-none text-lg leading-relaxed bg-transparent ${theme.text}`}
        />
      </div>

      {/* آمار */}
      <div className="space-y-4">
        <div
          className={`p-6 rounded-3xl border space-y-6 ${theme.card} ${theme.border}`}
        >
          <h3
            className={`font-bold text-lg flex items-center gap-2 ${theme.text}`}
          >
            <AlignLeft size={20} className={theme.accent} />
            {content.ui.stats.title}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <StatBox
              label={content.ui.stats.words}
              value={stats.words}
              theme={theme}
            />
            <StatBox
              label={content.ui.stats.chars}
              value={stats.chars}
              theme={theme}
            />
            <StatBox
              label={content.ui.stats.charsNoSpace}
              value={stats.charsNoSpace}
              theme={theme}
            />
            <StatBox
              label={content.ui.stats.sentences}
              value={stats.sentences}
              theme={theme}
            />
            <StatBox
              label={content.ui.stats.paragraphs}
              value={stats.paragraphs}
              theme={theme}
            />
          </div>
        </div>

        <div
          className={`p-6 rounded-3xl border flex items-center gap-4 ${theme.card} ${theme.border}`}
        >
          <div className={`p-3 rounded-full ${theme.secondary}`}>
            <Clock size={24} className={theme.accent} />
          </div>
          <div>
            <p className={`text-xs font-bold ${theme.textMuted}`}>
              {content.ui.readingTime.label}
            </p>
            <p className={`text-xl font-black ${theme.text}`}>
              {stats.time}{" "}
              <span className="text-sm font-normal">
                {content.ui.readingTime.unit}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, theme }: any) {
  return (
    <div className={`p-3 rounded-xl border ${theme.bg} ${theme.border}`}>
      <p className={`text-xs font-medium mb-1 ${theme.textMuted}`}>{label}</p>
      <p className={`text-2xl font-black ${theme.text}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
