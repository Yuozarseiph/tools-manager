"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "../image-editor.content";

interface RotateTabProps {
  imageUrl: string | null;
  hasImage: boolean;
}

// flip ها رو جدا نگه می‌داریم، زاویه هم عدد دلخواه است
export default function RotateTab({ imageUrl, hasImage }: RotateTabProps) {
  const theme = useThemeColors();
  const content = useImageEditorContent();

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [angle, setAngle] = useState(0); // درجه
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // لود تصویر
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setAngle(0);
      setFlipH(false);
      setFlipV(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setAngle(0);
      setFlipH(false);
      setFlipV(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // رندر روی canvas بر اساس angle و flip[web:161][web:178]
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    // bounding box چرخش مستطیل
    const bboxWidth = image.width * cos + image.height * sin;
    const bboxHeight = image.width * sin + image.height * cos;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.round(bboxWidth);
    canvas.height = Math.round(bboxHeight);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // مرکز canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // چرخش دلخواه
    ctx.rotate(rad);

    // flip افقی/عمودی
    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // رسم تصویر حول مرکز
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );

    ctx.restore();
  }, [image, angle, flipH, flipV]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "rotated-image.png";
    link.click();
  };

  const resetTransform = () => {
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
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
          {content.ui.rotateTab.title}
        </h3>

        {/* زاویه دلخواه */}
        <div className="space-y-1 text-xs">
          <label className={`flex justify-between ${theme.textMuted}`}>
            <span>زاویه چرخش</span>
            <span className="tabular-nums text-[11px]">
              {angle.toFixed(0)}°
            </span>
          </label>
          <input
            type="range"
            min={-180}
            max={180}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full"
          />
          <input
            type="number"
            min={-180}
            max={180}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value) || 0)}
            className={`w-full mt-1 px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
          />
        </div>

        {/* شورت‌کات‌ها */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <button
            type="button"
            onClick={() => setAngle((prev) => prev - 90)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            {content.ui.rotateTab.rotateLeft}
          </button>
          <button
            type="button"
            onClick={() => setAngle((prev) => prev + 90)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
          >
            {content.ui.rotateTab.rotateRight}
          </button>
          <button
            type="button"
            onClick={() => setAngle(180)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 col-span-2"
          >
            {content.ui.rotateTab.rotate180}
          </button>
        </div>

        {/* Flip */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <button
            type="button"
            onClick={() => setFlipH((v) => !v)}
            className={`px-2 py-1.5 rounded-lg ${
              flipH
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-100 hover:bg-slate-700"
            }`}
          >
            {content.ui.rotateTab.flipH}
          </button>
          <button
            type="button"
            onClick={() => setFlipV((v) => !v)}
            className={`px-2 py-1.5 rounded-lg ${
              flipV
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-100 hover:bg-slate-700"
            }`}
          >
            {content.ui.rotateTab.flipV}
          </button>
        </div>

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={resetTransform}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            {content.ui.filters.reset}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500"
          >
            {content.ui.rotateTab.download}
          </button>
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div
        className={`flex-1 flex items-center justify-center rounded-xl border p-4 ${theme.card} ${theme.border}`}
      >
        {image ? (
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
