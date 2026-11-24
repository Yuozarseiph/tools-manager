import type {
  EditorAdjustmentKind,
  EditorBlendMode,
  EditorDocumentPreset,
  EditorFilterKind,
  EditorFontWeight,
  EditorToolId,
} from "./editor-types";

export const EDITOR_BLEND_MODES: EditorBlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
];

export const EDITOR_FONTS = [
  "Arial",
  "Tahoma",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Trebuchet MS",
  "Impact",
  "system-ui",
];

export const EDITOR_FONT_WEIGHTS: EditorFontWeight[] = [
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

export interface AdjustmentParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  def: number;
}

export interface AdjustmentDef {
  kind: EditorAdjustmentKind;
  label: string;
  params: AdjustmentParamDef[];
}

export const EDITOR_ADJUSTMENTS: AdjustmentDef[] = [
  {
    kind: "brightness",
    label: "brightness",
    params: [{ key: "value", label: "value", min: -100, max: 100, step: 1, def: 0 }],
  },
  {
    kind: "contrast",
    label: "contrast",
    params: [{ key: "value", label: "value", min: -100, max: 100, step: 1, def: 0 }],
  },
  {
    kind: "levels",
    label: "levels",
    params: [
      { key: "black", label: "black", min: 0, max: 254, step: 1, def: 0 },
      { key: "white", label: "white", min: 1, max: 255, step: 1, def: 255 },
      { key: "gamma", label: "gamma", min: 10, max: 300, step: 1, def: 100 },
    ],
  },
  {
    kind: "hueSaturation",
    label: "hueSaturation",
    params: [
      { key: "hue", label: "hue", min: -180, max: 180, step: 1, def: 0 },
      { key: "saturation", label: "saturation", min: -100, max: 100, step: 1, def: 0 },
      { key: "lightness", label: "lightness", min: -100, max: 100, step: 1, def: 0 },
    ],
  },
  {
    kind: "colorBalance",
    label: "colorBalance",
    params: [
      { key: "red", label: "red", min: -100, max: 100, step: 1, def: 0 },
      { key: "green", label: "green", min: -100, max: 100, step: 1, def: 0 },
      { key: "blue", label: "blue", min: -100, max: 100, step: 1, def: 0 },
    ],
  },
  {
    kind: "vibrance",
    label: "vibrance",
    params: [{ key: "value", label: "value", min: -100, max: 100, step: 1, def: 0 }],
  },
  {
    kind: "exposure",
    label: "exposure",
    params: [{ key: "value", label: "value", min: -200, max: 200, step: 1, def: 0 }],
  },
  {
    kind: "grayscale",
    label: "grayscale",
    params: [{ key: "amount", label: "amount", min: 0, max: 100, step: 1, def: 100 }],
  },
  {
    kind: "invert",
    label: "invert",
    params: [{ key: "amount", label: "amount", min: 0, max: 100, step: 1, def: 100 }],
  },
  {
    kind: "sepia",
    label: "sepia",
    params: [{ key: "amount", label: "amount", min: 0, max: 100, step: 1, def: 100 }],
  },
  {
    kind: "threshold",
    label: "threshold",
    params: [{ key: "level", label: "level", min: 1, max: 254, step: 1, def: 128 }],
  },
  {
    kind: "posterize",
    label: "posterize",
    params: [{ key: "levels", label: "levels", min: 2, max: 32, step: 1, def: 6 }],
  },
];

export function adjustmentDefinition(kind: EditorAdjustmentKind): AdjustmentDef {
  return EDITOR_ADJUSTMENTS.find((item) => item.kind === kind) ?? EDITOR_ADJUSTMENTS[0];
}

export function defaultAdjustmentParams(kind: EditorAdjustmentKind): Record<string, number> {
  return Object.fromEntries(adjustmentDefinition(kind).params.map((param) => [param.key, param.def]));
}

export interface FilterDef {
  kind: EditorFilterKind;
  label: string;
  min: number;
  max: number;
  def: number;
  unit: "px" | "%" | "levels" | "none";
}

export const EDITOR_FILTERS: FilterDef[] = [
  { kind: "blur", label: "blur", min: 1, max: 40, def: 6, unit: "px" },
  { kind: "sharpen", label: "sharpen", min: 1, max: 100, def: 35, unit: "%" },
  { kind: "pixelate", label: "pixelate", min: 2, max: 60, def: 10, unit: "px" },
  { kind: "noise", label: "noise", min: 1, max: 100, def: 20, unit: "%" },
  { kind: "vignette", label: "vignette", min: 1, max: 100, def: 45, unit: "%" },
  { kind: "emboss", label: "emboss", min: 1, max: 100, def: 60, unit: "%" },
  { kind: "edge", label: "edge", min: 1, max: 100, def: 60, unit: "%" },
  { kind: "grayscale", label: "grayscale", min: 0, max: 100, def: 100, unit: "%" },
  { kind: "sepia", label: "sepia", min: 0, max: 100, def: 100, unit: "%" },
  { kind: "invert", label: "invert", min: 0, max: 100, def: 100, unit: "%" },
  { kind: "posterize", label: "posterize", min: 2, max: 24, def: 6, unit: "levels" },
  { kind: "threshold", label: "threshold", min: 1, max: 254, def: 128, unit: "none" },
];

export function filterDefinition(kind: EditorFilterKind): FilterDef {
  return EDITOR_FILTERS.find((item) => item.kind === kind) ?? EDITOR_FILTERS[0];
}

export interface EditorToolDef {
  id: EditorToolId;
  label: string;
  shortcut: string;
}

export const EDITOR_TOOLS: EditorToolDef[] = [
  { id: "move", label: "move", shortcut: "V" },
  { id: "marquee", label: "marquee", shortcut: "M" },
  { id: "lasso", label: "lasso", shortcut: "L" },
  { id: "crop", label: "crop", shortcut: "C" },
  { id: "brush", label: "brush", shortcut: "B" },
  { id: "eraser", label: "eraser", shortcut: "E" },
  { id: "fill", label: "fill", shortcut: "G" },
  { id: "gradient", label: "gradient", shortcut: "R" },
  { id: "text", label: "text", shortcut: "T" },
  { id: "shape", label: "shape", shortcut: "U" },
  { id: "eyedropper", label: "eyedropper", shortcut: "I" },
  { id: "hand", label: "hand", shortcut: "H" },
  { id: "zoom", label: "zoom", shortcut: "Z" },
];

export const EDITOR_DOCUMENT_PRESETS: EditorDocumentPreset[] = [
  { id: "hd", width: 1920, height: 1080 },
  { id: "fullhd", width: 2560, height: 1440 },
  { id: "square", width: 1080, height: 1080 },
  { id: "story", width: 1080, height: 1920 },
  { id: "a4", width: 2480, height: 3508 },
  { id: "web", width: 1200, height: 800 },
];

export const EDITOR_MAX_DIMENSION = 4096;
export const EDITOR_HISTORY_LIMIT = 30;
