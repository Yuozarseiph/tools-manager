"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/context/LanguageContext";
import type { DocCategoryKey } from "@/data/docs";

// --- Types مشترک docs ---

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
  howItWorks?: string[];
  privacyNote?: string;
  technicalNote?: {
    title: string;
    content: string;
  };
}

// --- Base64 ---

export interface Base64ToolContent extends BaseDocsFields {
  id: "base64";
  ui: {
    input: {
      labelPlain: string;
      labelBase64: string;
      badge: string;
      placeholderPlain: string;
      placeholderBase64: string;
    };
    output: {
      labelPlain: string;
      labelBase64: string;
      badge: string;
      placeholder: string;
    };
    buttons: {
      swapTitle: string;
      copy: string;
      copied: string;
    };
    errors: {
      invalid: string;
    };
  };
}

// --- Color Picker ---

export interface ColorPickerToolContent extends BaseDocsFields {
  id: "color-picker";
  ui: {
    format: {
      label: string;
    };
    upload: {
      dropTitle: string;
      dropSubtitle: string;
      loading: string;
    };
    currentColor: {
      title: string;
      copy: string;
      copied: string;
    };
    palette: {
      title: string;
      generateComplementaryTitle: string;
      downloadCssTitle: string;
    };
    history: {
      title: string;
      clearAll: string;
    };
  };
}

// --- Date Converter ---
export interface DateConverterToolContent extends BaseDocsFields {
  id: "date-converter";
  ui: {
    modes: {
      shamsiToGregorian: string;
      gregorianToShamsi: string;
    };
    inputs: {
      dayLabel: string;
      monthLabel: string;
      yearLabel: string;
      placeholderShamsiYear: string;
      placeholderGregorianYear: string;
    };
    result: {
      title: string;
      invalid: string;
    };
  };
}
export interface HashGeneratorToolContent extends BaseDocsFields {
  id: "hash-generator";
  ui: {
    input: {
      label: string;
      placeholder: string;
    };
    algorithms: {
      sha1: string;
      sha256: string;
      sha384: string;
      sha512: string;
    };
    hashRow: {
      empty: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}
export interface ImageCompressorToolContent extends BaseDocsFields {
  id: "image-compressor";
  ui: {
    upload: {
      dropTitle: string;
    };
    fileInfo: {
      original: string;
      compressed: string;
      reductionSuffix: string;
    };
    settings: {
      title: string;
      qualityLabel: string;
    };
    buttons: {
      start: string;
      download: string;
    };
    alerts: {
      error: string;
    };
  };
}

export interface ImageConverterToolContent extends BaseDocsFields {
  id: "image-converter";
  ui: {
    upload: {
      dropTitle: string;
      dropSubtitle: string;
      addMore: string;
      counterSuffix: string;
    };
    gallery: {
      sizeUnit: string;
    };
    formats: {
      title: string;
      jpegDesc: string;
      pngDesc: string;
      webpDesc: string;
      avifDesc: string;
      gifDesc: string;
      bmpDesc: string;
    };
    quality: {
      label: string;
      low: string;
      high: string;
    };
    buttons: {
      convertSingle: string;
      convertMulti: string;
      processing: string;
      clearAll: string;
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
      subtitle: string;
    };
  };
}

export interface ImageResizerToolContent extends BaseDocsFields {
  id: "image-resizer";
  ui: {
    upload: {
      dropTitle: string;
    };
    fileInfo: {
      originalDims: string;
    };
    inputs: {
      widthLabel: string;
      heightLabel: string;
    };
    buttons: {
      lockTitle: string;
      resizeAndDownload: string;
      clear: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface ImageToPdfToolContent extends BaseDocsFields {
  id: "image-to-pdf";
  ui: {
    upload: {
      selectText: string;
      dropHint: string;
    };
    list: {
      title: string;
      countSuffix: string;
      clearAll: string;
      sizeUnit: string;
    };
    buttons: {
      convert: string;
      converting: string;
      download: string;
    };
    result: {
      ready: string;
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface IPCheckerToolContent extends BaseDocsFields {
  id: "ip-checker";
  ui: {
    main: {
      refreshTitle: string;
      loading: string;
      publicIpLabel: string;
      error: string;
      retry: string;
    };
    badges: {
      location: string;
      isp: string;
      timezone: string;
    };
    details: {
      countryTitle: string;
      regionTitle: string;
      coordsTitle: string;
      ispTitle: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface JsonFormatterToolContent extends BaseDocsFields {
  id: "json-formatter";
  ui: {
    upload: {
      button: string;
      sizeHintPrefix: string;
    };
    toolbar: {
      minify: string;
      prettify: string;
      clear: string;
    };
    input: {
      placeholder: string;
    };
    error: {
      prefix: string;
    };
    tabs: {
      code: string;
      graph: string;
    };
    output: {
      copyTitle: string;
      downloadTitle: string;
    };
    codeView: {
      placeholder: string;
    };
    graphView: {
      emptyText: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface MarkdownToolContent extends BaseDocsFields {
  id: "markdown";
  ui: {
    editor: {
      title: string;
      placeholder: string;
    };
    buttons: {
      clear: string;
      copy: string;
    };
    preview: {
      title: string;
    };
    demo: {
      defaultMarkdown: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface PasswordGeneratorToolContent extends BaseDocsFields {
  id: "password-generator";
  ui: {
    tabs: {
      generate: string;
      analyze: string;
    };
    generate: {
      regenerateTitle: string;
      copyTitle: string;
      lengthLabel: string;
      options: {
        uppercase: string;
        lowercase: string;
        numbers: string;
        symbols: string;
      };
      strength: {
        weak: string;
        medium: string;
        strong: string;
      };
    };
    analyze: {
      inputPlaceholder: string;
      showTitle: string;
      hideTitle: string;
      messages: {
        weak: string;
        medium: string;
        strong: string;
      };
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface PdfMergeToolContent extends BaseDocsFields {
  id: "pdf-merge";
  ui: {
    dropzone: {
      title: string;
      subtitle: string;
    };
    list: {
      title: string;
      countSuffix: string;
      clearAll: string;
      sizeUnit: string;
    };
    buttons: {
      mergeAndDownload: string;
      processing: string;
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
      subtitle: string;
    };
  };
}
export interface QrGeneratorToolContent extends BaseDocsFields {
  id: "qr-generator";
  ui: {
    input: {
      label: string;
      placeholder: string;
    };
    colors: {
      fgLabel: string;
      bgLabel: string;
    };
    size: {
      label: string;
      unit: string;
    };
    buttons: {
      downloadPng: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface TextToPdfToolContent extends BaseDocsFields {
  id: "text-to-pdf";
  ui: {
    toolbar: {
      fontSizeLabel: string;
      alignLeftTitle: string;
      alignCenterTitle: string;
      alignRightTitle: string;
      generateButtonIdle: string;
      generateButtonLoading: string;
    };
    editor: {
      placeholder: string;
      counterSuffixChars: string;
      counterSeparator: string;
      counterSuffixLines: string;
    };
    guide: {
      title: string;
      items: string[];
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface UnitConverterToolContent extends BaseDocsFields {
  id: "unit-converter";
  ui: {
    categories: {
      length: {
        label: string;
        units: Record<string, string>;
      };
      mass: {
        label: string;
        units: Record<string, string>;
      };
      temperature: {
        label: string;
        units: Record<string, string>;
      };
    };
    input: {
      amountLabel: string;
      resultLabel: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface UserAgentToolContent extends BaseDocsFields {
  id: "user-agent";
  ui: {
    raw: {
      title: string;
      copy: string;
      copied: string;
    };
    cards: {
      browser: {
        title: string;
        enginePrefix: string;
      };
      os: {
        title: string;
        archPrefix: string;
      };
      device: {
        title: string;
        fallback: string;
        desktopLabel: string;
      };
      cpu: {
        title: string;
        fallback: string;
        coresSuffix: string;
      };
    };
    details: {
      title: string;
      language: string;
      online: string;
      onlineYes: string;
      onlineNo: string;
      cookies: string;
      cookiesYes: string;
      cookiesNo: string;
      screenSize: string;
      colorDepth: string;
      colorDepthSuffix: string;
      platform: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface WordCounterToolContent extends BaseDocsFields {
  id: "word-counter";
  ui: {
    editor: {
      title: string;
      placeholder: string;
    };
    buttons: {
      clearTitle: string;
      copy: string;
      copied: string;
    };
    stats: {
      title: string;
      words: string;
      chars: string;
      charsNoSpace: string;
      sentences: string;
      paragraphs: string;
    };
    readingTime: {
      label: string;
      unit: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface WordToPdfToolContent extends BaseDocsFields {
  id: "word-to-pdf";
  ui: {
    upload: {
      title: string;
      subtitle: string;
    };
    file: {
      sizeUnit: string;
      removeTitle: string;
    };
    errors: {
      invalidType: string;
      emptyContent: string;
      iframeAccess: string;
      genericPrefix: string;
      unknown: string;
    };
    progress: {
      reading: string;
      converting: string;
      rendering: string;
      generating: string;
      success: string;
    };
    buttons: {
      convertIdle: string;
      convertLoading: string;
      manualDownload: string; 
    };
    guide: {
      title: string;
      items: string[];
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface CodeVisualizerToolContent extends BaseDocsFields {
  id: "code-visualizer";
  ui: {
    header: {
      title: string;
      subtitleJs: string;
      subtitleCsharp: string;
    };
    languageToggle: {
      js: string;
      csharp: string;
    };
    layout: {
      hierarchical: string;
      tree: string;
      compact: string;
    };
    actions: {
      loadExample: string;
      refresh: string;
      fullscreen: string;
      exitFullscreen: string;
    };
    stats: {
      nodes: string;
      edges: string;
      depth: string;
      status: string;
      statusProcessing: string;
      statusReady: string;
      statusEmpty: string;
      statusPromptMobile: string;
      summaryPrefix: string;
      summaryNodesSuffix: string;
      summaryEdgesSuffix: string;
    };
    editor: {
      title: string;
      placeholderJs: string;
      placeholderCsharp: string;
      modeBadgeJs: string;
      modeBadgeCsharp: string;
      linesSuffix: string;
      hintTitle: string;
      hintJs: string;
      hintCsharp: string;
      debounceDesktop: string;
      debounceMobile: string;
    };
    graph: {
      building: string;
      emptyTitleMobile: string;
      emptyTitleDesktop: string;
      emptyDescription: string;
      backToEditorMobile: string;
      statusEmpty: string;
      statusWithNodesPrefix: string;
      statusNodesSuffix: string;
      dragHint: string;
    };
    mobile: {
      toggleEditor: string;
      toggleGraph: string;
      betterOnDesktop: string;
    };
    tips: {
      title: string;
      items: string[];
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export interface ExcelChartToolContent extends BaseDocsFields {
  id: "excel-chart";
  ui: {
    upload: {
      buttonInitial: string;
      buttonChange: string;
      acceptHint: string;
    };
    chartTypes: {
      bar: { label: string; title: string };
      line: { label: string; title: string };
      area: { label: string; title: string };
      pie: { label: string; title: string };
    };
    persianNumbers: {
      title: string;
      description: string;
    };
    mapping: {
      xAxisLabel: string;
      numericLabelBar: string;
      numericLabelArea: string;
      numericLabelSingle: string;
      numericPlaceholder: string;
    };
    settings: {
      title: string;
      rangeLabel: string;
      pieHint: string;
      rangeSummaryPrefix: string;
      rangeSummaryMiddle: string;
      rangeSummarySuffix: string;
    };
    zoom: {
      compact: string;
      expanded: string;
      pieDisabled: string;
    };
    empty: {
      title: string;
      description: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}
export interface ExcelEditorToolContent extends BaseDocsFields {
  id: "excel-editor";
  ui: {
    upload: {
      buttonInitial: string;
      buttonChange: string;
      acceptHint: string;
    };
    actions: {
      exportExcel: string;
      addRow: string;
      undoTitle: string;
      closeFileTitle: string;
      resetConfirm: string;
    };
    search: {
      placeholder: string;
    };
    table: {
      indexHeader: string;
      deleteHeader: string;
      deleteTooltip: string;
    };
    pagination: {
      summaryPrefix: string;
      summaryFromToSeparator: string;
      summaryOfWord: string;
      summarySuffix: string;
    };
    empty: {
      title: string;
      description: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}
export interface ExcelViewerToolContent extends BaseDocsFields {
  id: "excel-viewer";
  ui: {
    upload: {
      buttonInitial: string;
      acceptHint: string;
    };
    toolbar: {
      zoomOutTitle: string;
      zoomInTitle: string;
      fullscreenTitle: string;
      csvTitle: string;
      jsonTitle: string;
      closeTitle: string;
    };
    search: {
      placeholder: string;
    };
    sheets: {
      iconLabel: string;
    };
    summary: {
      totalPrefix: string;
      visiblePrefix: string;
    };
    empty: {
      title: string;
      description: string;
    };
    page: {
      title: string;
      description: string;
    };
    seo: {
      whyTitle: string;
      reasons: string[];
    };
  };
}
export interface AudioEditorToolContent extends BaseDocsFields {
  id: "audio-editor";
  ui: {
    tabs: {
      trim: string;
      volume: string;
    };
    header: {
      smallTitle: string;
      subtitle: string;
    };
    trim: {
      upload: {
        title: string;
        description: string;
        button: string;
      };
      fileInfo: {
        totalDurationLabel: string;
        currentPositionLabel: string;
        selectionLabel: string;
        noFileTitle: string;
        noFileDescription: string;
      };
      transport: {
        playAll: string;
        stop: string;
        playHelper: string;
      };
      selection: {
        title: string;
        resetLabel: string;
        startLabel: string;
        endLabel: string;
        playSelectionPrefix: string;
        downloadIdle: string;
        downloadWorking: string;
      };
      fade: {
        title: string;
        description: string;
        fadeInLabel: string;
        fadeOutLabel: string;
        fadeInDurationLabel: string;
        fadeOutDurationLabel: string;
      };
      errors: {
        decode: string;
        export: string;
      };
      empty: {
        title: string;
        description: string;
      };
    };
    volume: {
      upload: {
        title: string;
        description: string;
        button: string;
      };
      fileInfo: {
        durationLabel: string;
        currentPositionLabel: string;
        noFileTitle: string;
        noFileDescription: string;
      };
      transport: {
        play: string;
        stop: string;
        helper: string;
      };
      controls: {
        title: string;
        description: string;
        gainLabel: string;
        normalizeLabel: string;
      };
      actions: {
        downloadIdle: string;
        downloadWorking: string;
      };
      errors: {
        decode: string;
        export: string;
      };
      empty: {
        title: string;
        description: string;
      };
    };
    page: {
      title: string;
      description: string;
    };
  };
}

export type AnyToolContent =
  | Base64ToolContent
  | ColorPickerToolContent
  | DateConverterToolContent
  | HashGeneratorToolContent
  | ImageCompressorToolContent
  | ImageConverterToolContent
  | ImageResizerToolContent
  | ImageToPdfToolContent
  | IPCheckerToolContent
  | JsonFormatterToolContent
  | MarkdownToolContent
  | PasswordGeneratorToolContent
  | PdfMergeToolContent
  | QrGeneratorToolContent
  | TextToPdfToolContent
  | UnitConverterToolContent
  | UserAgentToolContent
  | WordCounterToolContent
  | WordToPdfToolContent
  | CodeVisualizerToolContent
  | ExcelChartToolContent
  | ExcelEditorToolContent
  | ExcelViewerToolContent
  | AudioEditorToolContent;

export type ToolId =
  | "base64"
  | "color-picker"
  | "date-converter"
  | "hash-generator"
  | "image-compressor"
  | "image-converter"
  | "image-resizer"
  | "image-to-pdf"
  | "ip-checker"
  | "json-formatter"
  | "markdown"
  | "password-generator"
  | "pdf-merge"
  | "qr-generator"
  | "text-to-pdf"
  | "unit-converter"
  | "user-agent"
  | "word-counter"
  | "word-to-pdf"
  | "code-visualizer"
  | "excel-chart"
  | "excel-editor"
  | "excel-viewer"
  | "audio-editor";

// imports
import audioEditorFa from "@/data/docs/tools/fa/audio-editor.fa.json";
import audioEditorEn from "@/data/docs/tools/en/audio-editor.en.json";

import excelViewerFa from "@/data/docs/tools/fa/excel-viewer.fa.json";
import excelViewerEn from "@/data/docs/tools/en/excel-viewer.en.json";

import excelEditorFa from "@/data/docs/tools/fa/excel-editor.fa.json";
import excelEditorEn from "@/data/docs/tools/en/excel-editor.en.json";

import excelChartFa from "@/data/docs/tools/fa/excel-chart.fa.json";
import excelChartEn from "@/data/docs/tools/en/excel-chart.en.json";

import codeVisualizerFa from "@/data/docs/tools/fa/code-visualizer.fa.json";
import codeVisualizerEn from "@/data/docs/tools/en/code-visualizer.en.json";

import wordToPdfFa from "@/data/docs/tools/fa/word-to-pdf.fa.json";
import wordToPdfEn from "@/data/docs/tools/en/word-to-pdf.en.json";

import wordCounterFa from "@/data/docs/tools/fa/word-counter.fa.json";
import wordCounterEn from "@/data/docs/tools/en/word-counter.en.json";

import userAgentFa from "@/data/docs/tools/fa/user-agent.fa.json";
import userAgentEn from "@/data/docs/tools/en/user-agent.en.json";

import unitConverterFa from "@/data/docs/tools/fa/unit-converter.fa.json";
import unitConverterEn from "@/data/docs/tools/en/unit-converter.en.json";

import textToPdfFa from "@/data/docs/tools/fa/text-to-pdf.fa.json";
import textToPdfEn from "@/data/docs/tools/en/text-to-pdf.en.json";

import qrGeneratorFa from "@/data/docs/tools/fa/qr-generator.fa.json";
import qrGeneratorEn from "@/data/docs/tools/en/qr-generator.en.json";

import pdfMergeFa from "@/data/docs/tools/fa/pdf-merge.fa.json";
import pdfMergeEn from "@/data/docs/tools/en/pdf-merge.en.json";

import passwordGeneratorFa from "@/data/docs/tools/fa/password-generator.fa.json";
import passwordGeneratorEn from "@/data/docs/tools/en/password-generator.en.json";

import markdownFa from "@/data/docs/tools/fa/markdown.fa.json";
import markdownEn from "@/data/docs/tools/en/markdown.en.json";

import jsonFormatterFa from "@/data/docs/tools/fa/json-formatter.fa.json";
import jsonFormatterEn from "@/data/docs/tools/en/json-formatter.en.json";

import ipCheckerFa from "@/data/docs/tools/fa/ip-checker.fa.json";
import ipCheckerEn from "@/data/docs/tools/en/ip-checker.en.json";

import imageToPdfFa from "@/data/docs/tools/fa/image-to-pdf.fa.json";
import imageToPdfEn from "@/data/docs/tools/en/image-to-pdf.en.json";

import imageResizerFa from "@/data/docs/tools/fa/image-resizer.fa.json";
import imageResizerEn from "@/data/docs/tools/en/image-resizer.en.json";

import base64Fa from "@/data/docs/tools/fa/base64.fa.json";
import base64En from "@/data/docs/tools/en/base64.en.json";

import colorPickerFa from "@/data/docs/tools/fa/color-picker.fa.json";
import colorPickerEn from "@/data/docs/tools/en/color-picker.en.json";

import dateConverterFa from "@/data/docs/tools/fa/date-converter.fa.json";
import dateConverterEn from "@/data/docs/tools/en/date-converter.en.json";

import hashGeneratorFa from "@/data/docs/tools/fa/hash-generator.fa.json";
import hashGeneratorEn from "@/data/docs/tools/en/hash-generator.en.json";

import imageCompressorFa from "@/data/docs/tools/fa/image-compressor.fa.json";
import imageCompressorEn from "@/data/docs/tools/en/image-compressor.en.json";

import imageConverterFa from "@/data/docs/tools/fa/image-converter.fa.json";
import imageConverterEn from "@/data/docs/tools/en/image-converter.en.json";

const TOOL_CONTENT: Record<Locale, Record<ToolId, AnyToolContent>> = {
  fa: {
    base64: base64Fa as Base64ToolContent,
    "color-picker": colorPickerFa as ColorPickerToolContent,
    "date-converter": dateConverterFa as DateConverterToolContent,
    "hash-generator": hashGeneratorFa as HashGeneratorToolContent,
    "image-compressor": imageCompressorFa as ImageCompressorToolContent,
    "image-converter": imageConverterFa as ImageConverterToolContent,
    "image-resizer": imageResizerFa as ImageResizerToolContent,
    "image-to-pdf": imageToPdfFa as ImageToPdfToolContent,
    "ip-checker": ipCheckerFa as IPCheckerToolContent,
    "json-formatter": jsonFormatterFa as JsonFormatterToolContent,
    markdown: markdownFa as MarkdownToolContent,
    "password-generator": passwordGeneratorFa as PasswordGeneratorToolContent,
    "pdf-merge": pdfMergeFa as PdfMergeToolContent,
    "qr-generator": qrGeneratorFa as QrGeneratorToolContent,
    "text-to-pdf": textToPdfFa as TextToPdfToolContent,
    "unit-converter": unitConverterFa as UnitConverterToolContent,
    "user-agent": userAgentFa as UserAgentToolContent,
    "word-counter": wordCounterFa as WordCounterToolContent,
    "word-to-pdf": wordToPdfFa as WordToPdfToolContent,
    "code-visualizer": codeVisualizerFa as CodeVisualizerToolContent,
    "excel-chart": excelChartFa as ExcelChartToolContent,
    "excel-editor": excelEditorFa as ExcelEditorToolContent,
    "excel-viewer": excelViewerFa as ExcelViewerToolContent,
    "audio-editor": audioEditorFa as AudioEditorToolContent,
  },
  en: {
    base64: base64En as Base64ToolContent,
    "color-picker": colorPickerEn as ColorPickerToolContent,
    "date-converter": dateConverterEn as DateConverterToolContent,
    "hash-generator": hashGeneratorEn as HashGeneratorToolContent,
    "image-compressor": imageCompressorEn as ImageCompressorToolContent,
    "image-converter": imageConverterEn as ImageConverterToolContent,
    "image-resizer": imageResizerEn as ImageResizerToolContent,
    "image-to-pdf": imageToPdfEn as ImageToPdfToolContent,
    "ip-checker": ipCheckerEn as IPCheckerToolContent,
    "json-formatter": jsonFormatterEn as JsonFormatterToolContent,
    markdown: markdownEn as MarkdownToolContent,
    "password-generator": passwordGeneratorEn as PasswordGeneratorToolContent,
    "pdf-merge": pdfMergeEn as PdfMergeToolContent,
    "qr-generator": qrGeneratorEn as QrGeneratorToolContent,
    "text-to-pdf": textToPdfEn as TextToPdfToolContent,
    "unit-converter": unitConverterEn as UnitConverterToolContent,
    "user-agent": userAgentEn as UserAgentToolContent,
    "word-counter": wordCounterEn as WordCounterToolContent,
    "word-to-pdf": wordToPdfEn as WordToPdfToolContent,
    "code-visualizer": codeVisualizerEn as CodeVisualizerToolContent,
    "excel-chart": excelChartEn as ExcelChartToolContent,
    "excel-editor": excelEditorEn as ExcelEditorToolContent,
    "excel-viewer": excelViewerEn as ExcelViewerToolContent,
    "audio-editor": audioEditorEn as AudioEditorToolContent,
  },
};
export function useToolContent<T = AnyToolContent>(toolId: ToolId): T {
  const { locale } = useLanguage();
  const toolContent = TOOL_CONTENT[locale][toolId];
  return toolContent as T;
}
