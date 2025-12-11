"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "../image-editor.content";

interface TextTabProps {
  imageUrl: string | null;
  hasImage: boolean;
}

type ObjectKind = "text" | "image";
type FontWeight = "normal" | "500" | "600" | "700" | "900";

interface BaseObject {
  id: string;
  kind: ObjectKind;
  x: number;
  y: number;
  rotation: number; // radians
  scale: number;
}

interface TextObject extends BaseObject {
  kind: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;

  color: string;
  strokeColor: string;
  strokeWidth: number;

  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

interface ImageObject extends BaseObject {
  kind: "image";
  img: HTMLImageElement;
  width: number;
  height: number;
  name: string;
}

type CanvasObject = TextObject | ImageObject;

interface ObjectBox {
  width: number;
  height: number;
}

function isTextObject(obj: CanvasObject): obj is TextObject {
  return obj.kind === "text";
}

function isImageObject(obj: CanvasObject): obj is ImageObject {
  return obj.kind === "image";
}

export default function TextTab({ imageUrl, hasImage }: TextTabProps) {
  const theme = useThemeColors();
  const content = useImageEditorContent();

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // فونت‌های در دسترس (پیش‌فرض + آپلودی)
  const [availableFonts, setAvailableFonts] = useState<string[]>([
    "sans-serif",
    "serif",
    "monospace",
  ]);

  // حالت‌های درگ/چرخش
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const rotateOffsetRef = useRef<number>(0);

  // لود تصویر اصلی
  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setObjects([]);
      setSelectedId(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setObjects((prev) => {
        if (prev.length > 0) return prev;
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const initial: TextObject = {
          id: "text-1",
          kind: "text",
          text: "Sample text",
          x: centerX,
          y: centerY,
          rotation: 0,
          scale: 1,
          fontFamily: "sans-serif",
          fontSize: Math.max(24, Math.round(img.width / 20)),
          fontWeight: "700",
          color: "#ffffff",
          strokeColor: "#000000",
          strokeWidth: 2,
          shadowColor: "#00000080",
          shadowBlur: 8,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        };
        setSelectedId(initial.id);
        return [initial];
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  function getSelected(): CanvasObject | null {
    return objects.find((o) => o.id === selectedId) || null;
  }

  function updateSelected(updater: (prev: CanvasObject) => CanvasObject) {
    if (!selectedId) return;
    setObjects((prev) =>
      prev.map((obj) => (obj.id === selectedId ? updater(obj) : obj))
    );
  }

  // فونت برای متن روی context
  function applyFont(ctx: CanvasRenderingContext2D, obj: TextObject) {
    ctx.font = `${obj.fontWeight} ${obj.fontSize}px ${obj.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  // باکس آبجکت (متن یا تصویر)
  function getObjectBox(
    ctx: CanvasRenderingContext2D,
    obj: CanvasObject
  ): ObjectBox {
    if (isTextObject(obj)) {
      applyFont(ctx, obj);
      const metrics = ctx.measureText(obj.text || " ");
      return { width: metrics.width, height: obj.fontSize };
    } else {
      return { width: obj.width, height: obj.height };
    }
  }

  // رندر: تصویر پس‌زمینه + همه آبجکت‌ها
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const obj of objects) {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);
      ctx.scale(obj.scale, obj.scale);

      if (isTextObject(obj)) {
        if (!obj.text.trim()) {
          ctx.restore();
          continue;
        }

        applyFont(ctx, obj);

        // سایه و استایل [web:201][web:189]
        ctx.shadowColor = obj.shadowColor;
        ctx.shadowBlur = obj.shadowBlur;
        ctx.shadowOffsetX = obj.shadowOffsetX;
        ctx.shadowOffsetY = obj.shadowOffsetY;

        if (obj.strokeWidth > 0) {
          ctx.lineWidth = obj.strokeWidth;
          ctx.strokeStyle = obj.strokeColor;
          ctx.strokeText(obj.text, 0, 0);
        }

        ctx.fillStyle = obj.color;
        ctx.fillText(obj.text, 0, 0);
      } else if (isImageObject(obj)) {
        ctx.drawImage(
          obj.img,
          -obj.width / 2,
          -obj.height / 2,
          obj.width,
          obj.height
        );
      }

      // باکس انتخاب + هندل چرخش برای آبجکت انتخاب‌شده
      if (obj.id === selectedId) {
        const box = getObjectBox(ctx, obj);
        const halfW = box.width / 2;
        const halfH = box.height / 2;

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = "rgba(59,130,246,0.9)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(-halfW - 8, -halfH - 4, box.width + 16, box.height + 8);
        ctx.setLineDash([]);

        const handleY = -halfH - 28;
        const handleRadius = 7;

        ctx.beginPath();
        ctx.moveTo(0, -halfH - 4);
        ctx.lineTo(0, handleY + handleRadius);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, handleY, handleRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "rgba(59,130,246,0.9)";
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [image, objects, selectedId]);

  // مختصات موس روی canvas
  function getMousePos(
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  // hit-test روی یک آبجکت
  function hitTestObject(
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    obj: CanvasObject
  ): { inBox: boolean; inRotateHandle: boolean } {
    const box = getObjectBox(ctx, obj);
    const halfW = box.width / 2;
    const halfH = box.height / 2;

    const dx = x - obj.x;
    const dy = y - obj.y;

    const cos = Math.cos(-obj.rotation);
    const sin = Math.sin(-obj.rotation);

    let localX = dx * cos - dy * sin;
    let localY = dx * sin + dy * cos;

    localX /= obj.scale;
    localY /= obj.scale;

    const inBox =
      localX >= -halfW - 8 &&
      localX <= halfW + 8 &&
      localY >= -halfH - 4 &&
      localY <= halfH + 4;

    const handleY = -halfH - 28;
    const handleRadius = 10;
    const distSq = localX * localX + (localY - handleY) * (localY - handleY);
    const inRotateHandle = distSq <= handleRadius * handleRadius;

    return { inBox, inRotateHandle };
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!canvasRef.current || objects.length === 0) return;
    const pos = getMousePos(e);
    if (!pos) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    let foundId: string | null = null;
    let rotateOnThis = false;

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const { inBox, inRotateHandle } = hitTestObject(pos.x, pos.y, ctx, obj);
      if (inRotateHandle) {
        foundId = obj.id;
        rotateOnThis = true;
        break;
      }
      if (inBox && !foundId) {
        foundId = obj.id;
      }
    }

    if (foundId) {
      setSelectedId(foundId);
      const obj = objects.find((o) => o.id === foundId);
      if (!obj) return;

      if (rotateOnThis) {
        setIsRotating(true);
        setIsDragging(false);
        const angleToMouse = Math.atan2(pos.y - obj.y, pos.x - obj.x);
        rotateOffsetRef.current = angleToMouse - obj.rotation;
      } else {
        setIsDragging(true);
        setIsRotating(false);
        lastMousePosRef.current = pos;
      }
    } else {
      setSelectedId(null);
      setIsDragging(false);
      setIsRotating(false);
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!canvasRef.current) return;
    const pos = getMousePos(e);
    if (!pos) return;

    const selected = getSelected();
    if (!selected) return;

    if (isDragging && lastMousePosRef.current) {
      const dx = pos.x - lastMousePosRef.current.x;
      const dy = pos.y - lastMousePosRef.current.y;
      lastMousePosRef.current = pos;

      setObjects((prev) =>
        prev.map((o) =>
          o.id === selected.id ? { ...o, x: o.x + dx, y: o.y + dy } : o
        )
      );
    }

    if (isRotating) {
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id !== selected.id) return o;
          const angleToMouse = Math.atan2(pos.y - o.y, pos.x - o.x);
          const baseOffset = rotateOffsetRef.current || 0;
          return {
            ...o,
            rotation: angleToMouse - baseOffset,
          };
        })
      );
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setIsRotating(false);
    lastMousePosRef.current = null;
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "text-image.png";
    link.click();
  };

  // مدیریت آبجکت‌ها
  const addNewText = () => {
    if (!image) return;
    const id = `text-${Date.now()}`;
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    const newObj: TextObject = {
      id,
      kind: "text",
      text: "New text",
      x: centerX,
      y: centerY,
      rotation: 0,
      scale: 1,
      fontFamily: "sans-serif",
      fontSize: Math.max(24, Math.round(image.width / 24)),
      fontWeight: "700",
      color: "#ffffff",
      strokeColor: "#000000",
      strokeWidth: 2,
      shadowColor: "#00000080",
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    };
    setObjects((prev) => [...prev, newObj]);
    setSelectedId(id);
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    const selected = getSelected();
    if (!selected) return;
    const id = `${selected.kind}-${Date.now()}`;
    const copy: CanvasObject = {
      ...selected,
      id,
      x: selected.x + 20,
      y: selected.y + 20,
    } as CanvasObject;
    setObjects((prev) => [...prev, copy]);
    setSelectedId(id);
  };

  // افزودن استیکر تصویر (PNG/JPG/SVG/WebP/AVIF)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !image) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const id = `image-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const obj: ImageObject = {
          id,
          kind: "image",
          img,
          width: img.width,
          height: img.height,
          name: file.name,
          x: image.width / 2,
          y: image.height / 2,
          rotation: 0,
          scale: 1,
        };
        setObjects((prev) => [...prev, obj]);
        setSelectedId(id);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    e.target.value = "";
  };

  // آپلود فونت دلخواه (CSS Font Loading API) [web:219][web:220][web:230]
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName =
      file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") ||
      "CustomFont";

    const blobUrl = URL.createObjectURL(file);

    try {
      const fontFace = new FontFace(fontName, `url(${blobUrl})`);
      await fontFace.load();
      (document as any).fonts.add(fontFace);
      setAvailableFonts((prev) =>
        prev.includes(fontName) ? prev : [...prev, fontName]
      );
      if (selectedId) {
        updateSelected((prev) =>
          isTextObject(prev) ? { ...prev, fontFamily: fontName } : prev
        );
      }
    } catch (err) {
      console.error("Error loading custom font", err);
    }
  };

  if (!hasImage) {
    return (
      <div className={`text-xs ${theme.textMuted}`}>
        {content.ui.editorHeader.noImageHint}
      </div>
    );
  }

  if (!image) {
    return (
      <div className={`text-xs ${theme.textMuted}`}>
        {content.ui.canvas.loading}
      </div>
    );
  }

  const selected = getSelected();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* کنترل‌ها */}
      <div
        className={`w-full lg:w-80 rounded-xl border p-4 space-y-3 ${theme.card} ${theme.border}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-sm font-semibold ${theme.text}`}>
            {content.ui.textTab.title}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addNewText}
              className="px-2 py-1 rounded-lg text-xs bg-slate-800 text-slate-100 hover:bg-slate-700"
            >
              + متن
            </button>

            <label className="px-2 py-1 rounded-lg text-xs bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer">
              + تصویر
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* لیست آبجکت‌ها */}
        <div className="space-y-1 text-xs">
          <label className={theme.textMuted}>لایه‌ها</label>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {objects.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelectedId(o.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded border text-left ${
                  o.id === selectedId
                    ? "bg-blue-600 text-white border-blue-500"
                    : `${theme.bg} ${theme.text} ${theme.border} hover:bg-slate-800`
                }`}
              >
                <span className="truncate text-xs">
                  {isTextObject(o) ? o.text || "(متن خالی)" : `🖼 ${o.name}`}
                </span>
                <span className="text-[10px] opacity-70">
                  {Math.round(o.x)}, {Math.round(o.y)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={duplicateSelected}
              disabled={!selected}
              className={`flex-1 px-2 py-1 rounded-lg text-xs ${
                selected
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "bg-slate-900 text-slate-500 cursor-not-allowed"
              }`}
            >
              کپی
            </button>
            <button
              type="button"
              onClick={removeSelected}
              disabled={!selected}
              className={`flex-1 px-2 py-1 rounded-lg text-xs ${
                selected
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-slate-900 text-slate-500 cursor-not-allowed"
              }`}
            >
              حذف
            </button>
          </div>
        </div>

        {/* آپلود فونت دلخواه */}
        <div className="space-y-1 text-xs pt-1 border-t border-slate-700/50 mt-2">
          <label className={theme.textMuted}>فونت دلخواه (TTF/OTF/WOFF)</label>
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFontUpload}
            className="block w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
          />
        </div>

        {selected && (
          <>
            {/* Scale مشترک */}
            <div className="text-xs pt-2 border-t border-slate-700/50 mt-2">
              <label className={theme.textMuted}>مقیاس (Scale)</label>
              <input
                type="range"
                min={10}
                max={300}
                value={Math.round(selected.scale * 100)}
                onChange={(e) => {
                  const s = Number(e.target.value) / 100;
                  updateSelected((prev) => ({ ...prev, scale: s }));
                }}
                className="w-full"
              />
            </div>

            {/* تنظیمات متن فقط وقتی آبجکت متن است */}
            {isTextObject(selected) && (
              <>
                {/* متن */}
                <div className="space-y-1 text-xs pt-2">
                  <label className={theme.textMuted}>
                    {content.ui.textTab.content}
                  </label>
                  <textarea
                    value={selected.text}
                    onChange={(e) =>
                      updateSelected((prev) =>
                        isTextObject(prev)
                          ? { ...prev, text: e.target.value }
                          : prev
                      )
                    }
                    rows={3}
                    className={`w-full px-2 py-1.5 rounded border text-xs resize-none ${theme.bg} ${theme.border} ${theme.text}`}
                  />
                </div>

                {/* فونت و سایز و وزن */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.fontFamily}
                    </label>
                    <select
                      value={selected.fontFamily}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? { ...prev, fontFamily: e.target.value }
                            : prev
                        )
                      }
                      className={`w-full mt-1 px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
                    >
                      {availableFonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.fontSize}
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={300}
                      value={selected.fontSize}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? {
                                ...prev,
                                fontSize: Number(e.target.value) || 12,
                              }
                            : prev
                        )
                      }
                      className={`w-full mt-1 px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.fontWeight}
                    </label>
                    <select
                      value={selected.fontWeight}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? {
                                ...prev,
                                fontWeight: e.target.value as FontWeight,
                              }
                            : prev
                        )
                      }
                      className={`w-full mt-1 px-2 py-1.5 rounded border text-xs ${theme.bg} ${theme.border} ${theme.text}`}
                    >
                      <option value="normal">Normal</option>
                      <option value="500">500</option>
                      <option value="600">600</option>
                      <option value="700">700</option>
                      <option value="900">900</option>
                    </select>
                  </div>
                </div>

                {/* رنگ و Outline */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.color}
                    </label>
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? { ...prev, color: e.target.value }
                            : prev
                        )
                      }
                      className="w-full h-8 mt-1 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.strokeColor}
                    </label>
                    <input
                      type="color"
                      value={selected.strokeColor}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? { ...prev, strokeColor: e.target.value }
                            : prev
                        )
                      }
                      className="w-full h-8 mt-1 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="text-xs">
                  <label className={theme.textMuted}>
                    {content.ui.textTab.strokeWidth}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={selected.strokeWidth}
                    onChange={(e) =>
                      updateSelected((prev) =>
                        isTextObject(prev)
                          ? {
                              ...prev,
                              strokeWidth: Number(e.target.value),
                            }
                          : prev
                      )
                    }
                    className="w-full"
                  />
                </div>

                {/* سایه */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.shadowColor}
                    </label>
                    <input
                      type="color"
                      value={selected.shadowColor}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? { ...prev, shadowColor: e.target.value }
                            : prev
                        )
                      }
                      className="w-full h-8 mt-1 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.shadowBlur}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={selected.shadowBlur}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? {
                                ...prev,
                                shadowBlur: Number(e.target.value),
                              }
                            : prev
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.shadowOffsetX}
                    </label>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={selected.shadowOffsetX}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? {
                                ...prev,
                                shadowOffsetX: Number(e.target.value),
                              }
                            : prev
                        )
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className={theme.textMuted}>
                      {content.ui.textTab.shadowOffsetY}
                    </label>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={selected.shadowOffsetY}
                      onChange={(e) =>
                        updateSelected((prev) =>
                          isTextObject(prev)
                            ? {
                                ...prev,
                                shadowOffsetY: Number(e.target.value),
                              }
                            : prev
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-500"
        >
          {content.ui.textTab.download}
        </button>
      </div>

      {/* پیش‌نمایش */}
      <div
        className={`flex-1 flex items-center justify-center rounded-xl border p-4 ${theme.card} ${theme.border}`}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[70vh] rounded-lg bg-black/40 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        />
      </div>
    </div>
  );
}
