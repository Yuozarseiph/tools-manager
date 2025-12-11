"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "../image-editor.content";

interface ResizeTabProps {
  imageUrl: string | null;
  hasImage: boolean;
}

export default function ResizeTab({ imageUrl, hasImage }: ResizeTabProps) {
  const theme = useThemeColors();
  const content = useImageEditorContent();

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [keepRatio, setKeepRatio] = useState(true);
  const [scale, setScale] = useState(100); // درصد

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // لود تصویر و تنظیم اندازه اولیه
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setWidth(null);
      setHeight(null);
      setAspectRatio(null);
      setScale(100);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      setScale(100);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // هر بار width/height یا image عوض شد، روی canvas رندر کن
  useEffect(() => {
    if (!image || !canvasRef.current || width == null || height == null) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, width, height);
  }, [image, width, height]);

  const handleWidthChange = (value: number) => {
    if (!aspectRatio) {
      setWidth(value);
      return;
    }
    setWidth(value);
    if (keepRatio) {
      setHeight(Math.round(value / aspectRatio));
    }
    // به‌روزرسانی درصد مقیاس بر اساس عرض نسبت به تصویر اصلی
    if (image) {
      setScale(Math.round((value / image.width) * 100));
    }
  };

  const handleHeightChange = (value: number) => {
    if (!aspectRatio) {
      setHeight(value);
      return;
    }
    setHeight(value);
    if (keepRatio) {
      setWidth(Math.round(value * aspectRatio));
    }
    if (image) {
      setScale(Math.round((value / image.height) * 100));
    }
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
    if (!image || !aspectRatio) return;
    const newWidth = Math.round((image.width * value) / 100);
    const newHeight = keepRatio
      ? Math.round(newWidth / aspectRatio)
      : Math.round((image.height * value) / 100);

    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "resized-image.png";
    link.click();
  };

  if (!hasImage) {
    return (
      <div className={`text-xs ${theme.textMuted}`}>
        {content.ui.editorHeader.noImageHint}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* کنترل‌ها */}
      <div
        className={`w-full lg:w-64 rounded-xl border p-4 space-y-3 ${theme.card} ${theme.border}`}
      >
        <h3 className={`text-sm font-semibold ${theme.text}`}>
          {content.ui.resizeTab.title}
        </h3>

        {/* اندازه‌ها */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className={`block mb-1 ${theme.textMuted}`}>
              {content.ui.properties.width}
            </label>
            <input
              type="number"
              min={1}
              value={width ?? ""}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className={`w-full px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
            />
          </div>
          <div>
            <label className={`block mb-1 ${theme.textMuted}`}>
              {content.ui.properties.height}
            </label>
            <input
              type="number"
              min={1}
              value={height ?? ""}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className={`w-full px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
            />
          </div>
        </div>

        {/* حفظ نسبت */}
        <label className="inline-flex items-center gap-2 text-xs mt-1">
          <input
            type="checkbox"
            checked={keepRatio}
            onChange={(e) => setKeepRatio(e.target.checked)}
          />
          <span className={theme.text}>
            {content.ui.properties.maintainRatio}
          </span>
        </label>

        {/* درصد مقیاس */}
        {image && (
          <div className="mt-3">
            <label className={`flex justify-between text-xs mb-1 ${theme.textMuted}`}>
              <span>{content.ui.resizeTab.scale}</span>
              <span className="tabular-nums text-[11px]">{scale}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={300}
              value={scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              if (!image) return;
              setWidth(image.width);
              setHeight(image.height);
              setAspectRatio(image.width / image.height);
              setScale(100);
            }}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            {content.ui.filters.reset}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500"
          >
            {content.ui.resizeTab.download}
          </button>
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div
        className={`flex-1 flex items-center justify-center rounded-xl border p-4 ${theme.card} ${theme.border}`}
      >
        {image && width && height ? (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[70vh] rounded-lg bg-black/40"
          />
        ) : (
          <span className={`text-xs ${theme.textMuted}`}>
            {content.ui.canvas.noImage}
          </span>
        )}
      </div>
    </div>
  );
}
