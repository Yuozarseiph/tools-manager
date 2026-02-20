"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Code2, Type, Copy, Check } from "lucide-react";

export default function HTMLToText() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [htmlInput, setHtmlInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [removeLinks, setRemoveLinks] = useState(false);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [copied, setCopied] = useState(false);

  const convertToText = () => {
    if (!htmlInput.trim()) return;

    // Create temporary element
    const temp = document.createElement("div");
    temp.innerHTML = htmlInput;

    // Remove script and style tags
    temp.querySelectorAll("script, style").forEach((el) => el.remove());

    // Remove links if needed
    if (removeLinks) {
      temp.querySelectorAll("a").forEach((el) => {
        el.replaceWith(el.textContent || "");
      });
    }

    let text = temp.textContent || temp.innerText || "";

    // Preserve formatting
    if (preserveFormatting) {
      text = text.replace(/\n\s*\n/g, "\n\n"); // Remove extra blank lines
    } else {
      text = text.replace(/\s+/g, " ").trim(); // Remove all extra whitespace
    }

    setTextOutput(text);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HTML Input */}
      <div>
        <label
          className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme.text}`}
        >
          <Code2 size={16} />
          {content.htmlToText.htmlInput}
        </label>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={10}
          placeholder="<h1>عنوان</h1><p>متن شما...</p>"
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm`}
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeLinks}
            onChange={(e) => setRemoveLinks(e.target.checked)}
            className="w-5 h-5"
          />
          <span className={theme.text}>{content.htmlToText.removeLinks}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={preserveFormatting}
            onChange={(e) => setPreserveFormatting(e.target.checked)}
            className="w-5 h-5"
          />
          <span className={theme.text}>
            {content.htmlToText.preserveFormatting}
          </span>
        </label>
      </div>

      {/* Convert Button */}
      <button
        onClick={convertToText}
        disabled={!htmlInput.trim()}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white disabled:opacity-50`}
      >
        <Type size={20} />
        {content.common.convert}
      </button>

      {/* Text Output */}
      {textOutput && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              className={`text-sm font-medium flex items-center gap-2 ${theme.text}`}
            >
              <Type size={16} />
              {content.htmlToText.textOutput}
            </label>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? content.common.copied : content.common.copy}
            </button>
          </div>
          <textarea
            value={textOutput}
            readOnly
            rows={10}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
      )}
    </div>
  );
}
