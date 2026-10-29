"use client";
import { usePanelPresence } from "@/hooks/usePanelPresence";


import { useEffect } from "react";
import { X } from "lucide-react";

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
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const presence = usePanelPresence(isOpen);
  if (!presence.present) return null;

  const content = helpContent[locale as "fa" | "en"][type];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      {...presence.attributes}
      aria-modal="true"
      aria-labelledby="help-dialog-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg overflow-hidden rounded-[26px] border shadow-2xl ${theme.card} ${theme.border}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${theme.border}`}
        >
          <h3
            id="help-dialog-title"
            className={`text-lg font-black ${theme.text}`}
          >
            {content.title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.secondary} ${theme.text}`}
            aria-label={locale === "fa" ? "بستن" : "Close"}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-3 sm:p-4">
          <div className="grid gap-2">
            {content.sections.map((section: any, index: number) => {
              const Icon = section.icon;

              return (
                <div
                  key={`${section.title}-${index}`}
                  className={`flex gap-4 rounded-[18px] border p-4 ${theme.border}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                  >
                    <Icon size={18} className={theme.accent} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-sm font-black ${theme.text}`}>
                      {section.title}
                    </h4>
                    <p className={`mt-1.5 text-xs leading-6 ${theme.textMuted}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
