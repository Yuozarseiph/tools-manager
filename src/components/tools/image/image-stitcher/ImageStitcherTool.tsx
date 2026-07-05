"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  ChevronUp,
  ChevronDown,
  Trash2,
  Crop,
  Loader2,
  Download,
  Images,
} from "lucide-react";
import download from "downloadjs";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { useImageStitcherToolContent } from "./image-stitcher.content";
import CropModal, { type CropRect } from "./CropModal";

type OutFormat = "png" | "jpeg";
type Align = "left" | "center" | "right";

interface Item {
  id: string;
  src: string;
  el: HTMLImageElement;
  crop: CropRect | null;
}

const MAX = 20;
const uid = () => Math.random().toString(36).slice(2);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function ImageStitcherTool() {
  const theme = useThemeColors();
  const t = useImageStitcherToolContent();
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<OutFormat>("png");
  const [align, setAlign] = useState<Align>("center");
  const [bg, setBg] = useState("#ffffff");
  const [gap, setGap] = useState(0);
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.src));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files) return;
      const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (imgs.length === 0) return;
      setNotice("");
      const room = MAX - items.length;
      if (room <= 0) {
        setNotice(t.limitReached);
        return;
      }
      const take = imgs.slice(0, room);
      if (imgs.length > room) setNotice(t.limitReached);
      const loaded: Item[] = [];
      for (const f of take) {
        const src = URL.createObjectURL(f);
        try {
          const el = await loadImage(src);
          loaded.push({ id: uid(), src, el, crop: null });
        } catch {
          URL.revokeObjectURL(src);
        }
      }
      setItems((prev) => [...prev, ...loaded]);
      setResultUrl("");
    },
    [items.length, t.limitReached],
  );

  const move = useCallback((index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setResultUrl("");
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) URL.revokeObjectURL(found.src);
      return prev.filter((i) => i.id !== id);
    });
    setResultUrl("");
  }, []);

  const clearAll = useCallback(() => {
    items.forEach((it) => URL.revokeObjectURL(it.src));
    setItems([]);
    setResultUrl("");
    setNotice("");
    if (inputRef.current) inputRef.current.value = "";
  }, [items]);

  // Effective crop-applied dimensions of one item, in source pixels.
  const cropDims = (it: Item) => {
    const w = it.el.naturalWidth;
    const h = it.el.naturalHeight;
    if (!it.crop) return { sx: 0, sy: 0, sw: w, sh: h };
    return {
      sx: it.crop.x * w,
      sy: it.crop.y * h,
      sw: it.crop.w * w,
      sh: it.crop.h * h,
    };
  };

  const generate = useCallback(async () => {
    if (items.length === 0) return;
    setBusy(true);
    setResultUrl("");
    // Yield so the spinner paints.
    await new Promise((r) => setTimeout(r, 30));
    try {
      const dims = items.map(cropDims);
      const targetW = Math.max(...dims.map((d) => d.sw));
      const totalH =
        dims.reduce((sum, d) => {
          // Scale each image's height to the target width to keep aspect ratio.
          return sum + d.sh * (targetW / d.sw);
        }, 0) +
        gap * Math.max(0, items.length - 1);

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(targetW);
      canvas.height = Math.round(totalH);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = format === "jpeg" ? bg : "rgba(0,0,0,0)";
      if (format === "jpeg" || bg !== "#ffffff" || gap > 0) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.imageSmoothingQuality = "high";

      let y = 0;
      items.forEach((it, i) => {
        const d = dims[i];
        const scale = targetW / d.sw;
        const drawW = d.sw * scale;
        const drawH = d.sh * scale;
        let x = 0;
        if (align === "center") x = (targetW - drawW) / 2;
        else if (align === "right") x = targetW - drawW;
        ctx.drawImage(
          it.el,
          d.sx,
          d.sy,
          d.sw,
          d.sh,
          x,
          y,
          drawW,
          drawH,
        );
        y += drawH + gap;
      });

      const url = canvas.toDataURL(
        format === "png" ? "image/png" : "image/jpeg",
        format === "png" ? undefined : quality,
      );
      setResultUrl(url);
    } finally {
      setBusy(false);
    }
  }, [items, format, align, bg, gap, quality]);

  const doDownload = useCallback(() => {
    if (!resultUrl) return;
    download(
      resultUrl,
      `stitched-${Date.now()}.${format === "png" ? "png" : "jpg"}`,
      format === "png" ? "image/png" : "image/jpeg",
    );
  }, [resultUrl, format]);

  const formatOptions = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPG" },
  ];
  const alignOptions = [
    { value: "left", label: t.alignLeft },
    { value: "center", label: t.alignCenter },
    { value: "right", label: t.alignRight },
  ];

  return (
    <div
      className={`max-w-4xl mx-auto rounded-3xl border p-5 md:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.format}
          </label>
          <CustomDropdown
            options={formatOptions}
            value={format}
            onChange={(v) => setFormat(v as OutFormat)}
            searchable={false}
          />
        </div>
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.align}
          </label>
          <CustomDropdown
            options={alignOptions}
            value={align}
            onChange={(v) => setAlign(v as Align)}
            searchable={false}
          />
        </div>
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.gap} — {gap}px
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={2}
            value={gap}
            onChange={(e) => setGap(parseInt(e.target.value))}
            className="w-full accent-blue-600 mt-3"
          />
        </div>
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.bg}
          </label>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className={`w-full h-10 rounded-xl border cursor-pointer ${theme.border} bg-transparent`}
          />
        </div>
      </div>

      {format === "jpeg" && (
        <div className="mb-6">
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.quality} — {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min={0.4}
            max={1}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      )}

      {/* Dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className={`w-full flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed transition-colors ${theme.border} hover:border-blue-500 ${theme.bg}`}
      >
        <UploadCloud size={32} className={theme.accent} />
        <span className={`font-bold ${theme.text}`}>{t.dropTitle}</span>
        <span className={`text-xs ${theme.textMuted}`}>{t.dropHint}</span>
        <span className={`text-[11px] ${theme.textMuted}`}>
          {items.length}/{MAX}
        </span>
      </button>

      {notice && (
        <p className="mt-3 text-sm text-amber-500 font-medium text-center">
          {notice}
        </p>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <div className="mt-6 space-y-2">
          {items.map((it, i) => (
            <div
              key={it.id}
              className={`flex items-center gap-3 p-2 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <span className={`w-6 text-center text-xs font-bold ${theme.textMuted}`}>
                {i + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt=""
                className="w-14 h-14 object-cover rounded-lg border bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${theme.text}`}>
                  {it.el.naturalWidth}×{it.el.naturalHeight}px
                </p>
                {it.crop && (
                  <span className="text-[10px] text-green-500 font-medium">
                    {t.cropped}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconBtn
                  theme={theme}
                  title={t.moveUp}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp size={16} />
                </IconBtn>
                <IconBtn
                  theme={theme}
                  title={t.moveDown}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown size={16} />
                </IconBtn>
                <IconBtn
                  theme={theme}
                  title={t.crop}
                  onClick={() => setCropIndex(i)}
                >
                  <Crop size={15} className={theme.accent} />
                </IconBtn>
                <IconBtn
                  theme={theme}
                  title={t.remove}
                  onClick={() => remove(it.id)}
                  danger
                >
                  <Trash2 size={15} />
                </IconBtn>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-3">
            <button
              onClick={generate}
              disabled={busy}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 ${theme.primary}`}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Images size={16} />
              )}
              {busy ? t.generating : t.generate}
            </button>
            <button
              onClick={clearAll}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${theme.border} ${theme.text} hover:opacity-80`}
            >
              <Trash2 size={16} /> {t.clear}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${theme.text}`}>{t.resultTitle}</h3>
            <button
              onClick={doDownload}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}
            >
              <Download size={16} /> {t.download}
            </button>
          </div>
          <div
            className={`max-h-[70vh] overflow-auto rounded-xl border ${theme.border}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt="result" className="w-full h-auto block" />
          </div>
        </div>
      )}

      {cropIndex !== null && items[cropIndex] && (
        <CropModal
          src={items[cropIndex].src}
          initial={items[cropIndex].crop ?? undefined}
          theme={theme}
          labels={{
            title: t.cropTitle,
            apply: t.apply,
            cancel: t.cancel,
            reset: t.reset,
          }}
          onApply={(rect) => {
            const isFull =
              rect.x === 0 && rect.y === 0 && rect.w === 1 && rect.h === 1;
            setItems((prev) =>
              prev.map((it, idx) =>
                idx === cropIndex ? { ...it, crop: isFull ? null : rect } : it,
              ),
            );
            setCropIndex(null);
            setResultUrl("");
          }}
          onClose={() => setCropIndex(null)}
        />
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
  theme,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  theme: any;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          : `${theme.text} hover:bg-black/5 dark:hover:bg-white/10`
      }`}
    >
      {children}
    </button>
  );
}
