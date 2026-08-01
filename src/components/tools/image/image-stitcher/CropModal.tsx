"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, RotateCcw } from "lucide-react";

// Normalized crop rectangle (0..1 relative to natural image size).
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL: CropRect = { x: 0, y: 0, w: 1, h: 1 };

type Handle =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw"
  | null;

interface Props {
  src: string;
  initial?: CropRect;
  theme: any;
  labels: { title: string; apply: string; cancel: string; reset: string };
  onApply: (rect: CropRect) => void;
  onClose: () => void;
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export default function CropModal({
  src,
  initial,
  theme,
  labels,
  onApply,
  onClose,
}: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<CropRect>(initial ?? FULL);
  const drag = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    start: CropRect;
  } | null>(null);

  const onPointerDown = useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      drag.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        start: rect,
      };
    },
    [rect],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      const area = areaRef.current;
      if (!d || !area) return;
      const bounds = area.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / bounds.width;
      const dy = (e.clientY - d.startY) / bounds.height;
      let { x, y, w, h } = d.start;
      const min = 0.05;

      switch (d.handle) {
        case "move":
          x = clamp(x + dx, 0, 1 - w);
          y = clamp(y + dy, 0, 1 - h);
          break;
        case "e":
          w = clamp(w + dx, min, 1 - x);
          break;
        case "w": {
          const nx = clamp(x + dx, 0, x + w - min);
          w = w + (x - nx);
          x = nx;
          break;
        }
        case "s":
          h = clamp(h + dy, min, 1 - y);
          break;
        case "n": {
          const ny = clamp(y + dy, 0, y + h - min);
          h = h + (y - ny);
          y = ny;
          break;
        }
        case "se":
          w = clamp(w + dx, min, 1 - x);
          h = clamp(h + dy, min, 1 - y);
          break;
        case "ne": {
          const ny = clamp(y + dy, 0, y + h - min);
          h = h + (y - ny);
          y = ny;
          w = clamp(w + dx, min, 1 - x);
          break;
        }
        case "sw": {
          const nx = clamp(x + dx, 0, x + w - min);
          w = w + (x - nx);
          x = nx;
          h = clamp(h + dy, min, 1 - y);
          break;
        }
        case "nw": {
          const nx = clamp(x + dx, 0, x + w - min);
          w = w + (x - nx);
          x = nx;
          const ny = clamp(y + dy, 0, y + h - min);
          h = h + (y - ny);
          y = ny;
          break;
        }
      }
      setRect({ x, y, w, h });
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const handleStyle = "absolute w-3 h-3 bg-[var(--app-accent)] border border-white rounded-sm";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-2xl border p-4 shadow-2xl ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold ${theme.text}`}>{labels.title}</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 ${theme.text}`}
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={areaRef}
          className="relative w-full select-none touch-none bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] rounded-lg overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="crop" className="w-full h-auto block pointer-events-none" draggable={false} />
          {/* Dark overlay outside selection */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          {/* Selection window */}
          <div
            className="absolute border-2 border-[var(--app-accent)] cursor-move"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.w * 100}%`,
              height: `${rect.h * 100}%`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0)",
              WebkitMaskImage: "none",
            }}
            onPointerDown={onPointerDown("move")}
          >
            {/* Clear the darkening inside selection by re-showing the image slice */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ pointerEvents: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  left: `${(-rect.x / rect.w) * 100}%`,
                  top: `${(-rect.y / rect.h) * 100}%`,
                  width: `${(1 / rect.w) * 100}%`,
                  height: `${(1 / rect.h) * 100}%`,
                  maxWidth: "none",
                }}
              />
            </div>
            {/* Edge / corner handles */}
            <div className={`${handleStyle} -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize`} onPointerDown={onPointerDown("n")} />
            <div className={`${handleStyle} -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize`} onPointerDown={onPointerDown("s")} />
            <div className={`${handleStyle} top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize`} onPointerDown={onPointerDown("e")} />
            <div className={`${handleStyle} top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize`} onPointerDown={onPointerDown("w")} />
            <div className={`${handleStyle} -top-1.5 -left-1.5 cursor-nw-resize`} onPointerDown={onPointerDown("nw")} />
            <div className={`${handleStyle} -top-1.5 -right-1.5 cursor-ne-resize`} onPointerDown={onPointerDown("ne")} />
            <div className={`${handleStyle} -bottom-1.5 -left-1.5 cursor-sw-resize`} onPointerDown={onPointerDown("sw")} />
            <div className={`${handleStyle} -bottom-1.5 -right-1.5 cursor-se-resize`} onPointerDown={onPointerDown("se")} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            onClick={() => setRect(FULL)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border ${theme.border} ${theme.text} hover:opacity-80`}
          >
            <RotateCcw size={14} /> {labels.reset}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm border ${theme.border} ${theme.text} hover:opacity-80`}
            >
              {labels.cancel}
            </button>
            <button
              onClick={() => onApply(rect)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}
            >
              <Check size={14} /> {labels.apply}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
