// components/tools/presentation/html-to-pptx/HtmlToPptxTool.tsx
"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Upload,
  FileCode2,
  Download,
  AlertCircle,
  FileText,
  Palette,
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
  type TextRun,
} from "./HtmlParser";

type ProgressStep = "idle" | "preparing" | "exporting" | "success";

const SLIDE_WIDTH = 10;
const SLIDE_HEIGHT = 5.625;
const TOP_MARGIN = 0.7;
const BOTTOM_MARGIN = 0.7;
const SIDE_MARGIN = 0.7;

function pxToPt(px?: number): number | undefined {
  if (!px) return undefined;
  return Math.round(px * 0.75);
}

function cssColorToHex(color?: string): string | undefined {
  if (!color) return undefined;
  color = color.trim();

  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch
      .slice(1, 4)
      .map((n) => Math.max(0, Math.min(255, parseInt(n, 10))))
      .map((n) => n.toString(16).padStart(2, "0"));
    return `${r}${g}${b}`.toUpperCase();
  }

  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length === 6) return hex.toUpperCase();
  }

  return undefined;
}

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

  return { fontSize, color, bold, align };
}

function normaliseFileName(name: string): string {
  const trimmed = name.trim() || "slides";
  return trimmed.toLowerCase().endsWith(".pptx") ? trimmed : `${trimmed}.pptx`;
}

function extractBgClass(classString: string): string | undefined {
  const parts = (classString || "").split(/\s+/).filter(Boolean);
  return parts.find((c) => c.startsWith("bg-"));
}

function normaliseRuns(runs: TextRun[] | undefined): TextRun[] | undefined {
  if (!runs?.length) return undefined;

  const out: TextRun[] = [];
  for (const r of runs) {
    const text = (r.text ?? "").toString();
    if (!text) continue;

    const prev = out[out.length - 1];
    const prevOpts = JSON.stringify(prev?.options ?? {});
    const curOpts = JSON.stringify(r.options ?? {});
    if (prev && prevOpts === curOpts) {
      prev.text += text;
    } else {
      out.push({ text, options: r.options ? { ...r.options } : undefined });
    }
  }
  return out.length ? out : undefined;
}

async function renderSlide(
  pptx: any,
  slideModel: SlideModel,
  themeColorHex: string
): Promise<void> {
  const createSlide = () => {
    const slide = pptx.addSlide();

    if (
      slideModel.type === "title" ||
      slideModel.type === "end" ||
      slideModel.type === "section"
    ) {
      slide.background = { color: themeColorHex };
    } else {
      slide.background = { color: "FFFFFF" };
    }

    return slide;
  };

  let slide = createSlide();
  let cursorY = TOP_MARGIN;

  const headingColor = slideModel.type === "content" ? themeColorHex : "FFFFFF";
  const bodyColor = slideModel.type === "content" ? "444444" : "FFFFFF";

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > SLIDE_HEIGHT - BOTTOM_MARGIN) {
      slide = createSlide();
      cursorY = TOP_MARGIN;
    }
  };

  for (const block of slideModel.blocks) {
    if (block.kind === "table" && block.rows && block.rows.length) {
      const estimatedHeight = Math.min(3.8, 0.42 * block.rows.length + 0.5);
      ensureSpace(estimatedHeight);

      const tableData = block.rows.map((row, rowIndex) =>
        row.map((cellText) => ({
          text: cellText ?? "",
          options: {
            bold: rowIndex === 0,
            fontSize: 12,
            color: rowIndex === 0 ? "FFFFFF" : "111111",
            fill: rowIndex === 0 ? themeColorHex : "FFFFFF",
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
      continue;
    }

    const baseOpts = cssToTextOptions(block.css);

    let height = 0.55;
    if (block.kind === "heading") height = 0.85;
    if (block.kind === "paragraph") height = 0.75;
    if (block.kind === "listItem") height = 0.55;

    ensureSpace(height);

    if (block.kind === "listItem" && block.text) {
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
        autoFit: true,
      });

      cursorY += height + 0.1;
      continue;
    }

    const runs = normaliseRuns(block.runs);
    const textValue = runs?.length ? (runs as any) : block.text ?? "";

    if (block.kind === "heading" && (block.text || runs?.length)) {
      const level = block.headingLevel ?? 1;
      const fontSize =
        level === 1 ? 32 : level === 2 ? 26 : level === 3 ? 22 : 20;

      slide.addText(textValue, {
        x: SIDE_MARGIN,
        y: cursorY,
        w: SLIDE_WIDTH - SIDE_MARGIN * 2,
        h: height,
        ...baseOpts,
        fontSize,
        bold: true,
        color: headingColor,
        autoFit: true,
      });
    } else if (block.kind === "paragraph" && (block.text || runs?.length)) {
      slide.addText(textValue, {
        x: SIDE_MARGIN,
        y: cursorY,
        w: SLIDE_WIDTH - SIDE_MARGIN * 2,
        h: height,
        ...baseOpts,
        color: bodyColor,
        autoFit: true,
      });
    }

    cursorY += height + 0.1;
  }
}

export default function HtmlToPptxTool() {
  const theme = useThemeColors();
  const content: HtmlToPptxToolContent = useHtmlToPptxContent();

  const [htmlSource, setHtmlSource] = useState("");
  const [fileName, setFileName] = useState("slides.pptx");
  const [themeColor, setThemeColor] = useState("#BD582C");

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

  const themeColorLabel: string | undefined = (content.ui as any)?.labels
    ?.themeColor;
  const noSlidesMessage: string | undefined = (content.ui.errors as any)
    ?.noSlides;

  const primaryBg = useMemo(() => {
    return (
      extractBgClass(theme.primary) ||
      extractBgClass(theme.secondary) ||
      undefined
    );
  }, [theme.primary, theme.secondary]);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
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

      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const finalHtml = bodyMatch ? bodyMatch[1] : text;

      setHtmlSource(finalHtml);
      setProgressStep("idle");
    } catch (err) {
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    }
  };

  const handleConvert = async () => {
    if (!hasContent || isConverting) return;

    setIsConverting(true);
    setError("");
    setProgressStep("preparing");

    try {
      const PptxGenJS = await import("pptxgenjs").then(
        (mod: any) => mod.default ?? mod
      );
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";

      const slideModels: SlideModel[] = parseHtmlToSlides(htmlSource);

      if (!slideModels.length) {
        throw new Error(noSlidesMessage ?? content.ui.errors.unknown);
      }

      const finalThemeColor = cssColorToHex(themeColor) || "BD582C";

      setProgressStep("exporting");

      for (const sm of slideModels) {
        await renderSlide(pptx, sm, finalThemeColor);
      }

      await pptx.writeFile({ fileName: normaliseFileName(fileName) });

      setProgressStep("success");
    } catch (err) {
      const raw =
        err instanceof Error
          ? err.message || err.toString()
          : content.ui.errors.unknown;

      const msg =
        raw === (noSlidesMessage ?? raw)
          ? noSlidesMessage ?? raw
          : `${content.ui.errors.genericPrefix} ${raw}`;

      setError(msg);
      setProgressStep("idle");
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (progressStep === "success") {
      const t = setTimeout(() => setProgressStep("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [progressStep]);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 sm:p-5 shadow-sm ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <FileCode2 className="w-5 h-5" />
          <h2 className={`text-sm sm:text-base font-semibold ${theme.text}`}>
            {content.ui.editor.title}
          </h2>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-1">
            <Upload className="w-4 h-4" />
            <span>{content.ui.upload.title}</span>
          </label>

          <p className={`text-[11px] sm:text-xs mb-2 ${theme.textMuted}`}>
            {content.ui.upload.subtitle}
          </p>

          <input
            type="file"
            accept=".html,.htm,text/html"
            onChange={handleFileSelect}
            className={`block w-full text-xs sm:text-sm cursor-pointer ${theme.text}`}
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-1">
            <FileText className="w-4 h-4" />
            <span>{content.ui.editor.title}</span>
          </label>

          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            placeholder={content.ui.editor.placeholder}
            className={`
              w-full h-56 sm:h-64 resize-y rounded-md border px-3 py-2 text-xs sm:text-sm font-mono
              ${theme.card} ${theme.border} ${theme.text}
            `}
            dir="ltr"
            spellCheck={false}
          />

          <p className={`mt-1 text-[11px] sm:text-xs ${theme.textMuted}`}>
            {content.ui.editor.hint}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex items-center gap-2 sm:w-56">
            <Palette className="w-4 h-4" />

            {themeColorLabel ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs">
                  {themeColorLabel}:
                </span>
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className={`w-9 h-7 rounded-md border cursor-pointer bg-transparent ${theme.border}`}
                />
              </div>
            ) : (
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className={`w-9 h-7 rounded-md border cursor-pointer bg-transparent ${theme.border}`}
                aria-label="theme-color"
              />
            )}
          </div>

          <div className="flex-1">
            <label className="block text-[11px] sm:text-xs font-medium mb-1">
              {content.ui.filename.label}
            </label>

            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className={`
                w-full rounded-md border px-3 py-1.5 text-xs sm:text-sm
                ${theme.card} ${theme.border} ${theme.text}
              `}
            />
          </div>

          <button
            type="button"
            onClick={handleConvert}
            disabled={!hasContent || isConverting}
            className={`
              inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-medium
              ${theme.primary}
              ${
                !hasContent || isConverting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
          >
            <Download className="w-4 h-4" />
            <span>
              {isConverting
                ? content.ui.buttons.convertLoading
                : content.ui.buttons.convertIdle}
            </span>
          </button>
        </div>

        {error && (
          <div
            className={`
              mt-3 flex items-start gap-2 text-xs rounded-md border px-3 py-2
              ${theme.note.errorBg} ${theme.note.errorBorder} ${theme.note.errorText}
            `}
          >
            <AlertCircle className="w-4 h-4 mt-[2px]" />
            <p>{error}</p>
          </div>
        )}

        {showProgress && (
          <div className="mt-3 space-y-1">
            <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div
                className={`h-full rounded-full ${primaryBg ?? ""}`}
                style={{ width: progressWidth }}
              />
            </div>

            {progressMessage && (
              <p className={`text-[11px] sm:text-xs ${theme.textMuted}`}>
                {progressMessage}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className={`rounded-xl border p-4 sm:p-5 text-xs sm:text-sm ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4" />
          <h3 className={`font-semibold ${theme.text}`}>
            {content.ui.guide.title}
          </h3>
        </div>

        <ul className="list-disc ps-5 space-y-1.5">
          {content.ui.guide.items.map((item, idx) => (
            <li key={idx} className={theme.textMuted}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
