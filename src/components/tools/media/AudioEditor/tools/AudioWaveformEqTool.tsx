"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Upload,
  Play,
  Pause,
  Repeat,
  RotateCcw,
  Download,
  Info,
  SlidersHorizontal,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useAudioEditorContent,
  type AudioEditorToolContent,
} from "../audio-editor.content";
import { useAudioWaveformEq, formatTime } from "./useAudioWaveformEq";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

type DragMode = "start" | "end" | null;

export default function AudioWaveformEqTool() {
  const theme = useThemeColors();
  const content: AudioEditorToolContent = useAudioEditorContent();
  const tool = useAudioWaveformEq();

  // دسترسی ایمن به بخش‌های محتوا
  const tEq = content.ui.equalizer;
  // @ts-ignore
  const tTrim = content.ui.trim;

  const ui = {
    title: tEq.controls.title,
    subtitle: tEq.controls.subtitle,
    uploadBtn: tEq.upload.button,

    durationLabel: tEq.fileInfo.durationLabel,
    posLabel: tEq.fileInfo.currentPositionLabel,
    selectionLabel: tTrim?.fileInfo?.selectionLabel ?? "Selection:",

    play: tEq.transport.play,
    pause: tEq.transport.pause,

    loopOn: "Loop: ON", // این کلید در فایل ترجمه نبود، مقدار پیش‌فرض
    loopOff: "Loop: OFF", // این کلید در فایل ترجمه نبود، مقدار پیش‌فرض

    resetEq: tEq.controls.resetLabel,
    rangeLabel: tEq.controls.rangeLabel,

    segmentGainTitle: "Selection Volume", // مقدار پیش‌فرض
    exportSel: tEq.actions.downloadIdle,
    exportFull: "Download Full (With EQ)", // مقدار پیش‌فرض

    noFileTitle: tEq.empty.title,
    noFileDesc: tEq.empty.description,
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dragState = useRef<{ mode: DragMode; pointerId: number | null }>({
    mode: null,
    pointerId: null,
  });

  const barDragRef = useRef<
    | { active: false }
    | {
        active: true;
        index: number;
        pointerId: number;
        startY: number;
        startGainDb: number;
      }
  >({ active: false });

  const GAIN_MIN = -12;
  const GAIN_MAX = 12;
  const SEG_GAIN_MIN = -12;
  const SEG_GAIN_MAX = 12;
  const PX_PER_DB = 6;

  const gainToPercent = (gainDb: number) =>
    ((gainDb - GAIN_MIN) / (GAIN_MAX - GAIN_MIN)) * 100;

  const yToGain = (y: number, rectTop: number, rectHeight: number) => {
    const rel = clamp((y - rectTop) / rectHeight, 0, 1);
    const gain = GAIN_MAX - rel * (GAIN_MAX - GAIN_MIN);
    return clamp(gain, GAIN_MIN, GAIN_MAX);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width || 0));
    const h = 160;
    if (w <= 1) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    const peaks = tool.getPeaks(w);
    if (peaks) {
      const mid = h / 2;

      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(w, mid);
      ctx.stroke();

      ctx.strokeStyle = "rgba(59,130,246,0.85)";
      ctx.lineWidth = 1;

      const cols = peaks.minArr.length;
      for (let x = 0; x < w; x++) {
        const idx = Math.floor((x / w) * cols);
        const mn = peaks.minArr[idx];
        const mx = peaks.maxArr[idx];
        const y1 = mid + mn * mid;
        const y2 = mid + mx * mid;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
    }

    // overlays
    if (tool.duration > 0) {
      const sx = (tool.selStart / tool.duration) * w;
      const ex = (tool.selEnd / tool.duration) * w;

      ctx.fillStyle = "rgba(16,185,129,0.08)";
      ctx.fillRect(Math.min(sx, ex), 0, Math.abs(ex - sx), h);

      ctx.strokeStyle = "rgba(16,185,129,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ex, 0);
      ctx.lineTo(ex, h);
      ctx.stroke();

      const xt = (tool.currentTime / tool.duration) * w;
      ctx.strokeStyle = "rgba(244,63,94,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xt, 0);
      ctx.lineTo(xt, h);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const redraw = () => requestAnimationFrame(draw);
    redraw();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => redraw());
      ro.observe(el);
    } else {
      window.addEventListener("resize", redraw);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", redraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestAnimationFrame(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tool.currentTime,
    tool.duration,
    tool.selStart,
    tool.selEnd,
    tool.buffer,
  ]);

  const pickHandle = (x: number, w: number) => {
    if (tool.duration <= 0) return null;
    const xs = (tool.selStart / tool.duration) * w;
    const xe = (tool.selEnd / tool.duration) * w;
    const distS = Math.abs(x - xs);
    const distE = Math.abs(x - xe);
    const threshold = 10;
    if (distS <= threshold && distS <= distE) return "start";
    if (distE <= threshold) return "end";
    return null;
  };

  const onWavePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || tool.duration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;

    const handle = pickHandle(x, w);
    if (handle) {
      dragState.current.mode = handle;
      dragState.current.pointerId = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      return;
    }

    const t = clamp((x / w) * tool.duration, 0, tool.duration);
    tool.seek(t);
  };

  const onWavePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const mode = dragState.current.mode;
    if (!mode) return;

    const canvas = canvasRef.current;
    if (!canvas || tool.duration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;

    const t = clamp((x / w) * tool.duration, 0, tool.duration);

    if (mode === "start") tool.setSelStart(Math.min(t, tool.selEnd - 0.01));
    if (mode === "end") tool.setSelEnd(Math.max(t, tool.selStart + 0.01));
  };

  const onWavePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pid = dragState.current.pointerId;
    dragState.current.mode = null;
    dragState.current.pointerId = null;
    if (pid != null) {
      try {
        e.currentTarget.releasePointerCapture(pid);
      } catch {}
    }
  };

  const onBarPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    if (tool.disableControls) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    const startGainDb = tool.bands[index]?.gainDb ?? 0;
    barDragRef.current = {
      active: true,
      index,
      pointerId: e.pointerId,
      startY: e.clientY,
      startGainDb,
    };

    const newGain = yToGain(e.clientY, rect.top, rect.height);
    tool.setBandGain(index, newGain);

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = barDragRef.current;
    if (!s.active) return;

    const dy = e.clientY - s.startY;
    const deltaDb = -dy / PX_PER_DB;
    const newGain = clamp(s.startGainDb + deltaDb, GAIN_MIN, GAIN_MAX);
    tool.setBandGain(s.index, newGain);
  };

  const onBarPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = barDragRef.current;
    if (!s.active) return;

    barDragRef.current = { active: false };
    try {
      e.currentTarget.releasePointerCapture(s.pointerId);
    } catch {}
  };

  const gridChunks = useMemo(() => {
    const perRow = 16;
    const rows: (typeof tool.bands)[] = [];
    for (let i = 0; i < tool.bands.length; i += perRow)
      rows.push(tool.bands.slice(i, i + perRow));
    return rows;
  }, [tool.bands]);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${theme.bg} ${theme.border}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme.secondary}`}>
            <SlidersHorizontal size={18} className={theme.accent} />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme.text}`}>{ui.title}</p>
            <p className={`text-xs ${theme.textMuted}`}>{ui.subtitle}</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme.primary}`}
          type="button"
        >
          <Upload size={16} />
          {ui.uploadBtn}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              await tool.loadFile(f);
            } catch (err) {
              console.error(err);
              alert(content.ui.equalizer.errors.decode);
            }
          }}
        />
      </div>

      {!tool.audioUrl ? (
        <div
          className={`rounded-xl border border-dashed p-8 text-center ${theme.bg} ${theme.border}`}
        >
          <p className={`text-sm mb-2 ${theme.text}`}>{ui.noFileTitle}</p>
          <p className={`text-xs ${theme.textMuted}`}>{ui.noFileDesc}</p>
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${theme.bg} ${theme.border}`}
          >
            <div className="truncate max-w-[70%]">
              <p className={`text-sm font-semibold truncate ${theme.text}`}>
                {tool.fileName}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                {ui.durationLabel} {formatTime(tool.duration)} |{" "}
                {ui.selectionLabel} {tool.selectionLabel}
              </p>
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg ${theme.secondary}`}
            >
              <Info size={12} className={theme.accent} />
              <span className={`text-xs ${theme.text}`}>
                {ui.posLabel} {formatTime(tool.currentTime)}
              </span>
            </div>
          </div>

          <div className={`rounded-xl border p-3 ${theme.bg} ${theme.border}`}>
            <canvas
              ref={canvasRef}
              className="w-full block"
              style={{ height: 160 }}
              onPointerDown={onWavePointerDown}
              onPointerMove={onWavePointerMove}
              onPointerUp={onWavePointerUp}
            />

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <button
                onClick={tool.togglePlay}
                disabled={tool.disableControls}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tool.disableControls
                    ? "opacity-50 cursor-not-allowed"
                    : theme.primary
                }`}
                type="button"
              >
                {tool.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {tool.isPlaying ? ui.pause : ui.play}
              </button>

              <button
                onClick={() => tool.setLoopSelection(!tool.loopSelection)}
                disabled={tool.disableControls}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tool.disableControls
                    ? "opacity-50 cursor-not-allowed"
                    : theme.primary
                }`}
                type="button"
              >
                <Repeat size={16} />
                {tool.loopSelection ? ui.loopOn : ui.loopOff}
              </button>

              <button
                onClick={tool.resetSelection}
                disabled={tool.disableControls}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tool.disableControls
                    ? "opacity-50 cursor-not-allowed"
                    : `${theme.secondary} ${theme.border}`
                }`}
                type="button"
              >
                <RotateCcw size={16} className={theme.accent} />
                Reset selection
              </button>
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${theme.bg} ${theme.border}`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className={`text-sm font-semibold ${theme.text}`}>
                {ui.segmentGainTitle}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                {tool.segmentGainDb > 0 ? "+" : ""}
                {tool.segmentGainDb.toFixed(1)} dB
              </p>
            </div>

            <input
              className="w-full mt-3"
              type="range"
              min={SEG_GAIN_MIN}
              max={SEG_GAIN_MAX}
              step={0.1}
              value={tool.segmentGainDb}
              onChange={(e) => tool.setSegmentGainDb(Number(e.target.value))}
              disabled={tool.disableControls}
            />

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={tool.exportSelectionWav}
                disabled={tool.disableControls || tool.isExporting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tool.disableControls || tool.isExporting
                    ? "opacity-50 cursor-not-allowed"
                    : theme.primary
                }`}
                type="button"
              >
                <Download size={16} />
                {ui.exportSel}
              </button>

              <button
                onClick={tool.exportFullWavSelectionOnly}
                disabled={tool.disableControls || tool.isExporting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tool.disableControls || tool.isExporting
                    ? "opacity-50 cursor-not-allowed"
                    : theme.primary
                }`}
                type="button"
              >
                <Download size={16} />
                {ui.exportFull}
              </button>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 space-y-3 ${theme.bg} ${theme.border}`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className={`text-sm font-semibold ${theme.text}`}>
                {ui.rangeLabel}
              </p>

              <button
                onClick={tool.resetEq}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${theme.secondary} ${theme.border}`}
                disabled={!tool.bands.length}
                type="button"
              >
                <RotateCcw size={16} className={theme.accent} />
                {ui.resetEq}
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-max flex flex-col gap-3 pb-2">
                {gridChunks.map((row, rowIdx) => (
                  <div key={rowIdx} className="min-w-max flex items-end gap-3">
                    {row.map((b, idxInRow) => {
                      const index = rowIdx * 16 + idxInRow;
                      const pct = gainToPercent(b.gainDb);

                      return (
                        <div
                          key={b.id}
                          className={`w-12 shrink-0 rounded-xl border px-2 py-2 flex flex-col items-center gap-2 ${theme.card} ${theme.border}`}
                          title={`${b.label}: ${
                            b.gainDb > 0 ? "+" : ""
                          }${b.gainDb.toFixed(1)} dB`}
                        >
                          <div
                            className={`text-[11px] font-mono ${theme.text}`}
                          >
                            {b.gainDb > 0 ? "+" : ""}
                            {b.gainDb.toFixed(0)}
                          </div>

                          <div
                            className={`eq-bar relative w-6 h-44 rounded-lg border ${theme.border} bg-black/5 dark:bg-white/5 overflow-hidden`}
                            onPointerDown={(e) => onBarPointerDown(e, index)}
                            onPointerMove={onBarPointerMove}
                            onPointerUp={onBarPointerUp}
                          >
                            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-white/35" />
                            <div
                              className="absolute left-0 right-0 bottom-0 bg-blue-500/80"
                              style={{ height: `${pct}%` }}
                            />
                            <div
                              className="absolute left-0 right-0 bg-white/60"
                              style={{
                                height: "2px",
                                bottom: `${pct}%`,
                                transform: "translateY(1px)",
                              }}
                            />
                          </div>

                          <div
                            className={`text-[10px] leading-none ${theme.textMuted}`}
                          >
                            {b.label.replace("Hz", "")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <p className={`text-[11px] ${theme.textMuted}`}>
              EQ and Volume only apply to the exported file.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
