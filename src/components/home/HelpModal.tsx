// components/home/HelpModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  X
} from "lucide-react";

import { helpContent } from "./HelpContent";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
  locale: string;
  type: "pinned" | "export" | "import" | "general";
}

export default function HelpModal({
  isOpen,
  onClose,
  theme,
  locale,
  type,
}: HelpModalProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  if (!isOpen) return null;

  const content = helpContent[locale as "fa" | "en"][type];
  const isRTL = locale === "fa";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${theme.card} ${theme.border} max-w-md w-full max-h-[80vh] overflow-hidden rounded-2xl border shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${theme.border}`}
        >
          <h3 className={`text-lg font-bold ${theme.text}`}>{content.title}</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {content.sections.map((section: any, idx: number) => {
            const Icon = section.icon;
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${theme.secondary}`}
                >
                  <Icon size={20} className={theme.accent} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${theme.text} mb-1`}>
                    {section.title}
                  </h4>
                  <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
                    {section.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
