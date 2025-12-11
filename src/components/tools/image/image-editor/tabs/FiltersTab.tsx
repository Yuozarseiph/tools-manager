"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "../image-editor.content";

interface FiltersState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
}

const defaultFilters: FiltersState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
};

interface FiltersTabProps {
  imageUrl: string | null;
  hasImage: boolean;
}

export default function FiltersTab({ imageUrl, hasImage }: FiltersTabProps) {
  const theme = useThemeColors();
  const content = useImageEditorContent(); // اینجا به i18n وصل می‌شیم.[file:141]

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    const b = 1 + filters.brightness / 100;
    const c = 1 + filters.contrast / 100;
    const s = 1 + filters.saturation / 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = [
      `brightness(${b})`,
      `contrast(${c})`,
      `saturate(${s})`,
      `blur(${filters.blur}px)`,
      `grayscale(${filters.grayscale}%)`,
      `sepia(${filters.sepia}%)`,
    ].join(" ");

    ctx.drawImage(image, 0, 0);
  }, [image, filters]);

  const updateFilter = (key: keyof FiltersState, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => setFilters(defaultFilters);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "filtered-image.png";
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* کنترل‌ها */}
      <div
        className={`w-full lg:w-64 rounded-xl border p-4 space-y-3 ${theme.card} ${theme.border}`}
      >
        <h3 className={`text-sm font-semibold ${theme.text}`}>
          {content.ui.filters.title}
        </h3>

        {!hasImage && (
          <p className={`text-xs ${theme.textMuted}`}>
            {content.ui.canvas.noImage}
          </p>
        )}

        {hasImage && (
          <>
            {(
              [
                ["brightness", content.ui.filters.brightness, -100, 100],
                ["contrast", content.ui.filters.contrast, -100, 100],
                ["saturation", content.ui.filters.saturation, -100, 100],
                ["blur", content.ui.filters.blur, 0, 10],
                ["grayscale", content.ui.filters.grayscale, 0, 100],
                ["sepia", content.ui.filters.sepia, 0, 100],
              ] as const
            ).map(([key, label, min, max]) => (
              <div key={key}>
                <label
                  className={`flex justify-between text-xs mb-1 ${theme.textMuted}`}
                >
                  <span>{label}</span>
                  <span className="tabular-nums text-[11px]">
                    {filters[key]}
                    {key === "blur" ? "px" : "%"}
                  </span>
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={filters[key]}
                  onChange={(e) => updateFilter(key, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                {content.ui.filters.reset}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500"
              >
                {content.ui.filters.download}
              </button>
            </div>
          </>
        )}
      </div>

      {/* پیش‌نمایش */}
      <div
        className={`flex-1 flex items-center justify-center rounded-xl border p-4 ${theme.card} ${theme.border}`}
      >
        {hasImage && image ? (
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
