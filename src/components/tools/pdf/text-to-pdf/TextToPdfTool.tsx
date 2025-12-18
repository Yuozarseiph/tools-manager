// components/tools/pdf/text-to-pdf/TextToPdfTool.tsx
"use client";

import { useState } from "react";
import {
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  FileText,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useTextToPdfContent,
  type TextToPdfToolContent,
} from "./text-to-pdf.content";

export default function TextToPdfTool() {
  const theme = useThemeColors();
  const content: TextToPdfToolContent = useTextToPdfContent();

  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    "right"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);

    try {
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfMake: any = pdfMakeModule.default || pdfMakeModule;

      const fontResponse = await fetch("/fonts/Vazirmatn-Regular.ttf");
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = btoa(
        new Uint8Array(fontBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      pdfMake.vfs = {
        "Vazir.ttf": fontBase64,
      };

      pdfMake.fonts = {
        Vazir: {
          normal: "Vazir.ttf",
          bold: "Vazir.ttf",
          italics: "Vazir.ttf",
          bolditalics: "Vazir.ttf",
        },
      };

      const hasPersianArabic = /[\u0600-\u06FF]/.test(text);
      const paragraphs = text.split("\n");

      const contentBody = paragraphs.map((para) => {
        if (!para.trim()) {
          return { text: " ", fontSize: fontSize * 0.3 };
        }

        return {
          text: para,
          fontSize: fontSize,
          alignment: alignment,
          direction: hasPersianArabic ? "rtl" : "ltr",
          margin: [0, 0, 0, fontSize * 0.3],
        };
      });

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
          font: "Vazir",
          fontSize: fontSize,
          lineHeight: 1.5,
        },
        content:
          contentBody.length > 0
            ? contentBody
            : [
                {
                  text: " ",
                  alignment: "center",
                },
              ],
      };

      pdfMake.createPdf(docDefinition as any).download("text-to-pdf.pdf");
    } catch (error) {
      console.error("PDF error:", error);
      alert(content.ui.alerts.error);
    } finally {
      setIsGenerating(false);
    }
  };

  const charCount = text.length;
  const lineCount = text.split("\n").length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        className={`p-4 rounded-xl border flex flex-wrap gap-4 items-center justify-between ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Type size={18} className={theme.textMuted} />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={`bg-transparent border rounded px-3 py-1.5 outline-none cursor-pointer ${theme.border} ${theme.text}`}
            >
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white dark:bg-gray-800"
                >
                  {size}pt
                </option>
              ))}
            </select>
          </div>

          <div className={`w-px h-6 ${theme.border} border-r`} />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAlignment("left")}
              className={`p-2 rounded transition-all ${
                alignment === "left"
                  ? theme.primary
                  : `${theme.textMuted} hover:${theme.secondary}`
              }`}
              title={content.ui.toolbar.alignLeftTitle}
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => setAlignment("center")}
              className={`p-2 rounded transition-all ${
                alignment === "center"
                  ? theme.primary
                  : `${theme.textMuted} hover:${theme.secondary}`
              }`}
              title={content.ui.toolbar.alignCenterTitle}
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => setAlignment("right")}
              className={`p-2 rounded transition-all ${
                alignment === "right"
                  ? theme.primary
                  : `${theme.textMuted} hover:${theme.secondary}`
              }`}
              title={content.ui.toolbar.alignRightTitle}
            >
              <AlignRight size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={generatePdf}
          disabled={!text.trim() || isGenerating}
          className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 ${theme.primary}`}
        >
          {isGenerating ? (
            <span className="text-sm">
              {content.ui.toolbar.generateButtonLoading}
            </span>
          ) : (
            <>
              <Download size={18} />
              {content.ui.toolbar.generateButtonIdle}
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={content.ui.editor.placeholder}
          className={`w-full h-[500px] p-6 rounded-xl border resize-none outline-none focus:ring-2 ${theme.card} ${theme.text} ${theme.border} ${theme.ring}`}
          style={{
            fontSize: `${fontSize}px`,
            textAlign: alignment,
            lineHeight: "1.5",
          }}
        />
        <div
          className={`absolute bottom-4 left-4 text-xs px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 ${theme.textMuted}`}
        >
          {charCount.toLocaleString("fa-IR")}{" "}
          {content.ui.editor.counterSuffixChars}{" "}
          {content.ui.editor.counterSeparator} {lineCount}{" "}
          {content.ui.editor.counterSuffixLines}
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${theme.card} ${theme.border}`}>
        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}>
          <FileText size={16} />
          {content.ui.guide.title}
        </h3>
        <ul className={`text-sm space-y-1 ${theme.textMuted} mr-6 list-disc`}>
          {content.ui.guide.items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
