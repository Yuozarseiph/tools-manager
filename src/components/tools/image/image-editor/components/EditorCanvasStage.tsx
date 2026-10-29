"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { ThemePalette } from "@/constants/themes";
import type { EditorPoint, EditorSelectionRect } from "../editor-types";
import {
  drawGradientFill,
  floodFill,
  normalizePoint,
  paintStrokeSegment,
  polygonSelection,
  rectSelection,
  renderDocument,
  getLayerBounds,
  traceSelectionPath,
  normaliseRect,
} from "../image-editor.utils";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";

type Drag =
  | { kind: "pan"; clientX: number; clientY: number; left: number; top: number }
  | { kind: "move"; id: string; start: EditorPoint; x: number; y: number; changed: boolean }
  | { kind: "resize"; id: string; start: EditorPoint; scaleX: number; scaleY: number; rotation: number; corner: number; width: number; height: number; changed: boolean }
  | { kind: "stroke"; last: EditorPoint; canvas: HTMLCanvasElement; erase: boolean }
  | { kind: "rect"; tool: "marquee" | "crop"; start: EditorPoint; current: EditorPoint }
  | { kind: "lasso"; points: EditorPoint[] }
  | { kind: "gradient"; start: EditorPoint; current: EditorPoint }
  | { kind: "shape"; start: EditorPoint; current: EditorPoint };

function inRect(point: EditorPoint, rect: { x: number; y: number; width: number; height: number }) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export default function EditorCanvasStage({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const hoverRef = useRef<EditorPoint | null>(null);
  const [cropRect, setCropRect] = useState<EditorSelectionRect | null>(null);
  const [pointer, setPointer] = useState<EditorPoint | null>(null);

  const doc = editor.doc;
  const zoom = editor.zoom;

  const pointFromEvent = useCallback(
    (event: { clientX: number; clientY: number }): EditorPoint => {
      const canvas = canvasRef.current;
      if (!canvas || !doc) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: normalizePoint(((event.clientX - rect.left) / Math.max(1, rect.width)) * doc.width),
        y: normalizePoint(((event.clientY - rect.top) / Math.max(1, rect.height)) * doc.height),
      };
    },
    [doc]
  );

  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    const overlayDoc = editor.getDoc();
    if (!canvas || !overlayDoc) return;
    if (canvas.width !== overlayDoc.width) canvas.width = overlayDoc.width;
    if (canvas.height !== overlayDoc.height) canvas.height = overlayDoc.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = 1 / Math.max(0.05, editor.zoom);
    const dash = 5 * scale;

    const activeCrop =
      dragRef.current?.kind === "rect" && dragRef.current.tool === "crop"
        ? normaliseRect(dragRef.current.start.x, dragRef.current.start.y, dragRef.current.current.x, dragRef.current.current.y)
        : cropRect;

    if (activeCrop && activeCrop.width > 1 && activeCrop.height > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.rect(activeCrop.x, activeCrop.y, activeCrop.width, activeCrop.height);
      ctx.fillStyle = "rgba(3, 7, 18, 0.58)";
      ctx.fill("evenodd");
      ctx.restore();
      ctx.save();
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.6 * scale;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.strokeRect(activeCrop.x, activeCrop.y, activeCrop.width, activeCrop.height);
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineDashOffset = dash;
      ctx.strokeRect(activeCrop.x, activeCrop.y, activeCrop.width, activeCrop.height);
      ctx.restore();
    }

    const liveLasso = dragRef.current?.kind === "lasso" ? dragRef.current.points : null;
    if (liveLasso && liveLasso.length > 1) {
      ctx.save();
      ctx.beginPath();
      liveLasso.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
      ctx.closePath();
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.stroke();
      ctx.restore();
    }

    const liveMarquee =
      dragRef.current?.kind === "rect" && dragRef.current.tool === "marquee"
        ? normaliseRect(dragRef.current.start.x, dragRef.current.start.y, dragRef.current.current.x, dragRef.current.current.y)
        : null;
    const liveGradient = dragRef.current?.kind === "gradient" ? dragRef.current : null;
    const liveShape = dragRef.current?.kind === "shape" ? dragRef.current : null;

    if (liveMarquee) {
      ctx.save();
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.strokeRect(liveMarquee.x, liveMarquee.y, liveMarquee.width, liveMarquee.height);
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineDashOffset = dash;
      ctx.strokeRect(liveMarquee.x, liveMarquee.y, liveMarquee.width, liveMarquee.height);
      ctx.restore();
    }

    if (overlayDoc.selection && !liveMarquee) {
      ctx.save();
      ctx.beginPath();
      traceSelectionPath(ctx, overlayDoc.selection);
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineDashOffset = dash;
      ctx.stroke();
      ctx.restore();
    }

    if (liveGradient) {
      ctx.save();
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = "#60a5fa";
      ctx.beginPath();
      ctx.moveTo(liveGradient.start.x, liveGradient.start.y);
      ctx.lineTo(liveGradient.current.x, liveGradient.current.y);
      ctx.stroke();
      ctx.restore();
    }

    if (liveShape) {
      const rect = normaliseRect(liveShape.start.x, liveShape.start.y, liveShape.current.x, liveShape.current.y);
      ctx.save();
      ctx.setLineDash([dash, dash]);
      ctx.lineWidth = 1.2 * scale;
      ctx.strokeStyle = "#60a5fa";
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      ctx.restore();
    }

    if (editor.tool === "move" && editor.activeBounds && editor.activeLayer?.visible && !editor.activeLayer?.locked && !liveMarquee) {
      const bounds = editor.activeBounds;
      ctx.save();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.4 * scale;
      ctx.setLineDash([]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      const size = 6 * scale;
      bounds.corners.forEach((corner) => {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.2 * scale;
        ctx.fillRect(corner.x - size / 2, corner.y - size / 2, size, size);
        ctx.strokeRect(corner.x - size / 2, corner.y - size / 2, size, size);
      });
      ctx.restore();
    }

    const hover = hoverRef.current;
    if ((editor.tool === "brush" || editor.tool === "eraser") && hover) {
      const radius = (editor.tool === "brush" ? editor.brush.size : editor.eraser.size) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, Math.max(radius, 0.5), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.2 * scale;
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 0.6 * scale;
      ctx.stroke();
      ctx.restore();
    }
  }, [cropRect, editor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const current = editor.doc;
    if (!canvas || !current) return;
    if (canvas.width !== current.width) canvas.width = current.width;
    if (canvas.height !== current.height) canvas.height = current.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderDocument(ctx, current, editor.preview);
    drawOverlay();
  }, [editor.doc, editor.revision, editor.preview, editor.zoom, editor.tool, editor.activeBounds, drawOverlay]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      editor.setZoom((value) => Math.min(32, Math.max(0.05, value * (event.deltaY < 0 ? 1.12 : 0.89))));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [editor]);

  /** Fit is available at any time; opening another document and switching view also work. */
  const fitRequest = editor.fitRequest;
  const docWidth = doc?.width;
  const docHeight = doc?.height;
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !docWidth || !docHeight) return;
    const apply = () => {
      const width = node.clientWidth - 56;
      const height = node.clientHeight - 56;
      if (width <= 0 || height <= 0) return;
      // "Fit" can scale up a small document as well as shrink a large one.
      // Keep an upper bound so tiny icons never become absurdly magnified.
      const fittedZoom = Math.min(width / docWidth, height / docHeight, 8);
      editor.setZoom(Math.min(32, Math.max(0.05, Number(fittedZoom.toFixed(3)))));
      node.scrollTo({ left: 0, top: 0 });
    };
    const frame = window.requestAnimationFrame(apply);
    return () => window.cancelAnimationFrame(frame);
    // Intentional: fit only when requested or document dimensions change, not on every editor render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitRequest, docWidth, docHeight]);

  if (!doc) return null;

  const displayWidth = Math.max(1, Math.round(doc.width * zoom));
  const displayHeight = Math.max(1, Math.round(doc.height * zoom));

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some browsers reject capture for pointers that are already released.
    }
    const point = pointFromEvent(event);
    const tool = editor.tool;

    if (tool === "hand") {
      const node = scrollRef.current;
      dragRef.current = {
        kind: "pan",
        clientX: event.clientX,
        clientY: event.clientY,
        left: node?.scrollLeft ?? 0,
        top: node?.scrollTop ?? 0,
      };
      return;
    }

    if (tool === "zoom") {
      const next = event.altKey ? editor.zoom / 1.25 : editor.zoom * 1.25;
      editor.setZoom(Math.min(32, Math.max(0.05, next)));
      return;
    }

    if (tool === "eyedropper") {
      editor.pickColor(point);
      return;
    }

    if (tool === "fill") {
      const begun = editor.beginPixelEdit();
      if (!begun) return;
      floodFill(begun.canvas, point.x, point.y, editor.foregroundColor, editor.fillTolerance, doc.selection);
      editor.recordHistory(content.ui.tools.fill);
      return;
    }

    if (tool === "text") {
      editor.addTextLayer(point, content.ui.tools.text, content.ui.tools.text);
      editor.setTool("move");
      return;
    }

    if (tool === "brush" || tool === "eraser") {
      const begun = editor.beginPixelEdit();
      if (!begun) return;
      const ctx = begun.canvas.getContext("2d");
      if (!ctx) return;
      const settings = tool === "brush" ? editor.brush : editor.eraser;
      if (doc.selection) {
        ctx.save();
        traceSelectionPath(ctx, doc.selection);
        ctx.clip();
      }
      paintStrokeSegment(
        ctx,
        point,
        point,
        { size: settings.size, hardness: settings.hardness, opacity: settings.opacity, flow: settings.flow },
        editor.foregroundColor,
        tool === "eraser"
      );
      if (doc.selection) ctx.restore();
      dragRef.current = { kind: "stroke", last: point, canvas: begun.canvas, erase: tool === "eraser" };
      const ctx2 = canvasRef.current?.getContext("2d");
      const latest = editor.getDoc();
      if (ctx2 && latest) renderDocument(ctx2, latest, null);
      return;
    }

    if (tool === "move") {
      const selected = editor.activeLayer;
      const selectedBounds = editor.activeBounds;
      if (selected && selectedBounds && !selected.locked && selected.visible) {
        const cornerIndex = selectedBounds.corners.findIndex((corner) => Math.hypot(corner.x - point.x, corner.y - point.y) <= 11 / Math.max(0.05, zoom));
        if (cornerIndex >= 0) {
          const originalWidth = selected.kind === "raster" ? (selected.contentRect?.width ?? doc.width)
            : selected.kind === "shape" ? selected.width : selectedBounds.width / Math.max(0.01, Math.abs(selected.scaleX));
          const originalHeight = selected.kind === "raster" ? (selected.contentRect?.height ?? doc.height)
            : selected.kind === "shape" ? selected.height : selectedBounds.height / Math.max(0.01, Math.abs(selected.scaleY));
          dragRef.current = {
            kind: "resize", id: selected.id, start: point, scaleX: selected.scaleX, scaleY: selected.scaleY,
            rotation: selected.rotation, corner: cornerIndex, width: Math.max(1, originalWidth), height: Math.max(1, originalHeight), changed: false,
          };
          return;
        }
      }
      // Select whichever visible layer is actually clicked, rather than requiring a detour through the layer list.
      const target = [...doc.layers].reverse().find((layer) =>
        layer.kind !== "adjustment" && layer.visible && !layer.locked && inRect(point, getLayerBounds(layer, doc))
      );
      if (target) {
        if (target.id !== selected?.id) editor.setActiveLayer(target.id);
        dragRef.current = { kind: "move", id: target.id, start: point, x: target.x, y: target.y, changed: false };
      } else {
        editor.deselect();
      }
      return;
    }

    if (tool === "marquee" || tool === "crop") {
      if (tool === "crop") setCropRect(null);
      dragRef.current = { kind: "rect", tool, start: point, current: point };
      drawOverlay();
      return;
    }

    if (tool === "lasso") {
      dragRef.current = { kind: "lasso", points: [point] };
      return;
    }

    if (tool === "gradient") {
      dragRef.current = { kind: "gradient", start: point, current: point };
      return;
    }

    if (tool === "shape") {
      dragRef.current = { kind: "shape", start: point, current: point };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const point = pointFromEvent(event);
    hoverRef.current = point;
    setPointer(point);
    const drag = dragRef.current;
    if (!drag) {
      drawOverlay();
      return;
    }

    if (drag.kind === "pan") {
      const node = scrollRef.current;
      if (node) {
        node.scrollLeft = drag.left - (event.clientX - drag.clientX);
        node.scrollTop = drag.top - (event.clientY - drag.clientY);
      }
      return;
    }

    if (drag.kind === "move") {
      if (point.x === drag.start.x && point.y === drag.start.y) return;
      drag.changed = true;
      editor.updateLayerWith(drag.id, (layer) => ({ ...layer, x: drag.x + point.x - drag.start.x, y: drag.y + point.y - drag.start.y }));
      return;
    }

    if (drag.kind === "resize") {
      const dx = point.x - drag.start.x;
      const dy = point.y - drag.start.y;
      const cos = Math.cos(drag.rotation);
      const sin = Math.sin(drag.rotation);
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;
      const xSign = drag.corner === 0 || drag.corner === 3 ? -1 : 1;
      const ySign = drag.corner === 0 || drag.corner === 1 ? -1 : 1;
      let scaleX = Math.max(0.02, drag.scaleX + (xSign * 2 * localDx) / drag.width);
      let scaleY = Math.max(0.02, drag.scaleY + (ySign * 2 * localDy) / drag.height);
      if (event.shiftKey) {
        const factor = Math.max(scaleX / Math.max(0.02, drag.scaleX), scaleY / Math.max(0.02, drag.scaleY));
        scaleX = Math.max(0.02, drag.scaleX * factor);
        scaleY = Math.max(0.02, drag.scaleY * factor);
      }
      drag.changed = true;
      editor.updateLayerWith(drag.id, (layer) => ({ ...layer, scaleX, scaleY }));
      return;
    }

    if (drag.kind === "stroke") {
      const ctx = drag.canvas.getContext("2d");
      if (!ctx) return;
      const settings = drag.erase ? editor.eraser : editor.brush;
      const currentDoc = editor.getDoc();
      if (currentDoc?.selection) {
        ctx.save();
        traceSelectionPath(ctx, currentDoc.selection);
        ctx.clip();
      }
      paintStrokeSegment(
        ctx,
        drag.last,
        point,
        { size: settings.size, hardness: settings.hardness, opacity: settings.opacity, flow: settings.flow },
        editor.foregroundColor,
        drag.erase
      );
      if (currentDoc?.selection) ctx.restore();
      drag.last = point;
      const mainCtx = canvasRef.current?.getContext("2d");
      if (mainCtx) renderDocument(mainCtx, currentDoc ?? doc, null);
      drawOverlay();
      return;
    }

    if (drag.kind === "rect") {
      drag.current = point;
      drawOverlay();
      return;
    }

    if (drag.kind === "lasso") {
      drag.points.push(point);
      drawOverlay();
      return;
    }

    if (drag.kind === "gradient") {
      drag.current = point;
      drawOverlay();
      return;
    }

    if (drag.kind === "shape") {
      drag.current = point;
      drawOverlay();
    }
  };

  const finishDrag = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    if ((drag.kind === "move" || drag.kind === "resize") && drag.changed) {
      editor.recordHistory(content.ui.tools.move);
      return;
    }

    if (drag.kind === "stroke") {
      editor.recordHistory(drag.erase ? content.ui.tools.eraser : content.ui.tools.brush);
      return;
    }

    if (drag.kind === "rect") {
      const rect = normaliseRect(drag.start.x, drag.start.y, drag.current.x, drag.current.y);
      if (rect.width < 2 || rect.height < 2) {
        drawOverlay();
        return;
      }
      if (drag.tool === "marquee") {
        editor.setSelection(rectSelection(rect));
      } else {
        setCropRect(rect);
      }
      drawOverlay();
      return;
    }

    if (drag.kind === "lasso") {
      const selection = polygonSelection(drag.points);
      editor.setSelection(selection);
      drawOverlay();
      return;
    }

    if (drag.kind === "gradient") {
      if (Math.hypot(drag.current.x - drag.start.x, drag.current.y - drag.start.y) < 2) return;
      const begun = editor.beginPixelEdit();
      if (!begun) return;
      drawGradientFill(
        begun.canvas,
        drag.start,
        drag.current,
        editor.gradient,
        editor.doc?.selection ?? null,
        editor.brush.opacity
      );
      editor.recordHistory(content.ui.tools.gradient);
      return;
    }

    if (drag.kind === "shape") {
      if (Math.hypot(drag.current.x - drag.start.x, drag.current.y - drag.start.y) < 3) return;
      editor.addShapeLayer(drag.start, drag.current, content.ui.tools.shape, content.ui.tools.shape);
    }
  };

  const applyCrop = () => {
    if (!cropRect) return;
    editor.cropTo(cropRect, content.ui.options.applyCrop);
    setCropRect(null);
  };

  const cursor =
    editor.tool === "hand"
      ? "grab"
      : editor.tool === "move"
        ? "move"
        : editor.tool === "text"
          ? "text"
          : editor.tool === "zoom"
            ? "zoom-in"
            : "crosshair";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className={`relative min-h-0 flex-1 overflow-auto p-7 ${theme.bg}`}
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.06) 75%)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
        }}
      >
        <div
          className="relative mx-auto shrink-0 shadow-2xl ring-1 ring-black/20"
          style={{
            width: displayWidth,
            height: displayHeight,
            backgroundColor: "transparent",
            backgroundImage:
              "repeating-conic-gradient(rgba(203,213,225,0.9) 0% 25%, rgba(241,245,249,0.9) 0% 50%)",
            backgroundSize: "20px 20px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={doc.width}
            height={doc.height}
            className="absolute inset-0 h-full w-full"
            aria-label={content.ui.header.badge}
          />
          <canvas
            ref={overlayRef}
            width={doc.width}
            height={doc.height}
            className="absolute inset-0 h-full w-full touch-none"
            style={{ cursor }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerLeave={() => {
              hoverRef.current = null;
              drawOverlay();
            }}
          />
        </div>
      </div>

      {cropRect && (
        <div
          className={`absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-3 py-2 shadow-lg ${theme.card} ${theme.border}`}
        >
          <span className={`text-[11px] tabular-nums ${theme.textMuted}`}>
            {content.ui.options.selectionSize}: {Math.round(cropRect.width)} × {Math.round(cropRect.height)}
          </span>
          <button
            type="button"
            onClick={applyCrop}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${theme.primary}`}
          >
            {content.ui.options.applyCrop}
          </button>
          <button
            type="button"
            onClick={() => {
              setCropRect(null);
              drawOverlay();
            }}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium ${theme.border} ${theme.text}`}
          >
            {content.ui.options.cancel}
          </button>
        </div>
      )}

      <div className={`flex items-center justify-between gap-2 border-t px-3 py-1 text-[10px] tabular-nums ${theme.border} ${theme.textMuted}`}>
        <span>
          {pointer ? `${Math.round(pointer.x)}, ${Math.round(pointer.y)} px` : content.ui.status.pointer}
        </span>
        <span>
          {doc.width} × {doc.height} px · {content.ui.status.zoom} {Math.round(zoom * 100)}% · {content.ui.status.selection}:{" "}
          {doc.selection
            ? `${Math.round(doc.selection.bounds.width)} × ${Math.round(doc.selection.bounds.height)}`
            : content.ui.status.noSelection}
        </span>
      </div>
    </div>
  );
}
