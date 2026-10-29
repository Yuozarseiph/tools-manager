"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveFile } from "@/lib/file-export";
import { outputFilename } from "@/lib/output-name";
import {
  adjustmentDefinition,
  defaultAdjustmentParams,
  EDITOR_HISTORY_LIMIT,
} from "./editor-constants";
import type {
  EditorAdjustmentKind,
  EditorBrushSettings,
  EditorDocument,
  EditorFilterKind,
  EditorFilterPreview,
  EditorFontWeight,
  EditorGradientSettings,
  EditorHistoryState,
  EditorLayer,
  EditorLayerBase,
  EditorPoint,
  EditorRasterLayer,
  EditorSelection,
  EditorSelectionRect,
  EditorShapeKind,
  EditorShapeLayer,
  EditorTextAlign,
  EditorTextLayer,
  EditorToolId,
} from "./editor-types";
import {
  applyAdjustment,
  applyFilterInSelection,
  canvasToBlob,
  clamp,
  cloneCanvas,
  createCanvas,
  cropDocument,
  drawLayer,
  exportPsdFile,
  fillSelectionOnCanvas,
  flipDocument,
  getLayerBounds,
  importPsdFile,
  limitDimension,
  loadImageElement,
  rectSelection,
  renderCompositeCanvas,
  renderLayerCanvas,
  resizeDocument,
  rotateDocument,
  uid,
} from "./image-editor.utils";

export interface EditorTextDefaults {
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

export interface EditorShapeDefaults {
  shape: EditorShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
}

export interface EditorNotice {
  key: string;
  tone: "info" | "success" | "error";
  values?: Record<string, string | number>;
}

const DEFAULT_TEXT: EditorTextDefaults = {
  fontFamily: "Arial",
  fontSize: 64,
  fontWeight: "700",
  fontStyle: "normal",
  align: "center",
  lineHeight: 1.2,
  letterSpacing: 0,
  color: "#111827",
  strokeColor: "#000000",
  strokeWidth: 0,
  shadowColor: "#000000",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

const DEFAULT_SHAPE: EditorShapeDefaults = {
  shape: "rect",
  fill: "#3b82f6",
  stroke: "#ffffff",
  strokeWidth: 0,
  radius: 12,
};

function baseLayer(kind: EditorLayer["kind"], name: string): EditorLayerBase {
  return {
    id: uid("layer"),
    name,
    kind,
    visible: true,
    locked: false,
    opacity: 1,
    blend: "normal",
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
}

export function createRasterLayer(
  width: number,
  height: number,
  name: string,
  fill?: string
): EditorRasterLayer {
  const { canvas, ctx } = createCanvas(width, height);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
  }
  return { ...baseLayer("raster", name), kind: "raster", canvas };
}

function documentWithSelection(doc: EditorDocument, selection: EditorSelection | null): EditorDocument {
  return { ...doc, selection };
}

export function useImageEditor() {
  const [doc, setDoc] = useState<EditorDocument | null>(null);
  const [tool, setTool] = useState<EditorToolId>("move");
  const [zoom, setZoom] = useState(1);
  const [fitRequest, setFitRequest] = useState(0);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<EditorNotice | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  const [brush, setBrush] = useState<EditorBrushSettings>({
    size: 48,
    hardness: 0.75,
    opacity: 1,
    flow: 0.9,
  });
  const [fillTolerance, setFillTolerance] = useState(32);
  const [eraser, setEraser] = useState<EditorBrushSettings>({
    size: 64,
    hardness: 0.85,
    opacity: 1,
    flow: 1,
  });
  const [gradient, setGradient] = useState<EditorGradientSettings>({
    type: "linear",
    from: "#ffffff",
    to: "#000000",
  });
  const [shapeDefaults, setShapeDefaults] = useState<EditorShapeDefaults>(DEFAULT_SHAPE);
  const [textDefaults, setTextDefaults] = useState<EditorTextDefaults>(DEFAULT_TEXT);

  const [history, setHistory] = useState<EditorHistoryState>({ entries: [], index: -1 });
  const [preview, setPreview] = useState<EditorFilterPreview | null>(null);

  const docRef = useRef<EditorDocument | null>(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  const activeLayer = doc?.layers.find((layer) => layer.id === doc.activeLayerId) ?? null;

  const notify = useCallback((key: string, tone: EditorNotice["tone"] = "info", values?: EditorNotice["values"]) => {
    setNotice({ key, tone, values });
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4200);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    },
    []
  );

  const bump = useCallback(() => setRevision((value) => value + 1), []);

  const pushHistory = useCallback((label: string, snapshot: EditorDocument) => {
    setHistory((previous) => {
      const entries = [
        ...previous.entries.slice(0, previous.index + 1),
        { id: uid("history"), label, doc: snapshot },
      ];
      if (entries.length > EDITOR_HISTORY_LIMIT) entries.splice(0, entries.length - EDITOR_HISTORY_LIMIT);
      return { entries, index: entries.length - 1 };
    });
  }, []);

  const commit = useCallback(
    (label: string, next: EditorDocument) => {
      docRef.current = next;
      pushHistory(label, next);
      setDoc(next);
      setPreview(null);
      bump();
    },
    [bump, pushHistory]
  );

  const loadDocument = useCallback(
    (next: EditorDocument, label: string) => {
      docRef.current = next;
      setDoc(next);
      setHistory({ entries: [{ id: uid("history"), label, doc: next }], index: 0 });
      setPreview(null);
      setZoom(1);
      setTool("move");
      bump();
    },
    [bump]
  );

  const recordHistory = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (current) pushHistory(label, current);
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    setHistory((previous) => {
      if (previous.index <= 0) return previous;
      const index = previous.index - 1;
      docRef.current = previous.entries[index].doc;
      setDoc(previous.entries[index].doc);
      setPreview(null);
      setRevision((value) => value + 1);
      return { ...previous, index };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((previous) => {
      if (previous.index >= previous.entries.length - 1) return previous;
      const index = previous.index + 1;
      docRef.current = previous.entries[index].doc;
      setDoc(previous.entries[index].doc);
      setPreview(null);
      setRevision((value) => value + 1);
      return { ...previous, index };
    });
  }, []);

  const canUndo = history.index > 0;
  const canRedo = history.index >= 0 && history.index < history.entries.length - 1;

  const jumpTo = useCallback((index: number) => {
    setHistory((previous) => {
      if (index < 0 || index >= previous.entries.length || index === previous.index) return previous;
      docRef.current = previous.entries[index].doc;
      setDoc(previous.entries[index].doc);
      setPreview(null);
      setRevision((value) => value + 1);
      return { ...previous, index };
    });
  }, []);

  const patchLayer = useCallback(
    (id: string, patch: Record<string, unknown>, label?: string) => {
      const current = docRef.current;
      if (!current) return;
      const layers = current.layers.map((layer) =>
        layer.id === id ? ({ ...layer, ...patch } as EditorLayer) : layer
      );
      const next = { ...current, layers };
      docRef.current = next;
      if (label) commit(label, next);
      else {
        setDoc(next);
        bump();
      }
    },
    [bump, commit]
  );

  const updateLayerWith = useCallback(
    (id: string, updater: (layer: EditorLayer) => EditorLayer, label?: string) => {
      const current = docRef.current;
      if (!current) return;
      const layers = current.layers.map((layer) => (layer.id === id ? updater(layer) : layer));
      const next = { ...current, layers };
      docRef.current = next;
      if (label) commit(label, next);
      else {
        setDoc(next);
        bump();
      }
    },
    [bump, commit]
  );

  const setActiveLayer = useCallback((id: string) => {
    const current = docRef.current;
    if (!current || !current.layers.some((layer) => layer.id === id)) return;
    const next = { ...current, activeLayerId: id };
    docRef.current = next;
    setDoc(next);
  }, []);

  const setSelection = useCallback((selection: EditorSelection | null) => {
    const current = docRef.current;
    if (!current) return;
    const next = documentWithSelection(current, selection);
    docRef.current = next;
    setDoc(next);
    bump();
  }, [bump]);

  const selectAll = useCallback(() => {
    const current = docRef.current;
    if (!current) return;
    setSelection(rectSelection({ x: 0, y: 0, width: current.width, height: current.height }));
  }, [setSelection]);

  const deselect = useCallback(() => setSelection(null), [setSelection]);

  /* ---------------------------------------------------------------- */
  /* Document creation and opening                                     */
  /* ---------------------------------------------------------------- */

  const newDocument = useCallback(
    (width: number, height: number, background: "white" | "black" | "transparent", label: string) => {
      const size = limitDimension(width, height);
      const layer =
        background === "transparent"
          ? createRasterLayer(size.width, size.height, "Layer 1")
          : createRasterLayer(size.width, size.height, "Background", background === "white" ? "#ffffff" : "#000000");
      const next: EditorDocument = {
        name: "Untitled",
        width: size.width,
        height: size.height,
        layers: [layer],
        activeLayerId: layer.id,
        selection: null,
      };
      loadDocument(next, label);
      notify("newDocument", "success");
    },
    [loadDocument, notify]
  );

  const openFile = useCallback(
    async (file: File, labels: { open: string; psd: string }) => {
      setBusy(true);
      setNotice(null);
      try {
        const isPsd = file.name.toLowerCase().endsWith(".psd") || file.name.toLowerCase().endsWith(".psb");
        if (isPsd) {
          const result = await importPsdFile(file);
          loadDocument(result.doc, labels.psd);
          if (result.skipped > 0) notify("psdSkipped", "info", { count: result.skipped });
          else notify("psdLoaded", "success");
          return;
        }

        const url = URL.createObjectURL(file);
        try {
          const image = await loadImageElement(url);
          const size = limitDimension(image.width, image.height);
          const { canvas, ctx } = createCanvas(size.width, size.height);
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(image, 0, 0, size.width, size.height);
          const layer: EditorRasterLayer = {
            ...baseLayer("raster", file.name.replace(/\.[^.]+$/, "") || "Background"),
            kind: "raster",
            canvas,
          };
          loadDocument(
            {
              name: file.name.replace(/\.[^.]+$/, "") || "Untitled",
              width: size.width,
              height: size.height,
              layers: [layer],
              activeLayerId: layer.id,
              selection: null,
            },
            labels.open
          );
          if (size.width !== image.width || size.height !== image.height) {
            notify("imageResized", "info", { width: size.width, height: size.height });
          } else {
            notify("imageLoaded", "success");
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Image open failed", error);
        notify("imageError", "error");
      } finally {
        setBusy(false);
      }
    },
    [loadDocument, notify]
  );

  const openImageFromUrl = useCallback(
    async (url: string, label: string) => {
      setBusy(true);
      setNotice(null);
      try {
        const image = await loadImageElement(url);
        const size = limitDimension(image.width, image.height);
        const { canvas, ctx } = createCanvas(size.width, size.height);
        ctx.drawImage(image, 0, 0, size.width, size.height);
        const layer: EditorRasterLayer = {
          ...baseLayer("raster", "Background"),
          kind: "raster",
          canvas,
        };
        loadDocument(
          {
            name: "Untitled",
            width: size.width,
            height: size.height,
            layers: [layer],
            activeLayerId: layer.id,
            selection: null,
          },
          label
        );
        notify("imageLoaded", "success");
      } catch (error) {
        console.error("URL image failed", error);
        notify("urlError", "error");
      } finally {
        setBusy(false);
      }
    },
    [loadDocument, notify]
  );

  const closeDocument = useCallback(() => {
    docRef.current = null;
    setDoc(null);
    setHistory({ entries: [], index: -1 });
    setPreview(null);
    setNotice(null);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Layers                                                            */
  /* ---------------------------------------------------------------- */

  /** Adds a new image as its own editable layer without replacing the open document. */
  const placeImageFile = useCallback(
    async (file: File, label: string) => {
      if (!file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".svg")) {
        notify("imageError", "error");
        return;
      }
      if (!docRef.current) return;
      setBusy(true);
      try {
        const url = URL.createObjectURL(file);
        try {
          const image = await loadImageElement(url);
          const current = docRef.current;
          if (!current) return;
          const factor = Math.min(1, current.width / image.width, current.height / image.height);
          const width = Math.max(1, Math.round(image.width * factor));
          const height = Math.max(1, Math.round(image.height * factor));
          const left = Math.round((current.width - width) / 2);
          const top = Math.round((current.height - height) / 2);
          const { canvas, ctx } = createCanvas(current.width, current.height);
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(image, left, top, width, height);
          const layer: EditorRasterLayer = {
            ...baseLayer("raster", file.name.replace(/\.[^.]+$/, "") || label),
            kind: "raster",
            canvas,
            contentRect: { x: left, y: top, width, height },
          };
          commit(label, { ...current, layers: [...current.layers, layer], activeLayerId: layer.id });
          setTool("move");
          notify("imagePlaced", "success");
        } finally {
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Image placement failed", error);
        notify("imageError", "error");
      } finally {
        setBusy(false);
      }
    },
    [commit, notify]
  );

  const addRasterLayer = useCallback(
    (label: string, name: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = createRasterLayer(current.width, current.height, name);
      commit(label, { ...current, layers: [...current.layers, layer], activeLayerId: layer.id });
    },
    [commit]
  );

  const addTextLayer = useCallback(
    (point: EditorPoint, label: string, name: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer: EditorTextLayer = {
        ...baseLayer("text", name),
        kind: "text",
        x: point.x,
        y: point.y,
        text: name,
        fontFamily: textDefaults.fontFamily,
        fontSize: textDefaults.fontSize,
        fontWeight: textDefaults.fontWeight,
        fontStyle: textDefaults.fontStyle,
        align: textDefaults.align,
        lineHeight: textDefaults.lineHeight,
        letterSpacing: textDefaults.letterSpacing,
        color: textDefaults.color,
        strokeColor: textDefaults.strokeColor,
        strokeWidth: textDefaults.strokeWidth,
        shadowColor: textDefaults.shadowColor,
        shadowBlur: textDefaults.shadowBlur,
        shadowOffsetX: textDefaults.shadowOffsetX,
        shadowOffsetY: textDefaults.shadowOffsetY,
      };
      commit(label, { ...current, layers: [...current.layers, layer], activeLayerId: layer.id });
    },
    [commit, textDefaults]
  );

  const addShapeLayer = useCallback(
    (start: EditorPoint, end: EditorPoint, label: string, name: string) => {
      const current = docRef.current;
      if (!current) return;
      const x = (start.x + end.x) / 2;
      const y = (start.y + end.y) / 2;
      const isLine = shapeDefaults.shape === "line";
      const width = isLine
        ? Math.max(1, Math.hypot(end.x - start.x, end.y - start.y))
        : Math.max(1, Math.abs(end.x - start.x));
      const height = isLine ? 1 : Math.max(1, Math.abs(end.y - start.y));
      const layer: EditorShapeLayer = {
        ...baseLayer("shape", name),
        kind: "shape",
        x,
        y,
        width,
        height,
        rotation: isLine ? Math.atan2(end.y - start.y, end.x - start.x) : 0,
        shape: shapeDefaults.shape,
        fill: shapeDefaults.fill,
        stroke: shapeDefaults.stroke,
        strokeWidth: shapeDefaults.strokeWidth,
        radius: shapeDefaults.radius,
      };
      commit(label, { ...current, layers: [...current.layers, layer], activeLayerId: layer.id });
    },
    [commit, shapeDefaults]
  );

  const addAdjustmentLayer = useCallback(
    (kind: EditorAdjustmentKind, label: string, name: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer: EditorLayer = {
        ...baseLayer("adjustment", name),
        kind: "adjustment",
        adjustment: kind,
        params: defaultAdjustmentParams(kind),
      };
      commit(label, { ...current, layers: [...current.layers, layer], activeLayerId: layer.id });
    },
    [commit]
  );

  const duplicateLayer = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer) return;
      const clone: EditorLayer =
        layer.kind === "raster"
          ? { ...layer, id: uid("layer"), name: `${layer.name} copy`, x: layer.x + 18, y: layer.y + 18, canvas: cloneCanvas(layer.canvas) }
          : { ...layer, id: uid("layer"), name: `${layer.name} copy`, x: layer.x + 18, y: layer.y + 18 };
      const index = current.layers.findIndex((item) => item.id === layer.id);
      const layers = [...current.layers];
      layers.splice(index + 1, 0, clone);
      commit(label, { ...current, layers, activeLayerId: clone.id });
    },
    [commit]
  );

  const deleteLayer = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const index = current.layers.findIndex((layer) => layer.id === current.activeLayerId);
      if (index < 0) return;
      const layers = current.layers.filter((layer) => layer.id !== current.activeLayerId);
      const nextActive = layers[Math.min(index, layers.length - 1)]?.id ?? null;
      commit(label, { ...current, layers, activeLayerId: nextActive });
    },
    [commit]
  );

  const moveLayer = useCallback(
    (direction: "up" | "down", label: string) => {
      const current = docRef.current;
      if (!current) return;
      const index = current.layers.findIndex((layer) => layer.id === current.activeLayerId);
      if (index < 0) return;
      const target = direction === "up" ? index + 1 : index - 1;
      if (target < 0 || target >= current.layers.length) return;
      const layers = [...current.layers];
      [layers[index], layers[target]] = [layers[target], layers[index]];
      commit(label, { ...current, layers });
    },
    [commit]
  );

  const reorderLayer = useCallback((fromId: string, toId: string, label: string) => {
    const current = docRef.current;
    if (!current || fromId === toId) return;
    const layers = [...current.layers];
    const sourceIndex = layers.findIndex((layer) => layer.id === fromId);
    const targetIndex = layers.findIndex((layer) => layer.id === toId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    const [layer] = layers.splice(sourceIndex, 1);
    layers.splice(targetIndex, 0, layer);
    commit(label, { ...current, layers, activeLayerId: fromId });
  }, [commit]);

  const renameDocument = useCallback((name: string) => {
    const current = docRef.current;
    if (!current) return;
    const next = { ...current, name: name.trim() || "Untitled" };
    commit("Rename document", next);
  }, [commit]);

  const mergeDown = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const index = current.layers.findIndex((layer) => layer.id === current.activeLayerId);
      if (index <= 0) return;
      const upper = current.layers[index];
      const lower = current.layers[index - 1];

      if (upper.kind === "adjustment") {
        if (lower.kind !== "raster") {
          notify("rasterRequired", "error");
          return;
        }
        const canvas = cloneCanvas(lower.canvas);
        applyAdjustment(canvas, upper.adjustment, upper.params);
        const merged: EditorRasterLayer = { ...lower, canvas };
        const layers = [...current.layers];
        layers.splice(index - 1, 2, merged);
        commit(label, { ...current, layers, activeLayerId: merged.id });
        return;
      }

      const { canvas, ctx } = createCanvas(current.width, current.height);
      if (lower.kind !== "adjustment") drawLayer(ctx, lower, current);
      drawLayer(ctx, upper, current);
      const merged: EditorRasterLayer = {
        ...baseLayer("raster", upper.name),
        kind: "raster",
        canvas,
      };
      const layers = [...current.layers];
      layers.splice(index - 1, 2, merged);
      commit(label, { ...current, layers, activeLayerId: merged.id });
    },
    [commit, notify]
  );

  const flattenImage = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const canvas = renderCompositeCanvas(current);
      const merged: EditorRasterLayer = {
        ...baseLayer("raster", "Background"),
        kind: "raster",
        canvas,
      };
      commit(label, { ...current, layers: [merged], activeLayerId: merged.id, selection: null });
    },
    [commit]
  );

  const rasterizeLayer = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind === "raster") return;
      if (layer.kind === "adjustment") {
        notify("rasterRequired", "error");
        return;
      }
      const canvas = renderLayerCanvas(layer, current);
      if (!canvas) return;
      const raster: EditorRasterLayer = {
        ...baseLayer("raster", layer.name),
        id: layer.id,
        kind: "raster",
        opacity: 1,
        blend: "normal",
        canvas,
      };
      commit(label, {
        ...current,
        layers: current.layers.map((item) => (item.id === layer.id ? raster : item)),
      });
      notify("rasterized", "success");
    },
    [commit, notify]
  );

  const nudgeLayer = useCallback(
    (dx: number, dy: number) => {
      updateLayerWith(
        docRef.current?.activeLayerId ?? "",
        (layer) => ({ ...layer, x: layer.x + dx, y: layer.y + dy })
      );
    },
    [updateLayerWith]
  );

  /* ---------------------------------------------------------------- */
  /* Pixel editing                                                     */
  /* ---------------------------------------------------------------- */

  /**
   * Clones the active raster canvas so the previous history snapshot stays
   * untouched. The caller paints into the returned canvas and then calls
   * `recordHistory(label)` when the stroke is finished.
   */
  const beginPixelEdit = useCallback(
    (): { canvas: HTMLCanvasElement; layer: EditorRasterLayer } | null => {
      const current = docRef.current;
      if (!current) return null;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind !== "raster" || layer.locked) {
        notify("rasterRequired", "error");
        return null;
      }
      const canvas = cloneCanvas(layer.canvas);
      const layers = current.layers.map((item) =>
        item.id === layer.id ? ({ ...item, canvas, contentRect: undefined } as EditorLayer) : item
      );
      const next = { ...current, layers };
      docRef.current = next;
      setDoc(next);
      setPreview(null);
      bump();
      return { canvas, layer };
    },
    [bump, notify]
  );

  const deleteSelection = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind !== "raster" || layer.locked) {
        notify("rasterRequired", "error");
        return;
      }
      const canvas = cloneCanvas(layer.canvas);
      fillSelectionOnCanvas(canvas, null, "transparent");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (current.selection) {
          ctx.save();
          ctx.globalCompositeOperation = "destination-out";
          ctx.beginPath();
          current.selection.points.forEach((point, index) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      const layers = current.layers.map((item) =>
        item.id === layer.id ? ({ ...item, canvas } as EditorLayer) : item
      );
      commit(label, { ...current, layers });
    },
    [commit, notify]
  );

  const fillSelection = useCallback(
    (color: string, label: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind !== "raster" || layer.locked) {
        notify("rasterRequired", "error");
        return;
      }
      const canvas = cloneCanvas(layer.canvas);
      fillSelectionOnCanvas(canvas, current.selection, color);
      const layers = current.layers.map((item) =>
        item.id === layer.id ? ({ ...item, canvas } as EditorLayer) : item
      );
      commit(label, { ...current, layers });
    },
    [commit, notify]
  );

  const pickColor = useCallback(
    (point: EditorPoint) => {
      const current = docRef.current;
      if (!current) return;
      const composite = renderCompositeCanvas(current);
      const ctx = composite.getContext("2d");
      if (!ctx) return;
      const data = ctx.getImageData(
        clamp(Math.round(point.x), 0, current.width - 1),
        clamp(Math.round(point.y), 0, current.height - 1),
        1,
        1
      ).data;
      if (data[3] === 0) {
        notify("transparentPixel", "info");
        return;
      }
      const hex = `#${[data[0], data[1], data[2]].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
      setForegroundColor(hex);
      notify("colorPicked", "success");
    },
    [notify]
  );

  /* ---------------------------------------------------------------- */
  /* Filters and adjustments                                           */
  /* ---------------------------------------------------------------- */

  const previewFilter = useCallback(
    (kind: EditorFilterKind, amount: number) => {
      const current = docRef.current;
      if (!current) return false;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind !== "raster" || layer.locked) {
        notify("rasterRequired", "error");
        return false;
      }
      const canvas = applyFilterInSelection(layer.canvas, kind, amount, current.selection);
      setPreview({ layerId: layer.id, kind, amount, canvas });
      return true;
    },
    [notify]
  );

  const commitPreviewFilter = useCallback(
    (label: string) => {
      const current = docRef.current;
      if (!current || !preview) return;
      const layers = current.layers.map((layer) =>
        layer.id === preview.layerId && layer.kind === "raster"
          ? ({ ...layer, canvas: preview.canvas } as EditorLayer)
          : layer
      );
      commit(label, { ...current, layers });
      notify("filterApplied", "success");
    },
    [commit, notify, preview]
  );

  const cancelPreviewFilter = useCallback(() => setPreview(null), []);

  const applyAdjustmentToActive = useCallback(
    (kind: EditorAdjustmentKind, params: Record<string, number>, label: string) => {
      const current = docRef.current;
      if (!current) return;
      const layer = current.layers.find((item) => item.id === current.activeLayerId);
      if (!layer || layer.kind !== "raster" || layer.locked) {
        notify("rasterRequired", "error");
        return;
      }
      const canvas = cloneCanvas(layer.canvas);
      applyAdjustment(canvas, kind, params);
      const layers = current.layers.map((item) =>
        item.id === layer.id ? ({ ...item, canvas } as EditorLayer) : item
      );
      commit(label, { ...current, layers });
      notify("adjustmentApplied", "success");
    },
    [commit, notify]
  );

  const updateAdjustmentLayer = useCallback(
    (id: string, kind: EditorAdjustmentKind, params: Record<string, number>, label?: string) => {
      patchLayer(id, { adjustment: kind, params }, label);
    },
    [patchLayer]
  );

  /* ---------------------------------------------------------------- */
  /* Document transformations                                          */
  /* ---------------------------------------------------------------- */

  const cropTo = useCallback(
    (rect: EditorSelectionRect, label: string) => {
      const current = docRef.current;
      if (!current) return;
      const x = Math.max(0, Math.min(rect.x, current.width - 1));
      const y = Math.max(0, Math.min(rect.y, current.height - 1));
      const width = Math.max(1, Math.min(rect.width, current.width - x));
      const height = Math.max(1, Math.min(rect.height, current.height - y));
      commit(label, cropDocument(current, { x, y, width, height }));
      notify("cropApplied", "success");
    },
    [commit, notify]
  );

  const resizeImage = useCallback(
    (width: number, height: number, label: string) => {
      const current = docRef.current;
      if (!current) return;
      const size = limitDimension(width, height);
      commit(label, resizeDocument(current, size.width, size.height));
      notify("resized", "success");
    },
    [commit, notify]
  );

  const rotateImage = useCallback(
    (direction: "cw" | "ccw" | "180", label: string) => {
      const current = docRef.current;
      if (!current) return;
      commit(label, rotateDocument(current, direction));
    },
    [commit]
  );

  const flipImage = useCallback(
    (axis: "horizontal" | "vertical", label: string) => {
      const current = docRef.current;
      if (!current) return;
      commit(label, flipDocument(current, axis));
    },
    [commit]
  );

  /* ---------------------------------------------------------------- */
  /* Export                                                            */
  /* ---------------------------------------------------------------- */

  const exportImage = useCallback(
    async (
      format: "png" | "jpeg" | "webp",
      quality: number,
      background: "transparent" | "white" | "black"
    ) => {
      const current = docRef.current;
      if (!current) return;
      setBusy(true);
      try {
        const flatBackground = background === "transparent" ? undefined : background === "white" ? "#ffffff" : "#000000";
        const effectiveBackground = format === "jpeg" && !flatBackground ? "#ffffff" : flatBackground;
        const canvas = renderCompositeCanvas(current, effectiveBackground);
        const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
        const extension = format === "jpeg" ? "jpg" : format;
        const blob = await canvasToBlob(canvas, mime, format === "png" ? undefined : clamp(quality, 0.1, 1));
        await saveFile(blob, outputFilename(`${current.name || "image"}-edited.${extension}`));
        notify("exported", "success");
      } catch (error) {
        console.error("Image export failed", error);
        notify("exportError", "error");
      } finally {
        setBusy(false);
      }
    },
    [notify]
  );

  const exportPsd = useCallback(
    async (flattenAdjustments: boolean) => {
      const current = docRef.current;
      if (!current) return;
      setBusy(true);
      try {
        const result = await exportPsdFile(current, flattenAdjustments);
        await saveFile(result.blob, outputFilename(`${current.name || "image"}.psd`));
        notify(result.flattened ? "psdFlattened" : "psdExported", "success");
      } catch (error) {
        console.error("PSD export failed", error);
        notify("exportError", "error");
      } finally {
        setBusy(false);
      }
    },
    [notify]
  );

  /* ---------------------------------------------------------------- */
  /* View helpers                                                      */
  /* ---------------------------------------------------------------- */

  const zoomIn = useCallback(() => setZoom((value) => clamp(value * 1.25, 0.05, 32)), []);
  const zoomOut = useCallback(() => setZoom((value) => clamp(value / 1.25, 0.05, 32)), []);
  const zoomActual = useCallback(() => setZoom(1), []);
  const zoomFit = useCallback(() => setFitRequest((value) => value + 1), []);

  const swapColors = useCallback(() => {
    setForegroundColor(backgroundColor);
    setBackgroundColor(foregroundColor);
  }, [backgroundColor, foregroundColor]);

  const resetColors = useCallback(() => {
    setForegroundColor("#ffffff");
    setBackgroundColor("#000000");
  }, []);

  const activeBounds = useMemo(
    () => (doc && activeLayer ? getLayerBounds(activeLayer, doc) : null),
    [doc, activeLayer]
  );

  return {
    doc,
    getDoc: () => docRef.current,
    activeLayer,
    activeBounds,
    tool,
    setTool,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    zoomActual,
    zoomFit,
    fitRequest,
    revision,
    busy,
    notice,
    notify,
    clearNotice: () => setNotice(null),

    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    swapColors,
    resetColors,

    brush,
    setBrush,
    eraser,
    setEraser,
    fillTolerance,
    setFillTolerance,
    gradient,
    setGradient,
    shapeDefaults,
    setShapeDefaults,
    textDefaults,
    setTextDefaults,

    history,
    undo,
    redo,
    jumpTo,
    canUndo,
    canRedo,
    recordHistory,

    preview,
    previewFilter,
    commitPreviewFilter,
    cancelPreviewFilter,
    applyAdjustmentToActive,
    updateAdjustmentLayer,

    openFile,
    openImageFromUrl,
    newDocument,
    closeDocument,

    addRasterLayer,
    placeImageFile,
    addTextLayer,
    addShapeLayer,
    addAdjustmentLayer,
    duplicateLayer,
    deleteLayer,
    moveLayer,
    reorderLayer,
    renameDocument,
    mergeDown,
    flattenImage,
    rasterizeLayer,
    nudgeLayer,

    patchLayer,
    updateLayerWith,
    setActiveLayer,
    setSelection,
    selectAll,
    deselect,
    deleteSelection,
    fillSelection,
    beginPixelEdit,
    pickColor,

    cropTo,
    resizeImage,
    rotateImage,
    flipImage,
    exportImage,
    exportPsd,

    adjustmentLabel: (kind: EditorAdjustmentKind) => adjustmentDefinition(kind).label,
  };
}

export type ImageEditorController = ReturnType<typeof useImageEditor>;
