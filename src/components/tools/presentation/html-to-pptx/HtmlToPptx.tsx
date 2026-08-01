// components/tools/presentation/html-to-pptx/HtmlToPptx.tsx
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ChangeEvent,
} from "react";
import {
  Upload,
  AlertCircle,
  FileText,
  Palette,
  Eye,
  Sparkles,
  Image as ImageIcon,
  FileDown,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useHtmlToPptxContent,
  type HtmlToPptxToolContent,
} from "./html-to-pptx.content";
import {
  parseHtmlToSlides,
  getPresentationStats,
  ASPECT_RATIO_DIMENSIONS,
  type SlideModel,
  type Block,
  type AspectRatio,
  type TextRun,
} from "./HtmlParser";
import CustomDropdown from "@/components/ui/CustomDropdown";

type ProgressStep =
  | "idle"
  | "preparing"
  | "loadingImages"
  | "exporting"
  | "success";
type PresetTheme =
  | "modern"
  | "classic"
  | "minimal"
  | "dark"
  | "ocean"
  | "forest"
  | "sunset"
  | "custom";
type SlideTransition = "none" | "fade" | "slide" | "zoom" | "flip" | "rotate";

// ============ THEME DEFINITIONS ============
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textOnPrimary: string;
  textOnContent: string;
  textMuted: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableRowEven: string;
  tableRowOdd: string;
  tableBorder: string;
  slideNumberColor: string;
  footerColor: string;
  decorativeLine: string;
}

const PRESET_THEMES: Record<PresetTheme, ThemeColors> = {
  modern: {
    primary: "3B82F6",
    secondary: "EFF6FF",
    accent: "F59E0B",
    background: "FFFFFF",
    textOnPrimary: "FFFFFF",
    textOnContent: "1F2937",
    textMuted: "6B7280",
    tableHeaderBg: "3B82F6",
    tableHeaderText: "FFFFFF",
    tableRowEven: "F9FAFB",
    tableRowOdd: "FFFFFF",
    tableBorder: "E5E7EB",
    slideNumberColor: "9CA3AF",
    footerColor: "9CA3AF",
    decorativeLine: "F59E0B",
  },
  classic: {
    primary: "1E3A8A",
    secondary: "F0F4F8",
    accent: "DC2626",
    background: "FAFAFA",
    textOnPrimary: "FFFFFF",
    textOnContent: "1F2937",
    textMuted: "6B7280",
    tableHeaderBg: "1E3A8A",
    tableHeaderText: "FFFFFF",
    tableRowEven: "F1F5F9",
    tableRowOdd: "FFFFFF",
    tableBorder: "CBD5E1",
    slideNumberColor: "94A3B8",
    footerColor: "94A3B8",
    decorativeLine: "DC2626",
  },
  minimal: {
    primary: "374151",
    secondary: "F9FAFB",
    accent: "6366F1",
    background: "FFFFFF",
    textOnPrimary: "FFFFFF",
    textOnContent: "111827",
    textMuted: "9CA3AF",
    tableHeaderBg: "374151",
    tableHeaderText: "FFFFFF",
    tableRowEven: "F9FAFB",
    tableRowOdd: "FFFFFF",
    tableBorder: "E5E7EB",
    slideNumberColor: "D1D5DB",
    footerColor: "D1D5DB",
    decorativeLine: "6366F1",
  },
  dark: {
    primary: "1F2937",
    secondary: "111827",
    accent: "FBBF24",
    background: "0F172A",
    textOnPrimary: "F9FAFB",
    textOnContent: "F1F5F9",
    textMuted: "9CA3AF",
    tableHeaderBg: "374151",
    tableHeaderText: "FBBF24",
    tableRowEven: "1E293B",
    tableRowOdd: "111827",
    tableBorder: "334155",
    slideNumberColor: "64748B",
    footerColor: "64748B",
    decorativeLine: "FBBF24",
  },
  ocean: {
    primary: "0891B2",
    secondary: "ECFEFF",
    accent: "06B6D4",
    background: "F0FDFA",
    textOnPrimary: "FFFFFF",
    textOnContent: "164E63",
    textMuted: "64748B",
    tableHeaderBg: "0891B2",
    tableHeaderText: "FFFFFF",
    tableRowEven: "F0FDFA",
    tableRowOdd: "FFFFFF",
    tableBorder: "A5F3FC",
    slideNumberColor: "67E8F9",
    footerColor: "64748B",
    decorativeLine: "06B6D4",
  },
  forest: {
    primary: "166534",
    secondary: "F0FDF4",
    accent: "22C55E",
    background: "FAFFFA",
    textOnPrimary: "FFFFFF",
    textOnContent: "14532D",
    textMuted: "6B7280",
    tableHeaderBg: "166534",
    tableHeaderText: "FFFFFF",
    tableRowEven: "F0FDF4",
    tableRowOdd: "FFFFFF",
    tableBorder: "BBF7D0",
    slideNumberColor: "86EFAC",
    footerColor: "6B7280",
    decorativeLine: "22C55E",
  },
  sunset: {
    primary: "C2410C",
    secondary: "FFF7ED",
    accent: "F97316",
    background: "FFFBEB",
    textOnPrimary: "FFFFFF",
    textOnContent: "431407",
    textMuted: "9A3412",
    tableHeaderBg: "C2410C",
    tableHeaderText: "FFFFFF",
    tableRowEven: "FFF7ED",
    tableRowOdd: "FFFFFF",
    tableBorder: "FED7AA",
    slideNumberColor: "FB923C",
    footerColor: "9A3412",
    decorativeLine: "F97316",
  },
  custom: {
    primary: "BD582C",
    secondary: "FFF5F0",
    accent: "E87A4F",
    background: "FFFFFF",
    textOnPrimary: "FFFFFF",
    textOnContent: "1F2937",
    textMuted: "6B7280",
    tableHeaderBg: "BD582C",
    tableHeaderText: "FFFFFF",
    tableRowEven: "FFF5F0",
    tableRowOdd: "FFFFFF",
    tableBorder: "F5D0C0",
    slideNumberColor: "D4A090",
    footerColor: "6B7280",
    decorativeLine: "E87A4F",
  },
};

// ============ FONTS ============
const FONT_FAMILIES: Record<string, string> = {
  default: "",
  calibri: "Calibri",
  arial: "Arial",
  tahoma: "Tahoma",
  timesNewRoman: "Times New Roman",
  georgia: "Georgia",
  verdana: "Verdana",
  roboto: "Roboto",
  openSans: "Open Sans",
  lato: "Lato",
  montserrat: "Montserrat",
};

// ============ TRANSITIONS ============
const TRANSITION_MAP: Record<SlideTransition, any> = {
  none: undefined,
  fade: { type: "fade" },
  slide: { type: "push", direction: "left" },
  zoom: { type: "zoom" },
  flip: { type: "flip" },
  rotate: { type: "rotate" },
};

// ============ HELPERS ============
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
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    if (hex.length === 6) return hex.toUpperCase();
  }
  return undefined;
}

function normaliseFileName(name: string): string {
  const trimmed = name.trim() || "presentation";
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

// ============ IMAGE HELPERS ============
async function loadImageDataUrl(src: string): Promise<string | null> {
  try {
    if (src.startsWith("data:")) return src;
    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageDimensions(
  imageBlock: Block,
  dataUrl: string,
  slideWidth: number,
  margin: number,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const dpi = 96;
      let w = imageBlock.width
        ? imageBlock.width / dpi
        : img.naturalWidth / dpi;
      let h = imageBlock.height
        ? imageBlock.height / dpi
        : img.naturalHeight / dpi;
      const maxW = slideWidth - 2 * margin;
      if (w > maxW) {
        const ratio = maxW / w;
        w = maxW;
        h *= ratio;
      }
      resolve({ width: w, height: h });
    };
    img.onerror = () => resolve({ width: 4, height: 3 });
    img.src = dataUrl;
  });
}

// ============ SLIDE RENDERER ============
async function renderSlide(
  pptx: any,
  slideModel: SlideModel,
  slideIndex: number,
  totalSlides: number,
  theme: ThemeColors,
  footerText: string | undefined,
  includeImages: boolean,
  fontFace: string | undefined,
  baseFontSize: number,
  lineSpacing: number,
  aspectRatio: AspectRatio,
  transition: SlideTransition,
): Promise<void> {
  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
  const SW = dims.width;
  const SH = dims.height;
  const TM = 0.55;
  const BM = 0.55;
  const SM = 0.65;
  const isTitleSlide = slideModel.type === "title";
  const isSectionSlide = slideModel.type === "section";
  const isEndSlide = slideModel.type === "end";
  const isSpecialSlide = isTitleSlide || isSectionSlide || isEndSlide;

  const createSlide = () => {
    const slide = pptx.addSlide();
    if (transition && TRANSITION_MAP[transition])
      slide.transition = TRANSITION_MAP[transition];

    // Background
    if (isSpecialSlide) {
      slide.background = { color: theme.primary };
    } else {
      slide.background = { color: theme.background };
    }

    // Decorative line for special slides
    if (isTitleSlide || isSectionSlide) {
      slide.addShape(pptx.ShapeType.rect, {
        x: SM,
        y: SH - BM - 0.12,
        w: SW - SM * 2,
        h: 0.015,
        fill: { color: theme.accent },
      });
    }

    // Slide number
    slide.addText(`${slideIndex} / ${totalSlides}`, {
      x: SW - 1.4,
      y: SH - 0.4,
      w: 1.2,
      h: 0.28,
      fontSize: 6,
      color: theme.slideNumberColor,
      align: "right",
      fontFace: fontFace || "Calibri",
    });

    // Footer
    const footerToShow = isSpecialSlide ? footerText : footerText || "";
    if (footerToShow) {
      slide.addText(footerToShow, {
        x: SM,
        y: SH - 0.4,
        w: SW - SM * 2 - 1.4,
        h: 0.28,
        fontSize: 6,
        color: theme.footerColor,
        align: "left",
        fontFace: fontFace || "Calibri",
      });
    }

    return slide;
  };

  let slide = createSlide();
  let cursorY = TM + (isTitleSlide ? 0.8 : isSectionSlide ? 0.5 : 0.1);

  const headingColor = isSpecialSlide ? theme.textOnPrimary : theme.primary;
  const bodyColor = isSpecialSlide ? theme.textOnPrimary : theme.textOnContent;
  const effectiveSpacing = lineSpacing * 0.25;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > SH - BM - 0.5) {
      slide = createSlide();
      cursorY = TM + 0.1;
    }
  };

  for (const block of slideModel.blocks) {
    // Image
    if (block.kind === "image" && includeImages && block.src) {
      const imageDataUrl = await loadImageDataUrl(block.src);
      if (imageDataUrl) {
        const { width, height } = await getImageDimensions(
          block,
          imageDataUrl,
          SW,
          SM,
        );
        ensureSpace(height + 0.25);
        slide.addImage({
          data: imageDataUrl,
          x: SM,
          y: cursorY,
          w: width,
          h: height,
          rounding: 0.08,
        });
        cursorY += height + 0.25;
      }
      continue;
    }

    // Table
    if (block.kind === "table" && block.rows && block.rows.length) {
      const estimatedHeight = Math.min(4, 0.38 * block.rows.length + 0.5);
      ensureSpace(estimatedHeight);
      const tableData = block.rows.map((row, rowIndex) =>
        row.map((cellText) => ({
          text: cellText ?? "",
          options: {
            bold: rowIndex === 0,
            fontSize: baseFontSize * 0.65,
            color: rowIndex === 0 ? theme.tableHeaderText : bodyColor,
            fill:
              rowIndex === 0
                ? theme.tableHeaderBg
                : rowIndex % 2 === 0
                  ? theme.tableRowEven
                  : theme.tableRowOdd,
            fontFace: fontFace || "Calibri",
            align: "center",
            valign: "middle",
            border: { type: "solid", color: theme.tableBorder, pt: 0.5 },
          },
        })),
      );
      slide.addTable(tableData as any, {
        x: SM,
        y: cursorY,
        w: SW - SM * 2,
        border: { type: "solid", color: theme.tableBorder, pt: 0.5 },
        rowH: 0.32,
        autoPage: false,
      });
      cursorY += estimatedHeight + 0.2;
      continue;
    }

    // Text blocks
    let height = 0.45;
    if (block.kind === "heading") height = 0.7;
    if (block.kind === "paragraph") height = 0.55;
    if (block.kind === "listItem") height = 0.4;

    ensureSpace(height);

    // List item
    if (block.kind === "listItem" && block.text) {
      const level = block.listLevel ?? 1;
      const indent = SM + (level - 1) * 0.3;
      slide.addText(block.text, {
        x: indent,
        y: cursorY,
        w: SW - indent - SM,
        h: height,
        fontSize: baseFontSize * 0.8,
        color: bodyColor,
        bullet: { type: block.listType === "ol" ? "number" : "bullet" },
        fontFace: fontFace || "Calibri",
        lineSpacing: effectiveSpacing,
        autoFit: true,
      });
      cursorY += height + 0.06;
      continue;
    }

    // Heading & Paragraph
    const runs = normaliseRuns(block.runs);
    const textValue = runs?.length ? (runs as any) : (block.text ?? "");
    if (!textValue) continue;

    if (block.kind === "heading") {
      const level = block.headingLevel ?? 1;
      const fontSize =
        [
          0,
          baseFontSize * 2.4,
          baseFontSize * 1.9,
          baseFontSize * 1.6,
          baseFontSize * 1.3,
          baseFontSize * 1.1,
          baseFontSize,
        ][level] || baseFontSize;
      slide.addText(textValue, {
        x: isSpecialSlide ? SW * 0.1 : SM,
        y: cursorY,
        w: isSpecialSlide ? SW * 0.8 : SW - SM * 2,
        h: height,
        fontSize,
        bold: true,
        color: headingColor,
        fontFace: fontFace || "Calibri",
        lineSpacing: effectiveSpacing,
        align: isSpecialSlide ? "center" : "left",
        autoFit: true,
      });
    } else if (block.kind === "paragraph") {
      slide.addText(textValue, {
        x: SM,
        y: cursorY,
        w: SW - SM * 2,
        h: height,
        fontSize: baseFontSize,
        color: bodyColor,
        fontFace: fontFace || "Calibri",
        lineSpacing: effectiveSpacing,
        autoFit: true,
      });
    }

    cursorY += height + 0.06;
  }
}

// ============ MAIN COMPONENT ============
export default function HtmlToPptxTool() {
  const theme = useThemeColors();
  const content: HtmlToPptxToolContent = useHtmlToPptxContent();

  // State
  const [htmlSource, setHtmlSource] = useState("");
  const [fileName, setFileName] = useState("presentation.pptx");
  const [presetTheme, setPresetTheme] = useState<PresetTheme>("modern");
  const [customPrimary, setCustomPrimary] = useState("#3B82F6");
  const [customAccent, setCustomAccent] = useState("#F59E0B");
  const [includeImages, setIncludeImages] = useState(true);
  const [footerText, setFooterText] = useState("");
  const [fontFamily, setFontFamily] = useState("default");
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [slideTransition, setSlideTransition] =
    useState<SlideTransition>("fade");

  const [isConverting, setIsConverting] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");
  const [error, setError] = useState("");
  const [previewInfo, setPreviewInfo] = useState<any>(null);

  const hasContent = !!htmlSource.trim();
  const showProgress = progressStep !== "idle";
  const progressMessage =
    progressStep === "idle" ? "" : content.ui.progress[progressStep];

  const progressWidth = (() => {
    switch (progressStep) {
      case "preparing":
        return "20%";
      case "loadingImages":
        return "50%";
      case "exporting":
        return "85%";
      case "success":
        return "100%";
      default:
        return "0%";
    }
  })();

  const primaryBg = useMemo(
    () =>
      extractBgClass(theme.primary) ||
      extractBgClass(theme.secondary) ||
      "bg-[var(--app-primary-bg)]",
    [theme.primary, theme.secondary],
  );

  // Get active theme
  const activeTheme = useMemo(() => {
    if (presetTheme === "custom") {
      return {
        ...PRESET_THEMES.custom,
        primary: cssColorToHex(customPrimary) || "BD582C",
        accent: cssColorToHex(customAccent) || "E87A4F",
      };
    }
    return PRESET_THEMES[presetTheme];
  }, [presetTheme, customPrimary, customAccent]);

  // Update preview
  const updatePreview = useCallback(
    (html: string) => {
      try {
        const slides = parseHtmlToSlides(html);
        const stats = getPresentationStats(slides);
        setPreviewInfo(stats);
        setError("");
      } catch (err: any) {
        setPreviewInfo(null);
        if (html.trim()) setError(err?.message || content.ui.errors.unknown);
      }
    },
    [content.ui.errors.unknown],
  );

  useEffect(() => {
    if (hasContent) updatePreview(htmlSource);
    else setPreviewInfo(null);
  }, [htmlSource, updatePreview]);

  // File upload
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (
      !lower.endsWith(".html") &&
      !lower.endsWith(".htm") &&
      file.type !== "text/html"
    ) {
      setError(content.ui.errors.invalidType);
      return;
    }
    setError("");
    setFileName(
      (file.name.replace(/\.(html?|txt)$/i, "") || "presentation") + ".pptx",
    );
    try {
      const text = await file.text();
      if (!text.trim()) {
        setError(content.ui.errors.emptyContent);
        return;
      }
      const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      setHtmlSource(bodyMatch ? bodyMatch[1] : text);
    } catch (err: any) {
      setError(`${content.ui.errors.genericPrefix} ${err?.message || err}`);
    }
  };

  // Convert
  const handleConvert = async () => {
    if (!hasContent || isConverting) return;
    setIsConverting(true);
    setError("");
    setProgressStep("preparing");

    try {
      const PptxGenJS = await import("pptxgenjs").then(
        (mod: any) => mod.default ?? mod,
      );
      const pptx = new PptxGenJS();
      pptx.layout =
        aspectRatio === "4:3"
          ? "LAYOUT_4x3"
          : aspectRatio === "16:10"
            ? "LAYOUT_16x10"
            : "LAYOUT_16x9";
      pptx.author = "HTML to PPTX Converter";
      pptx.title = fileName.replace(".pptx", "");

      const slideModels = parseHtmlToSlides(htmlSource);
      if (!slideModels.length) throw new Error(content.ui.errors.noSlides);

      const finalFontFace = FONT_FAMILIES[fontFamily] || undefined;

      if (includeImages) setProgressStep("loadingImages");
      else setProgressStep("exporting");

      for (let i = 0; i < slideModels.length; i++) {
        await renderSlide(
          pptx,
          slideModels[i],
          i + 1,
          slideModels.length,
          activeTheme,
          footerText || undefined,
          includeImages,
          finalFontFace,
          baseFontSize,
          lineSpacing,
          aspectRatio,
          slideTransition,
        );
      }

      setProgressStep("exporting");
      await pptx.writeFile({ fileName: normaliseFileName(fileName) });
      setProgressStep("success");
    } catch (err: any) {
      setError(`${content.ui.errors.genericPrefix} ${err?.message || err}`);
      setProgressStep("idle");
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (progressStep === "success") {
      const t = setTimeout(() => setProgressStep("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [progressStep]);

  // Dropdown options
  const themeOptions = useMemo(
    () => [
      { value: "modern", label: content.ui.themes.modern },
      { value: "classic", label: content.ui.themes.classic },
      { value: "minimal", label: content.ui.themes.minimal },
      { value: "dark", label: content.ui.themes.dark },
      { value: "ocean", label: content.ui.themes.ocean },
      { value: "forest", label: content.ui.themes.forest },
      { value: "sunset", label: content.ui.themes.sunset },
      { value: "custom", label: content.ui.themes.custom },
    ],
    [content.ui.themes],
  );

  const fontOptions = useMemo(
    () => [
      { value: "default", label: content.ui.fonts.default },
      { value: "calibri", label: content.ui.fonts.calibri },
      { value: "arial", label: content.ui.fonts.arial },
      { value: "tahoma", label: content.ui.fonts.tahoma },
      { value: "timesNewRoman", label: content.ui.fonts.timesNewRoman },
      { value: "georgia", label: content.ui.fonts.georgia },
      { value: "verdana", label: content.ui.fonts.verdana },
      { value: "roboto", label: content.ui.fonts.roboto },
      { value: "openSans", label: content.ui.fonts.openSans },
      { value: "lato", label: content.ui.fonts.lato },
      { value: "montserrat", label: content.ui.fonts.montserrat },
    ],
    [content.ui.fonts],
  );

  const aspectRatioOptions = useMemo(
    () => [
      { value: "16:9", label: content.ui.aspectRatios["16:9"] },
      { value: "4:3", label: content.ui.aspectRatios["4:3"] },
      { value: "16:10", label: content.ui.aspectRatios["16:10"] },
    ],
    [content.ui.aspectRatios],
  );

  const transitionOptions = useMemo(
    () => [
      { value: "none", label: content.ui.transitions.none },
      { value: "fade", label: content.ui.transitions.fade },
      { value: "slide", label: content.ui.transitions.slide },
      { value: "zoom", label: content.ui.transitions.zoom },
      { value: "flip", label: content.ui.transitions.flip },
      { value: "rotate", label: content.ui.transitions.rotate },
    ],
    [content.ui.transitions],
  );

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div
        className={`rounded-xl border p-4 sm:p-5 shadow-lg ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2 className={`text-sm sm:text-base font-bold ${theme.text}`}>
            {content.ui.editor.title}
          </h2>
        </div>

        {/* Upload */}
        <div className="mb-4 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
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
            className={`block w-full text-xs sm:text-sm cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[var(--app-secondary-bg)] file:text-[var(--app-accent)] hover:file:opacity-90 ${theme.text}`}
          />
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-1">
            <FileText className="w-4 h-4" />
            <span>{content.ui.editor.title}</span>
          </label>
          <textarea
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            placeholder={content.ui.editor.placeholder}
            className={`w-full h-48 sm:h-56 resize-y rounded-lg border px-3 py-2 text-xs sm:text-sm font-mono transition-all focus:ring-2 focus:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
            dir="ltr"
            spellCheck={false}
          />
          <p className={`mt-1 text-[10px] sm:text-xs ${theme.textMuted}`}>
            {content.ui.editor.hint}
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div>
            <CustomDropdown
              label={`🎭 ${content.ui.labels.presetTheme}`}
              options={themeOptions}
              value={presetTheme}
              onChange={(v) => setPresetTheme(v as PresetTheme)}
              searchable={false}
            />
          </div>
          <div>
            <CustomDropdown
              label={`🔤 ${content.ui.labels.fontFamily}`}
              options={fontOptions}
              value={fontFamily}
              onChange={setFontFamily}
              searchable={true}
              searchPlaceholder={content.ui.labels.fontSearchPlaceholder}
            />
          </div>
          <div>
            <CustomDropdown
              label={`📐 ${content.ui.labels.aspectRatio}`}
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={(v) => setAspectRatio(v as AspectRatio)}
              searchable={false}
            />
          </div>
          <div>
            <CustomDropdown
              label={`🔄 ${content.ui.labels.slideTransition}`}
              options={transitionOptions}
              value={slideTransition}
              onChange={(v) => setSlideTransition(v as SlideTransition)}
              searchable={false}
            />
          </div>
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              📏 {content.ui.labels.fontSize}: {baseFontSize}pt
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={baseFontSize}
              onChange={(e) => setBaseFontSize(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[var(--app-accent)]"
            />
          </div>
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              ↕️ {content.ui.labels.lineSpacing}: {lineSpacing.toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[var(--app-accent)]"
            />
          </div>
        </div>

        {/* Colors */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg ${presetTheme === "custom" ? "border-2 border-[var(--app-accent)] bg-[var(--app-secondary-bg)]" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="text-xs">{content.ui.labels.primaryColor}</span>
            <input
              type="color"
              value={
                presetTheme === "custom"
                  ? customPrimary
                  : `#${activeTheme.primary}`
              }
              onChange={(e) => {
                setCustomPrimary(e.target.value);
                setPresetTheme("custom");
              }}
              className="w-8 h-8 rounded-md border cursor-pointer bg-transparent"
            />
            <span className="text-[10px] font-mono">
              {presetTheme === "custom"
                ? customPrimary
                : `#${activeTheme.primary}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="text-xs">{content.ui.labels.accentColor}</span>
            <input
              type="color"
              value={
                presetTheme === "custom"
                  ? customAccent
                  : `#${activeTheme.accent}`
              }
              onChange={(e) => {
                setCustomAccent(e.target.value);
                setPresetTheme("custom");
              }}
              className="w-8 h-8 rounded-md border cursor-pointer bg-transparent"
            />
            <span className="text-[10px] font-mono">
              {presetTheme === "custom"
                ? customAccent
                : `#${activeTheme.accent}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--app-accent)]"
              />
              {content.ui.labels.includeImages}
            </label>
          </div>
        </div>

        {/* Filename & Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              {content.ui.filename.label}
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs ${theme.card} ${theme.border} ${theme.text} focus:ring-2 focus:ring-[var(--app-ring)]`}
            />
          </div>
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              {content.ui.labels.footerText}
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs ${theme.card} ${theme.border} ${theme.text} focus:ring-2 focus:ring-[var(--app-ring)]`}
              placeholder={content.ui.labels.footerPlaceholder}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={handleConvert}
            disabled={!hasContent || isConverting}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all transform hover:scale-105 active:scale-95
              ${
                hasContent && !isConverting
                  ? "bg-gradient-to-r from-[var(--app-gradient-from)] to-[var(--app-gradient-to)] text-white shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              }`}
          >
            {isConverting ? (
              <span className="animate-pulse">⏳</span>
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>
              {isConverting
                ? content.ui.buttons.convertLoading
                : content.ui.buttons.convertIdle}
            </span>
          </button>
          <button
            type="button"
            onClick={() => updatePreview(htmlSource)}
            disabled={!hasContent}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${theme.border} ${theme.text}`}
          >
            <Eye className="w-4 h-4" />
            {content.ui.buttons.preview}
          </button>
        </div>

        {/* Preview Stats */}
        {previewInfo && (
          <div
            className={`p-3 rounded-lg border ${theme.border} bg-gray-50/50 dark:bg-gray-800/30`}
          >
            <h4 className={`text-xs font-semibold mb-2 ${theme.text}`}>
              {content.ui.preview.title}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                {
                  label: content.ui.previewStats.slides,
                  value: previewInfo.totalSlides,
                  color: "text-[var(--app-accent)]",
                },
                {
                  label: content.ui.previewStats.headings,
                  value: previewInfo.headings,
                  color: "text-purple-600",
                },
                {
                  label: content.ui.previewStats.paragraphs,
                  value: previewInfo.paragraphs,
                  color: "text-[var(--app-success-text)]",
                },
                {
                  label: content.ui.previewStats.images,
                  value: previewInfo.images,
                  color: "text-orange-600",
                },
                {
                  label: content.ui.previewStats.tables,
                  value: previewInfo.tables,
                  color: "text-teal-600",
                },
                {
                  label: content.ui.previewStats.lists,
                  value: previewInfo.lists,
                  color: "text-pink-600",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="text-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`text-lg font-bold ${item.color}`}>
                    {item.value}
                  </div>
                  <div className="text-[10px] text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-start gap-2 text-xs rounded-lg border px-3 py-2 bg-[var(--app-error-bg)] border-[var(--app-error-border)] text-[var(--app-error-text)]">
            <AlertCircle className="w-4 h-4 mt-[2px] flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Progress */}
        {showProgress && (
          <div className="mt-3 space-y-1">
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${primaryBg}`}
                style={{ width: progressWidth }}
              />
            </div>
            {progressMessage && (
              <p
                className={`text-[11px] sm:text-xs flex items-center gap-1 ${theme.textMuted}`}
              >
                {progressStep === "success" && <span>🎉</span>}
                {progressMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div
        className={`rounded-xl border p-4 sm:p-5 text-xs sm:text-sm ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className={`font-semibold ${theme.text}`}>
            {content.ui.guide.title}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.ui.guide.items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 p-2 rounded-lg ${theme.textMuted}`}
            >
              <span className="text-[var(--app-accent)] mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
