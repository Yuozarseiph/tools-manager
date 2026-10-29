// components/tools/presentation/html-to-pptx/HtmlToPptx.tsx
"use client";
import { saveFile } from "@/lib/file-export";
import { LoaderCircle, CircleCheck, Ruler, ArrowUpDown, Type, Ratio } from "lucide-react";

import { AccessibleInput, AccessibleTextarea, AccessibleSelect } from "@/components/ui/AccessibleControls";

import {
  useRef,
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
  type AspectRatio,
} from "./HtmlParser";
import { decodeText } from "@/lib/decode-text";
import { useLanguage } from "@/context/LanguageContext";
import { readLocalFile, startActivity } from "@/lib/transfer";
import { exportEditable, type ExportSettings } from "./pptx-export";
import { presentationHtml, type InputFormat } from "./presentation-source";
import { exportVisual } from "./pptx-visual";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { normaliseOutputName } from "@/lib/output-name";

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
  vazirmatn: "Vazirmatn",
  iranyekan: "IRANYekanX",
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
  return normaliseOutputName(name, "presentation.pptx");
}

// ============ MAIN COMPONENT ============
export default function HtmlToPptxTool() {
  const theme = useThemeColors();
  const { locale } = useLanguage(); const fa = locale === "fa";
  const [inputFormat, setInputFormat] = useState<InputFormat>("auto");
  const [exportMode, setExportMode] = useState<"editable" | "visual">("editable");
  const [direction, setDirection] = useState<ExportSettings["direction"]>("auto");
  const [preserveStyles, setPreserveStyles] = useState(true), [allowRemoteImages, setAllowRemoteImages] = useState(false), [showNumbers, setShowNumbers] = useState(true), [notes, setNotes] = useState(false);
  const [margin, setMargin] = useState(.55), [imageScale, setImageScale] = useState(1), [author, setAuthor] = useState("QodeForge");
  const [actualProgress, setActualProgress] = useState({ done: 0, total: 0 });
  const [resultInfo, setResultInfo] = useState<{ slides: number; size: number; warnings: string[] } | null>(null);
  const convertController = useRef<AbortController | null>(null), conversionTask = useRef<ReturnType<typeof startActivity> | null>(null);
  useEffect(() => () => { convertController.current?.abort(); conversionTask.current?.fail(new DOMException("Cancelled", "AbortError")); }, []);
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


  const [isConverting, setIsConverting] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");
  const [error, setError] = useState("");
  const [previewInfo, setPreviewInfo] = useState<ReturnType<typeof getPresentationStats> | null>(null);

  const hasContent = !!htmlSource.trim();
  const showProgress = progressStep !== "idle";
  const progressMessage =
    progressStep === "idle" ? "" : content.ui.progress[progressStep];

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
        const slides = parseHtmlToSlides(presentationHtml(html, inputFormat));
        const stats = getPresentationStats(slides);
        setPreviewInfo(stats);
        setError("");
      } catch (err) {
        setPreviewInfo(null);
        if (html.trim()) setError(err instanceof Error ? err.message : content.ui.errors.unknown);
      }
    },
    [content.ui.errors.unknown, inputFormat],
  );

  useEffect(() => {
    setResultInfo(null);
    const timer = setTimeout(() => { if (hasContent && htmlSource.length <= 2000000) updatePreview(htmlSource); else setPreviewInfo(null); }, 300);
    return () => clearTimeout(timer);
  }, [htmlSource, updatePreview, hasContent]);

  // File upload
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError(fa ? "حداکثر حجم HTML هشت مگابایت است." : "Maximum HTML file size is 8 MB."); return; }
    const lower = file.name.toLowerCase();
    if (
      !lower.endsWith(".html") &&
      !lower.endsWith(".htm") &&
      !lower.endsWith(".md") && !lower.endsWith(".markdown") && !lower.endsWith(".txt") &&
      file.type !== "text/html"
    ) {
      setError(content.ui.errors.invalidType);
      return;
    }
    setError("");
    setFileName(
      (file.name.replace(/\.(html?|txt|md|markdown)$/i, "") || "presentation") + ".pptx",
    );
    try {
      const text = decodeText(await readLocalFile(file));
      if (!text.trim()) {
        setError(content.ui.errors.emptyContent);
        return;
      }
      setHtmlSource(text);
    } catch (err) {
      setError(`${content.ui.errors.genericPrefix} ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Convert with real progress, bounded pagination and cancellation.
  const handleConvert = async () => {
    if (!hasContent || isConverting) return;
    if (htmlSource.length > 2000000) { setError(fa ? "حداکثر طول HTML دو میلیون نویسه است." : "HTML must not exceed 2 million characters."); return; }
    const controller = new AbortController(); convertController.current = controller;
    setIsConverting(true); setError(""); setResultInfo(null); setProgressStep("preparing"); setActualProgress({ done: 0, total: 0 });
    const task = startActivity(fa ? "ساخت پاورپوینت" : "PowerPoint export", "process", undefined, () => controller.abort()); conversionTask.current = task;
    try {
      const source = presentationHtml(htmlSource, inputFormat);
      const slides = parseHtmlToSlides(source);
      if (!slides.length) throw new Error(content.ui.errors.noSlides);
      if (slides.length > 100 || slides.reduce((sum, slide) => sum + slide.blocks.length, 0) > 5000) throw new Error(fa ? "حداکثر ۱۰۰ بخش ورودی و ۵۰۰۰ بلوک مجاز است." : "Limit: 100 input sections and 5,000 blocks.");
      const settings: ExportSettings = { aspectRatio, fontFace: FONT_FAMILIES[fontFamily] || (fa ? "Tahoma" : "Arial"), fontSize: baseFontSize, lineSpacing, direction, margin, preserveStyles, includeImages, allowRemoteImages, showNumbers, footer: footerText, title: fileName.replace(/\.pptx$/i, ""), author, notes, theme: activeTheme };
      setProgressStep("exporting");
      const onProgress = (done: number, total: number) => { if (!controller.signal.aborted) { setActualProgress({ done, total }); task.progress(done, total); } };
      const result = exportMode === "editable" ? await exportEditable(slides, settings, controller.signal, onProgress) : await exportVisual(source, settings, imageScale, controller.signal, onProgress);
      controller.signal.throwIfAborted();
      void saveFile(result.blob, normaliseFileName(fileName));
      setResultInfo({ slides: result.slides, size: result.blob.size, warnings: result.warnings }); setProgressStep("success"); task.finish();
    } catch (error) {
      task.fail(error); setProgressStep("idle");
      if (!controller.signal.aborted) setError(`${content.ui.errors.genericPrefix} ${error instanceof Error ? error.message : String(error)}`);
    } finally { setIsConverting(false); }
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
      { value: "vazirmatn", label: "Vazirmatn" },
      { value: "iranyekan", label: "IRANYekanX" },
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
          <p className={`text-xs sm:text-xs mb-2 ${theme.textMuted}`}>
            {content.ui.upload.subtitle}
          </p>
          <AccessibleInput
            type="file"
            accept=".html,.htm,.md,.markdown,.txt,text/html,text/markdown"
            disabled={isConverting}
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
          <AccessibleTextarea
            disabled={isConverting}
            value={htmlSource}
            onChange={(e) => setHtmlSource(e.target.value)}
            placeholder={content.ui.editor.placeholder}
            className={`w-full h-48 sm:h-56 resize-y rounded-lg border px-3 py-2 text-xs sm:text-sm font-mono transition-all focus:ring-2 focus:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
            dir="ltr"
            spellCheck={false}
          />
          <p className={`mt-1 text-xs sm:text-xs ${theme.textMuted}`}>
            {content.ui.editor.hint}
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div>
            <CustomDropdown
              label={content.ui.labels.presetTheme}
              labelIcon={Palette}
              options={themeOptions}
              value={presetTheme}
              onChange={(v) => setPresetTheme(v as PresetTheme)}
              searchable={false}
            />
          </div>
          <div>
            <CustomDropdown
              label={content.ui.labels.fontFamily}
              labelIcon={Type}
              options={fontOptions}
              value={fontFamily}
              onChange={setFontFamily}
              searchable={true}
              searchPlaceholder={content.ui.labels.fontSearchPlaceholder}
            />
          </div>
          <div>
            <CustomDropdown
              label={content.ui.labels.aspectRatio}
              labelIcon={Ratio}
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={(v) => setAspectRatio(v as AspectRatio)}
              searchable={false}
            />
          </div>
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              <Ruler className="me-1 inline h-4 w-4" aria-hidden="true" /> {content.ui.labels.fontSize}: {baseFontSize}pt
            </label>
            <AccessibleInput
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
              <ArrowUpDown className="me-1 inline h-4 w-4" aria-hidden="true" /> {content.ui.labels.lineSpacing}: {lineSpacing.toFixed(1)}
            </label>
            <AccessibleInput
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

        <div className="guide-note mb-5 text-sm">{fa ? "خروجی قابل‌ویرایش ساختار متن، جدول و تصویر را حفظ می‌کند؛ CSS پیچیده، انیمیشن و JavaScript به اشیای پاورپوینت تبدیل نمی‌شوند. حالت تصویری برای حفظ ظاهر مناسب‌تر است، اما متن اسلاید در آن قابل‌ویرایش نیست. فونت انتخابی باید روی دستگاه مقصد نصب باشد." : "Editable output preserves text, tables and images; complex CSS, animations and JavaScript are not converted into PowerPoint objects. Visual mode favors appearance, with non-editable slide text. The chosen font must be installed on the destination device."}</div>
        <fieldset disabled={isConverting} className="mb-5 grid gap-4 rounded-2xl border border-[var(--app-border)] p-4 sm:grid-cols-2 lg:grid-cols-3">
          <legend className="px-2 text-sm font-bold">{fa ? "تنظیمات دقیق خروجی" : "Export settings"}</legend>
          <label className="ai-field">{fa ? "فرمت ورودی" : "Input format"}<AccessibleSelect hasVisibleLabel fieldLabel={fa ? "فرمت ورودی" : "Input format"} className="ai-input" value={inputFormat} onChange={event => setInputFormat(event.target.value as InputFormat)}><option value="auto">{fa ? "تشخیص خودکار" : "Auto-detect"}</option><option value="html">HTML</option><option value="markdown">Markdown</option></AccessibleSelect></label>
          <label className="ai-field">{fa ? "نوع خروجی" : "Output mode"}<AccessibleSelect hasVisibleLabel fieldLabel={fa ? "نوع خروجی" : "Output mode"} className="ai-input" value={exportMode} onChange={event => setExportMode(event.target.value as "editable" | "visual")}><option value="editable">{fa ? "ساختار قابل‌ویرایش" : "Editable structure"}</option><option value="visual">{fa ? "تصویری، حفظ چیدمان" : "Visual layout"}</option></AccessibleSelect></label>
          <label className="ai-field">{fa ? "جهت متن" : "Text direction"}<AccessibleSelect hasVisibleLabel fieldLabel={fa ? "جهت متن" : "Text direction"} className="ai-input" value={direction} onChange={event => setDirection(event.target.value as ExportSettings["direction"])}><option value="auto">{fa ? "تشخیص خودکار" : "Auto-detect"}</option><option value="rtl">RTL · فارسی</option><option value="ltr">LTR · English</option></AccessibleSelect></label>
          <label className="ai-field">{fa ? "حاشیه اسلاید (اینچ؛ حالت قابل‌ویرایش)" : "Slide margin (inches; editable mode)"}<input className="ai-input" type="number" min={.2} max={1} step={.05} value={margin} onChange={event => setMargin(Math.min(1, Math.max(.2, Number(event.target.value))))} /></label>
          <label className="ai-field">{fa ? "کیفیت حالت تصویری" : "Visual quality"}<AccessibleSelect hasVisibleLabel fieldLabel={fa ? "کیفیت حالت تصویری" : "Visual quality"} className="ai-input" value={imageScale} onChange={event => setImageScale(Number(event.target.value))}><option value={1}>{fa ? "استاندارد، حجم کمتر" : "Standard, smaller file"}</option><option value={2}>{fa ? "دو برابر، حجم بیشتر" : "2×, larger file"}</option></AccessibleSelect></label>
          <label className="ai-field">{fa ? "نام سازنده فایل" : "Author"}<input className="ai-input" value={author} onChange={event => setAuthor(event.target.value)} /></label>
          <label className="ai-option"><input type="checkbox" checked={preserveStyles} onChange={event => setPreserveStyles(event.target.checked)} />{fa ? "حفظ فونت و رنگ CSS در خروجی قابل‌ویرایش" : "Preserve CSS sizes and colors in editable mode"}</label>
          <label className="ai-option"><input type="checkbox" checked={showNumbers} onChange={event => setShowNumbers(event.target.checked)} />{fa ? "شماره‌گذاری نهایی اسلایدها" : "Number final slides"}</label>
          <label className="ai-option"><input type="checkbox" checked={notes} onChange={event => setNotes(event.target.checked)} />{fa ? "افزودن متن به یادداشت اسلاید" : "Include text in speaker notes"}</label>
          <label className="ai-option"><input type="checkbox" checked={allowRemoteImages} onChange={event => setAllowRemoteImages(event.target.checked)} />{fa ? "اجازه دریافت تصاویر خارجی (نیازمند CORS)" : "Allow remote image downloads (requires CORS)"}</label>
        </fieldset>
        {exportMode === "visual" && <p className="guide-copy mb-4 text-xs">{fa ? "حالت تصویری از استایل خود HTML استفاده می‌کند؛ تم، حاشیه و اندازه متن مربوط به حالت قابل‌ویرایش‌اند. صفحه‌های بلند به چند اسلاید تقسیم می‌شوند؛ برای کنترل مرزها از بخش‌های دارای class=slide استفاده کنید." : "Visual mode uses the HTML's own styles; theme, margin and text size apply to editable output. Long pages are sliced into slides; use class=slide sections to control boundaries."}</p>}
        {/* Colors */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg ${presetTheme === "custom" ? "border-2 border-[var(--app-accent)] bg-[var(--app-secondary-bg)]" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="text-xs">{content.ui.labels.primaryColor}</span>
            <AccessibleInput fieldLabel={content.ui.labels.primaryColor}
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
            <span className="text-xs font-mono">
              {presetTheme === "custom"
                ? customPrimary
                : `#${activeTheme.primary}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="text-xs">{content.ui.labels.accentColor}</span>
            <AccessibleInput fieldLabel={content.ui.labels.accentColor}
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
            <span className="text-xs font-mono">
              {presetTheme === "custom"
                ? customAccent
                : `#${activeTheme.accent}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <AccessibleInput hasVisibleLabel
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--app-accent)]"
              />
              {content.ui.labels.includeImages}
            </label>
          </div>
        </div>

        {/* Slide footer; filename is selected when the prepared file is saved. */}
        <div className="mb-4">
          <div>
            <label
              className={`text-xs font-medium mb-1 block ${theme.textMuted}`}
            >
              {content.ui.labels.footerText}
            </label>
            <AccessibleInput fieldLabel={content.ui.labels.footerText}
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
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
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
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isConverting && <button className="ai-button mt-3" onClick={() => convertController.current?.abort()}>{fa ? "لغو تبدیل" : "Cancel export"}</button>}
        {resultInfo && <div role="status" className="guide-note mt-4 block"><p>{fa ? "خروجی آماده شد:" : "Export ready:"} {resultInfo.slides} {fa ? "اسلاید" : "slides"} · {(resultInfo.size / 1024).toFixed(1)} KB</p>{resultInfo.warnings.length > 0 && <details className="mt-2"><summary className="cursor-pointer">{fa ? "منابع حذف‌شده یا در دسترس نبودند" : "Skipped or unavailable resources"} ({resultInfo.warnings.length})</summary><ul className="mt-2 max-h-40 overflow-auto text-xs">{resultInfo.warnings.map((warning, index) => <li key={index} dir="auto">{warning}</li>)}</ul></details>}</div>}
        {/* Error */}
        {error && (
          <div role="alert" className="mt-3 flex items-start gap-2 text-xs rounded-lg border px-3 py-2 bg-[var(--app-error-bg)] border-[var(--app-error-border)] text-[var(--app-error-text)]">
            <AlertCircle className="w-4 h-4 mt-[2px] flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Progress */}
        {showProgress && (
          <div className="mt-3 space-y-1">
            <progress className="task-progress" max={100} value={progressStep === "success" ? 100 : actualProgress.total ? Math.min(99, actualProgress.done / actualProgress.total * 100) : undefined} aria-label={fa ? "پیشرفت تبدیل" : "Export progress"} />
            {progressMessage && (
              <p
                className={`text-xs sm:text-xs flex items-center gap-1 ${theme.textMuted}`}
              >
                {progressStep === "success" && <CircleCheck className="h-4 w-4" aria-hidden="true" />}
                {progressMessage} {actualProgress.total ? `(${actualProgress.done}/${actualProgress.total})` : ""}
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
