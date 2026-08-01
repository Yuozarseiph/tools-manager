"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Check,
  RefreshCw,
  Crop as CropIcon,
  SlidersHorizontal,
  Loader2,
  Maximize,
  type LucideIcon,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { usePdfToImageToolContent } from "./pdf-to-image.content";
import {
  type ToolImage,
  type OutFormat,
  type Rect,
  type FilterSettings,
  type TransformOp,
  DEFAULT_FILTERS,
  filtersToCss,
  processImage,
  transformImage,
} from "./pdf-image-utils";

type DragMode =
  | "move"
  | "new"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

interface Drag {
  mode: DragMode;
  sx: number;
  sy: number;
  orig: Rect;
}

const HANDLES: { mode: DragMode; cls: string }[] = [
  {
    mode: "nw",
    cls: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  },
  {
    mode: "n",
    cls: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
  },
  {
    mode: "ne",
    cls: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  },
  {
    mode: "e",
    cls: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  },
  {
    mode: "se",
    cls: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
  },
  {
    mode: "s",
    cls: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
  },
  {
    mode: "sw",
    cls: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  },
  {
    mode: "w",
    cls: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  },
];

const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, rgba(148,148,148,.18) 25%, transparent 25%, transparent 75%, rgba(148,148,148,.18) 75%), linear-gradient(45deg, rgba(148,148,148,.18) 25%, transparent 25%, transparent 75%, rgba(148,148,148,.18) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 10px 10px",
};

function computeCrop(
  drag: Drag,
  cx: number,
  cy: number,
  W: number,
  H: number,
  aspect: number | null,
  min: number,
): Rect {
  const { mode, sx, sy, orig } = drag;

  if (mode === "move") {
    return {
      x: Math.min(Math.max(0, orig.x + (cx - sx)), Math.max(0, W - orig.w)),
      y: Math.min(Math.max(0, orig.y + (cy - sy)), Math.max(0, H - orig.h)),
      w: orig.w,
      h: orig.h,
    };
  }

  if (mode === "new") {
    const x = Math.min(sx, cx);
    const y = Math.min(sy, cy);
    let w = Math.abs(cx - sx);
    let h = Math.abs(cy - sy);
    if (aspect) {
      w = Math.max(w, h * aspect);
      h = w / aspect;
    }
    return { x, y, w: Math.min(w, W - x), h: Math.min(h, H - y) };
  }

  let x = orig.x;
  let y = orig.y;
  let w = orig.w;
  let h = orig.h;
  const R = orig.x + orig.w;
  const B = orig.y + orig.h;

  if (mode.includes("w")) {
    x = Math.min(Math.max(0, orig.x + (cx - sx)), R - min);
    w = R - x;
  }
  if (mode.includes("e")) {
    w = Math.min(Math.max(min, orig.w + (cx - sx)), W - orig.x);
  }
  if (mode.includes("n")) {
    y = Math.min(Math.max(0, orig.y + (cy - sy)), B - min);
    h = B - y;
  }
  if (mode.includes("s")) {
    h = Math.min(Math.max(min, orig.h + (cy - sy)), H - orig.y);
  }

  if (aspect) {
    const isCorner =
      (mode.includes("w") || mode.includes("e")) &&
      (mode.includes("n") || mode.includes("s"));
    if (isCorner) {
      w = Math.max(w, h * aspect);
      h = w / aspect;
      if (mode.includes("w")) x = R - w;
      if (mode.includes("n")) y = B - h;
    } else if (mode.includes("w") || mode.includes("e")) {
      const midY = orig.y + orig.h / 2;
      h = w / aspect;
      y = midY - h / 2;
    } else {
      const midX = orig.x + orig.w / 2;
      w = h * aspect;
      x = midX - w / 2;
    }
    const sc = Math.min(1, W / w, H / h);
    if (sc < 1) {
      w *= sc;
      h *= sc;
      if (mode.includes("w")) x = R - w;
      if (mode.includes("n")) y = B - h;
    }
  }

  x = Math.min(Math.max(0, x), Math.max(0, W - w));
  y = Math.min(Math.max(0, y), Math.max(0, H - h));
  return { x, y, w, h };
}

function pct(v: number, total: number): string {
  return `${(v / total) * 100}%`;
}

function FilterSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  labelClass,
  valueClass,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  labelClass: string;
  valueClass: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] font-bold ${labelClass}`}>{label}</span>
        <span className={`text-[10px] font-mono ${valueClass}`} dir="ltr">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--app-accent)]"
      />
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-opacity disabled:opacity-40 ${className}`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

interface ImageEditModalProps {
  item: ToolImage;
  format: OutFormat;
  quality: number;
  onClose: () => void;
  onSave: (id: string, dataUrl: string, width: number, height: number) => void;
}

export default function ImageEditModal({
  item,
  format,
  quality,
  onClose,
  onSave,
}: ImageEditModalProps) {
  const theme = useThemeColors();
  const t = usePdfToImageToolContent();

  const [base, setBase] = useState({
    dataUrl: item.dataUrl,
    width: item.width,
    height: item.height,
  });
  const [crop, setCrop] = useState<Rect>({
    x: 0,
    y: 0,
    w: item.width,
    h: item.height,
  });
  const [aspect, setAspect] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterSettings>({
    ...DEFAULT_FILTERS,
  });
  const [busyT, setBusyT] = useState(false);
  const [saving, setSaving] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);

  const W = base.width;
  const H = base.height;
  const minSize = Math.max(12, Math.round(Math.max(W, H) * 0.01));

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const toImg = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const el = stageRef.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: Math.min(W, Math.max(0, ((e.clientX - r.left) / r.width) * W)),
        y: Math.min(H, Math.max(0, ((e.clientY - r.top) / r.height) * H)),
      };
    },
    [W, H],
  );

  const startDrag = (e: React.PointerEvent, mode: DragMode) => {
    if (busyT || saving) return;
    const p = toImg(e);
    dragRef.current = { mode, sx: p.x, sy: p.y, orig: { ...crop } };
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toImg(e);
    setCrop(computeCrop(drag, p.x, p.y, W, H, aspect, minSize));
  };

  const endDrag = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.mode === "new") {
      setCrop((c) => (c.w < minSize || c.h < minSize ? drag.orig : c));
    }
  };

  const doTransform = async (op: TransformOp) => {
    if (busyT) return;
    setBusyT(true);
    try {
      const res = await transformImage(base.dataUrl, op);
      setBase(res);
      setCrop({ x: 0, y: 0, w: res.width, h: res.height });
    } catch (err) {
      console.error("[pdf-to-image][transform]", err);
    } finally {
      setBusyT(false);
    }
  };

  const pickAspect = (v: number | null) => {
    setAspect(v);
    if (!v) return;
    setCrop((c) => {
      let w = c.w;
      let h = w / v;
      if (h > c.h) {
        h = c.h;
        w = h * v;
      }
      return { x: c.x + (c.w - w) / 2, y: c.y + (c.h - h) / 2, w, h };
    });
  };

  const resetAll = () => {
    setBase({ dataUrl: item.dataUrl, width: item.width, height: item.height });
    setCrop({ x: 0, y: 0, w: item.width, h: item.height });
    setFilters({ ...DEFAULT_FILTERS });
    setAspect(null);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const isFull =
        crop.x <= 0 && crop.y <= 0 && crop.w >= W - 0.5 && crop.h >= H - 0.5;
      const res = await processImage(base.dataUrl, {
        crop: isFull ? null : crop,
        filters,
        format,
        quality,
      });
      onSave(item.id, res.dataUrl, res.width, res.height);
    } catch (err) {
      console.error("[pdf-to-image][edit]", err);
    } finally {
      setSaving(false);
    }
  };

  const aspects: { label: string; value: number | null }[] = [
    { label: t.aspectFree, value: null },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
  ];

  const toolBtnClass = `${theme.border} ${theme.text} hover:opacity-75`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl ${theme.card} ${theme.border}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b sticky top-0 z-10 ${theme.border} ${theme.card}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CropIcon size={16} className={theme.accent} />
            <h3 className={`font-bold truncate ${theme.text}`}>
              {t.editorTitle}
            </h3>
            <span className={`text-xs truncate ${theme.textMuted}`}>
              — {item.displayLabel}
            </span>
            <span
              className={`hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded border ${theme.border} ${theme.textMuted}`}
              dir="ltr"
            >
              {W}×{H}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:opacity-70 ${theme.textMuted}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Stage */}
          <div
            className="flex justify-center rounded-xl overflow-hidden bg-black/30 p-3 mb-4"
            style={CHECKERBOARD}
          >
            <div
              ref={stageRef}
              className="relative inline-block select-none touch-none"
              onPointerDown={(e) => startDrag(e, "new")}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={base.dataUrl}
                alt={item.displayLabel}
                draggable={false}
                className="block max-h-[50vh] max-w-full pointer-events-none"
                style={{ filter: filtersToCss(filters) }}
              />
              <div className="absolute inset-0">
                <div
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startDrag(e, "move");
                  }}
                  className="absolute border-2 border-[var(--app-accent)] cursor-move"
                  style={{
                    left: pct(crop.x, W),
                    top: pct(crop.y, H),
                    width: pct(crop.w, W),
                    height: pct(crop.h, H),
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* Rule of thirds */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                  </div>
                  {/* Size badge */}
                  <div
                    className="absolute -top-7 left-0 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono"
                    dir="ltr"
                  >
                    {Math.round(crop.w)}×{Math.round(crop.h)}
                  </div>
                  {/* Handles */}
                  {HANDLES.map((h) => (
                    <div
                      key={h.mode}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        startDrag(e, h.mode);
                      }}
                      className={`absolute w-3 h-3 bg-white border-2 border-[var(--app-accent)] rounded-sm ${h.cls}`}
                    />
                  ))}
                </div>
              </div>
              {busyT && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Aspect presets */}
          <div className="mb-4">
            <label
              className={`text-xs font-bold mb-2 block ${theme.textMuted}`}
            >
              {t.aspect}
            </label>
            <div className="flex flex-wrap gap-2">
              {aspects.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => pickAspect(a.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-opacity ${
                    aspect === a.value
                      ? theme.primary
                      : `${theme.border} ${theme.textMuted} hover:opacity-75`
                  }`}
                >
                  {a.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCrop({ x: 0, y: 0, w: W, h: H })}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-opacity ${theme.border} ${theme.textMuted} hover:opacity-75`}
              >
                <Maximize size={12} /> {t.fullImage}
              </button>
            </div>
            <p className={`text-[10px] mt-2 ${theme.textMuted}`}>
              {t.cropHint}
            </p>
          </div>

          {/* Transforms */}
          <div className="flex flex-wrap gap-2 mb-5">
            <ToolButton
              icon={RotateCcw}
              label={t.rotateLeft}
              onClick={() => doTransform("rotate-left")}
              disabled={busyT}
              className={toolBtnClass}
            />
            <ToolButton
              icon={RotateCw}
              label={t.rotateRight}
              onClick={() => doTransform("rotate-right")}
              disabled={busyT}
              className={toolBtnClass}
            />
            <ToolButton
              icon={FlipHorizontal2}
              label={t.flipH}
              onClick={() => doTransform("flip-h")}
              disabled={busyT}
              className={toolBtnClass}
            />
            <ToolButton
              icon={FlipVertical2}
              label={t.flipV}
              onClick={() => doTransform("flip-v")}
              disabled={busyT}
              className={toolBtnClass}
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <label
              className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${theme.textMuted}`}
            >
              <SlidersHorizontal size={13} /> {t.filters}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4">
              <FilterSlider
                label={t.brightness}
                value={filters.brightness}
                min={0.2}
                max={2}
                step={0.05}
                display={`${Math.round(filters.brightness * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, brightness: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
              <FilterSlider
                label={t.contrast}
                value={filters.contrast}
                min={0.2}
                max={2}
                step={0.05}
                display={`${Math.round(filters.contrast * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, contrast: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
              <FilterSlider
                label={t.saturate}
                value={filters.saturate}
                min={0}
                max={2}
                step={0.05}
                display={`${Math.round(filters.saturate * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, saturate: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
              <FilterSlider
                label={t.grayscale}
                value={filters.grayscale}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(filters.grayscale * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, grayscale: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
              <FilterSlider
                label={t.sepia}
                value={filters.sepia}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(filters.sepia * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, sepia: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
              <FilterSlider
                label={t.invert}
                value={filters.invert}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(filters.invert * 100)}%`}
                onChange={(v) => setFilters((f) => ({ ...f, invert: v }))}
                labelClass={theme.textMuted}
                valueClass={theme.text}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between gap-2 border-t pt-4 ${theme.border}`}
          >
            <button
              type="button"
              onClick={resetAll}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-opacity ${theme.border} ${theme.textMuted} hover:opacity-75`}
            >
              <RefreshCw size={13} /> {t.resetEdits}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-opacity ${theme.border} ${theme.text} hover:opacity-75`}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || busyT}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${theme.primary}`}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}{" "}
                {t.apply}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
