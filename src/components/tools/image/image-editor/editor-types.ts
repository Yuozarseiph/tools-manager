export type EditorToolId =
  | "move"
  | "marquee"
  | "lasso"
  | "crop"
  | "brush"
  | "eraser"
  | "fill"
  | "gradient"
  | "text"
  | "shape"
  | "eyedropper"
  | "hand"
  | "zoom";

export type EditorBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export type EditorLayerKind = "raster" | "text" | "shape" | "adjustment";

export type EditorAdjustmentKind =
  | "brightness"
  | "contrast"
  | "levels"
  | "hueSaturation"
  | "colorBalance"
  | "vibrance"
  | "exposure"
  | "grayscale"
  | "invert"
  | "sepia"
  | "threshold"
  | "posterize";

export type EditorFilterKind =
  | "blur"
  | "sharpen"
  | "pixelate"
  | "noise"
  | "vignette"
  | "emboss"
  | "edge"
  | "grayscale"
  | "sepia"
  | "invert"
  | "posterize"
  | "threshold";

export type EditorShapeKind = "rect" | "ellipse" | "line";

export type EditorFontWeight = "300" | "400" | "500" | "600" | "700" | "800" | "900";

export type EditorTextAlign = "left" | "center" | "right";

export interface EditorSelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditorPoint {
  x: number;
  y: number;
}

/** A selection is a closed polygon; rectangles use four corner points. */
export interface EditorSelection {
  points: EditorPoint[];
  bounds: EditorSelectionRect;
}

export interface EditorLayerBase {
  id: string;
  name: string;
  kind: EditorLayerKind;
  visible: boolean;
  locked: boolean;
  /** 0..1 */
  opacity: number;
  blend: EditorBlendMode;
  /** Horizontal offset in document pixels. */
  x: number;
  /** Vertical offset in document pixels. */
  y: number;
  /** Radians. */
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface EditorRasterLayer extends EditorLayerBase {
  kind: "raster";
  canvas: HTMLCanvasElement;
  /** Bounds of placed image pixels within the document-sized raster canvas. */
  contentRect?: EditorSelectionRect;
}

export interface EditorTextLayer extends EditorLayerBase {
  kind: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: EditorFontWeight;
  fontStyle: "normal" | "italic";
  align: EditorTextAlign;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface EditorShapeLayer extends EditorLayerBase {
  kind: "shape";
  shape: EditorShapeKind;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
}

export interface EditorAdjustmentLayer extends EditorLayerBase {
  kind: "adjustment";
  adjustment: EditorAdjustmentKind;
  /** Numeric parameters depend on the adjustment kind. */
  params: Record<string, number>;
}

export type EditorLayer =
  | EditorRasterLayer
  | EditorTextLayer
  | EditorShapeLayer
  | EditorAdjustmentLayer;

export interface EditorDocument {
  name: string;
  width: number;
  height: number;
  layers: EditorLayer[];
  activeLayerId: string | null;
  selection: EditorSelection | null;
}

export interface EditorHistoryEntry {
  id: string;
  label: string;
  doc: EditorDocument;
}

export interface EditorHistoryState {
  entries: EditorHistoryEntry[];
  index: number;
}

export interface EditorBrushSettings {
  size: number;
  /** 0..1 */
  hardness: number;
  /** 0..1 */
  opacity: number;
  /** 0..1 */
  flow: number;
}

export interface EditorGradientSettings {
  type: "linear" | "radial";
  from: string;
  to: string;
}

export interface EditorFilterPreview {
  layerId: string;
  kind: EditorFilterKind;
  amount: number;
  canvas: HTMLCanvasElement;
}

export type EditorCropDraft = EditorSelectionRect;

export interface EditorDocumentPreset {
  id: string;
  width: number;
  height: number;
}

export interface EditorLayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  corners: { x: number; y: number }[];
}
