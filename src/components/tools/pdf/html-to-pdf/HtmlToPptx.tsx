// components/tools/HtmlToPptx/HtmlToPptx.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileCode2,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useHtmlToPptxContent,
  type HtmlToPptxToolContent,
} from "./html-to-pptx.content";
import {
  parseHtmlToSlides,
  type SlideModel,
  type CssSubset,
} from "./HtmlParser";

type ProgressStep = "idle" | "preparing" | "exporting" | "success";

// ثابت‌های هندسی اسلاید (اینچ)
const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625;
const TOP_MARGIN = 0.7;
const BOTTOM_MARGIN = 0.7;
const SIDE_MARGIN = 0.7;

// --- Helpers مربوط به PptxGenJS ---

// تبدیل px تقریبی به pt (۹۶dpi → حدوداً 0.75pt برای هر px)
function pxToPt(px?: number): number | undefined {
  if (!px) return undefined;
  return Math.round(px * 0.75);
}

// تبدیل rgb(...) یا #rrggbb به هگز شش‌رقمی بدون #
function cssColorToHex(color?: string): string | undefined {
  if (!color) return undefined;
  color = color.trim();

  // rgb(255, 0, 0) / rgba(...)
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch
      .slice(1, 4)
      .map((n) => Math.max(0, Math.min(255, parseInt(n, 10))))
      .map((n) => n.toString(16).padStart(2, "0"));
    return `${r}${g}${b}`.toUpperCase();
  }

  // #rgb یا #rrggbb
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length === 6) {
      return hex.toUpperCase();
    }
  }

  return undefined;
}

// مپ CSS ساده به optionهای متن PptxGenJS
function cssToTextOptions(css: CssSubset): any {
  const fontSize = pxToPt(css.fontSize) ?? 18;
  const color = cssColorToHex(css.color) ?? "444444";
  const align =
    css.textAlign === "center"
      ? "center"
      : css.textAlign === "left"
      ? "left"
      : "right";

  const bold = css.fontWeight ? css.fontWeight >= 600 : false;

  return {
    fontSize,
    color,
    bold,
    align,
  };
}

function normaliseFileName(name: string): string {
  const trimmed = name.trim() || "slides";
  return trimmed.toLowerCase().endsWith(".pptx") ? trimmed : `${trimmed}.pptx`;
}

// رندر یک SlideModel روی PptxGenJS
function renderSlide(pptx: any, slideModel: SlideModel): void {
  // تابع کمکی: ساخت یک اسلاید تازه با بک‌گراند مناسب
  const createSlide = () => {
    const slide = pptx.addSlide();

    if (slideModel.type === "title") {
      slide.background = { color: "BD582C" };
    } else if (slideModel.type === "section") {
      slide.background = { color: "E48312" };
    } else if (slideModel.type === "end") {
      slide.background = { color: "BD582C" };
    } else {
      slide.background = { color: "FFFFFF" };
    }

    return slide;
  };

  let slide = createSlide();
  let cursorY = TOP_MARGIN;

  const headingColor = slideModel.type === "content" ? "BD582C" : "FFFFFF";
  const bodyColor = slideModel.type === "content" ? "444444" : "FFFFFF";

  // چک کردن اینکه جا داریم یا نه، اگر نه اسلاید جدید بساز
  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > SLIDE_HEIGHT - BOTTOM_MARGIN) {
      slide = createSlide();
      cursorY = TOP_MARGIN;
    }
  };

  slideModel.blocks.forEach((block) => {
    // --- جدول ---
    if (block.kind === "table" && block.rows && block.rows.length) {
      const estimatedHeight = 0.4 * block.rows.length + 0.4; // تخمین ساده ارتفاع جدول (اینچ)

      ensureSpace(estimatedHeight);

      const tableData = block.rows.map((row, rowIndex) =>
        row.map((cellText) => ({
          text: cellText,
          options: {
            bold: rowIndex === 0,
            fontSize: 12,
            color: rowIndex === 0 ? "FFFFFF" : "111111",
            fill: rowIndex === 0 ? "BD582C" : "FFFFFF",
          },
        }))
      );

      slide.addTable(tableData as any, {
        x: SIDE_MARGIN,
        y: cursorY,
        w: SLIDE_WIDTH - SIDE_MARGIN * 2,
        border: { color: "CCCCCC", pt: 1 },
      });

      cursorY += estimatedHeight + 0.2;
      return;
    }

    const baseOpts = cssToTextOptions(block.css);
    let height = 0.5;

    // ارتفاع تقریبی هر نوع بلاک
    if (block.kind === "heading") {
      height = 0.8;
    } else if (block.kind === "paragraph") {
      height = 0.7;
    } else if (block.kind === "listItem") {
      height = 0.5;
    }

    ensureSpace(height);

    // --- heading ---
    if (block.kind === "heading" && block.text) {
      const level = block.headingLevel ?? 1;
      const fontSize =
        level === 1 ? 32 : level === 2 ? 26 : level === 3 ? 22 : 20;

      slide.addText(block.text, {
        x: SIDE_MARGIN,
        y: cursorY,
        w: SLIDE_WIDTH - SIDE_MARGIN * 2,
        h: height,
        ...baseOpts,
        fontSize,
        bold: true,
        color: headingColor,
      });
    }

    // --- paragraph ---
    else if (block.kind === "paragraph" && block.text) {
      slide.addText(block.text, {
        x: SIDE_MARGIN,
        y: cursorY,
        w: SLIDE_WIDTH - SIDE_MARGIN * 2,
        h: height,
        ...baseOpts,
        color: bodyColor,
      });
    }

    // --- list item ---
    else if (block.kind === "listItem" && block.text) {
      const level = block.listLevel ?? 1;
      const indent = SIDE_MARGIN + (level - 1) * 0.4;

      slide.addText(block.text, {
        x: indent,
        y: cursorY,
        w: SLIDE_WIDTH - indent - SIDE_MARGIN,
        h: height,
        ...baseOpts,
        color: bodyColor,
        bullet: true,
      });
    }

    cursorY += height + 0.1;
  });
}

// --- کامپوننت اصلی UI ---

export default function HtmlToPptxTool() {
  const theme = useThemeColors();
  const content: HtmlToPptxToolContent = useHtmlToPptxContent();

  const [htmlSource, setHtmlSource] = useState("");
  const [fileName, setFileName] = useState("slides.pptx");
  const [isConverting, setIsConverting] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");
  const [error, setError] = useState("");

  const hasContent = !!htmlSource.trim();
  const showProgress = progressStep !== "idle";

  const progressMessage =
    progressStep === "idle" ? "" : content.ui.progress[progressStep];

  const progressWidth = (() => {
    switch (progressStep) {
      case "preparing":
        return "40%";
      case "exporting":
        return "80%";
      case "success":
        return "100%";
      default:
        return "0%";
    }
  })();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isHtml =
      lower.endsWith(".html") ||
      lower.endsWith(".htm") ||
      file.type === "text/html";

    if (!isHtml) {
      setError(content.ui.errors.invalidType);
      setHtmlSource("");
      return;
    }

    setError("");
    setProgressStep("preparing");
    setFileName(
      (file.name.replace(/\.(html?|txt)$/i, "") || "slides") + ".pptx"
    );

    try {
      const text = await file.text();
      if (!text.trim()) {
        setError(content.ui.errors.emptyContent);
        setHtmlSource("");
        setProgressStep("idle");
        return;
      }

      // اگر فایل کامل HTML بود، فقط بدنه را بگیریم
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const finalHtml = bodyMatch ? bodyMatch[1] : text;

      setHtmlSource(finalHtml);
      setProgressStep("idle");
    } catch (err) {
      console.error("File read error:", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    }
  };

  const handleConvert = async () => {
    if (!hasContent) return;

    setIsConverting(true);
    setError("");
    setProgressStep("preparing");

    try {
      const PptxGenJS = (await import("pptxgenjs")).default as any;
      const pptx = new PptxGenJS();

      const slideModels: SlideModel[] = parseHtmlToSlides(htmlSource);

      if (!slideModels.length) {
        throw new Error("هیچ اسلاید معتبری در HTML پیدا نشد.");
      }

      setProgressStep("exporting");

      slideModels.forEach((sm) => renderSlide(pptx, sm));

      await pptx.writeFile({
        fileName: normaliseFileName(fileName),
      });

      setProgressStep("success");
    } catch (err) {
      console.error("PPTX export error:", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (progressStep === "success") {
      const timeout = setTimeout(() => {
        setProgressStep("idle");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [progressStep]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        {/* چپ: ورودی‌ها */}
        <div className="space-y-4">
          {/* آپلود فایل HTML */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${theme.border} hover:opacity-80`}
          >
            <input
              type="file"
              accept=".html,.htm,text/html"
              onChange={handleFileSelect}
              className="hidden"
              id="html-upload"
              disabled={isConverting}
            />
            <label
              htmlFor="html-upload"
              className="cursor-pointer block w-full h-full"
            >
              <Upload className={`mx-auto h-10 w-10 mb-3 ${theme.textMuted}`} />
              <p className={`text-base font-medium ${theme.text}`}>
                {content.ui.upload.title}
              </p>
              <p className={`text-sm mt-1 ${theme.textMuted}`}>
                {content.ui.upload.subtitle}
              </p>
            </label>
          </div>

          {/* textarea برای HTML خام */}
          <div
            className={`rounded-lg border ${theme.border} ${theme.card} p-4 space-y-2`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileCode2 size={18} className={theme.textMuted} />
              <span className={`text-sm font-medium ${theme.text}`}>
                {content.ui.editor.title}
              </span>
            </div>
            <textarea
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              placeholder={content.ui.editor.placeholder}
              className={`
                w-full h-52 resize-y rounded-md border px-3 py-2 text-xs sm:text-sm font-mono
                ${theme.card} ${theme.border} ${theme.text}
              `}
              spellCheck={false}
            />
            <p className={`text-[11px] text-right ${theme.textMuted}`}>
              {content.ui.editor.hint}
            </p>
          </div>

          {/* نام فایل + دکمه تبدیل */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className={`text-xs sm:text-sm ${theme.textMuted}`}>
                {content.ui.filename.label}
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className={`
                  flex-1 rounded-md border px-3 py-2 text-xs sm:text-sm
                  ${theme.card} ${theme.border} ${theme.text}
                `}
              />
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting || !hasContent}
              className={`
                w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${theme.primary}
              `}
            >
              <Download size={18} />
              {isConverting
                ? content.ui.buttons.convertLoading
                : content.ui.buttons.convertIdle}
            </button>
          </div>

          {/* خطا */}
          {error && (
            <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3">
              <AlertCircle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Progress */}
          {showProgress && (
            <div
              className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
            >
              <p className={`text-sm font-medium mb-2 ${theme.text}`}>
                {progressMessage}
              </p>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          )}

          {/* راهنما */}
          <div
            className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
          >
            <h3 className={`font-medium mb-3 ${theme.text}`}>
              {content.ui.guide.title}
            </h3>
            <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
              {content.ui.guide.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* راست: پیش‌نمایش به صورت بلوک کد */}
        <div
          id="html-to-pptx-preview-root"
          className={`
            rounded-xl border ${theme.border} ${theme.card}
            shadow-sm overflow-auto min-h-[260px] max-h-[600px]
          `}
        >
          <div className="px-4 py-3 border-b border-slate-200/60 flex items-center gap-2 bg-white dark:bg-slate-900">
            <FileText size={18} className={theme.textMuted} />
            <span className={`text-sm font-medium ${theme.text}`}>
              {content.ui.preview.title}
            </span>
          </div>
          <div className="px-5 py-4 bg-white dark:bg-slate-900">
            {hasContent ? (
              <pre
                className={`
                  text-xs sm:text-sm font-mono whitespace-pre-wrap break-all
                  ${theme.text}
                `}
                dir="ltr"
              >
                {htmlSource}
              </pre>
            ) : (
              <div
                className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
              >
                {content.ui.preview.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
