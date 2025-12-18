// components/tools/developer/color-picker/ColorPickerTool.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileUp,
  Pipette,
  Copy,
  Check,
  Palette,
  Download,
  Shuffle,
  Trash2,
  Sparkles,
  Code2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import ColorThief from "colorthief";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useColorPickerContent,
  type ColorPickerToolContent,
} from "./color-picker.content"; // ✅ مسیر نسبی اصلاح شد

type ColorFormat = "hex" | "rgb" | "hsl";
type DataUrl = string | null;

export default function ColorPickerTool() {
  const theme = useThemeColors();
  const content: ColorPickerToolContent = useColorPickerContent();

  const [image, setImage] = useState<DataUrl>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hoverColor, setHoverColor] = useState<string>("#ffffff");
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [colorFormat, setColorFormat] = useState<ColorFormat>("hex");
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);

  // URL state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
          if (image) {
            URL.revokeObjectURL(image);
          }

          const url = URL.createObjectURL(acceptedFiles[0]);
          setImage(url);
          setImageLoaded(false);
          setPickedColors([]);
          setPalette([]);
          setHoverColor("#ffffff");
          setImageUrlInput("");
        }
      },
      [image]
    ),
  });

  // ----- color helpers -----
  const rgbToHex = (r: number, g: number, b: number) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  const hexToRgb = (hex: string) => {
    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(
          result[2],
          16
        )}, ${parseInt(result[3], 16)})`
      : hex;
  };

  const hexToHsl = (hex: string) => {
    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(
      s * 100
    )}%, ${Math.round(l * 100)}%)`;
  };

  const formatColor = (hex: string) => {
    switch (colorFormat) {
      case "rgb":
        return hexToRgb(hex);
      case "hsl":
        return hexToHsl(hex);
      default:
        return hex;
    }
  };

  // ----- image load + palette -----
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    try {
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);

      const colorThief = new ColorThief();
      // Using try-catch for color extraction as it might fail for some images
      try {
        const paletteRGB = colorThief.getPalette(img, 8);
        if (paletteRGB) {
            const paletteHex = paletteRGB.map((rgb: number[]) =>
                rgbToHex(rgb[0], rgb[1], rgb[2])
            );
            setPalette(paletteHex);
        }
      } catch (e) {
          console.warn("ColorThief failed to extract palette", e);
      }
    } catch (e) {
      console.error("Error drawing image to canvas:", e);
    }
  }, []);

  useEffect(() => {
    const img = imageRef.current;
    if (!img || !image) return;

    if (img.complete) {
      handleImageLoad();
    }
  }, [image, handleImageLoad]);

  // ----- pointer-based sampling (desktop + mobile) -----
  const sampleAtClientPoint = (clientX: number, clientY: number) => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    setMagnifierPos({ x: clientX, y: clientY });

    try {
      const pixel = ctx?.getImageData(x, y, 1, 1).data;
      if (pixel && pixel.length >= 3) {
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        setHoverColor(hex);
      }
    } catch (e) {
      console.error("Error reading pixel color:", e);
    }
  };

  const handlePointerMove: React.PointerEventHandler<HTMLImageElement> = (
    e
  ) => {
    if (!imageLoaded) return;
    sampleAtClientPoint(e.clientX, e.clientY);
  };

  const handlePointerDown: React.PointerEventHandler<HTMLImageElement> = (
    e
  ) => {
    if (!imageLoaded) return;
    sampleAtClientPoint(e.clientX, e.clientY);
    setShowMagnifier(true);

    setPickedColors((prev) => {
      if (prev.includes(hoverColor)) return prev;
      return [hoverColor, ...prev].slice(0, 20);
    });
  };

  const handlePointerLeave: React.PointerEventHandler<HTMLImageElement> = () => {
    setShowMagnifier(false);
  };

  // ----- clipboard & palette ops -----
  const copyToClipboard = (color: string, idx: number) => {
    const formatted = formatColor(color);
    navigator.clipboard.writeText(formatted);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const generateComplementary = () => {
    if (palette.length === 0) return;

    const baseColor = palette[0];
    const result =
      /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(baseColor);
    if (!result) return;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    const complementary = rgbToHex(255 - r, 255 - g, 255 - b);
    const analogous1 = rgbToHex(Math.min(255, r + 30), g, b);
    const analogous2 = rgbToHex(r, Math.min(255, g + 30), b);
    const triadic1 = rgbToHex(g, b, r);
    const triadic2 = rgbToHex(b, r, g);

    setPalette([
      baseColor,
      complementary,
      analogous1,
      analogous2,
      triadic1,
      triadic2,
      ...palette.slice(1, 2),
    ]);
  };

  const exportToCss = () => {
    const css = palette
      .map((color, idx) => `  --color-${idx + 1}: ${color};`)
      .join("\n");

    const fullCss = `:root {\n${css}\n}`;
    const blob = new Blob([fullCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setImageLoaded(false);
    setPickedColors([]);
    setPalette([]);
    setHoverColor("#ffffff");
    setImageUrlInput("");
  };

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  // ----- load from URL (client fetch, still local processing) -----
  const handleAddFromUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsAddingFromUrl(true);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("Not an image");
      }

      if (image) {
        URL.revokeObjectURL(image);
      }

      const objectUrl = URL.createObjectURL(blob);
      setImage(objectUrl);
      setImageLoaded(false);
      setPickedColors([]);
      setPalette([]);
      setHoverColor("#ffffff");
      setImageUrlInput("");
    } catch (e) {
      console.error("Error loading image from URL:", e);
      alert(
        "Error loading image from URL. The source site may block CORS. Please download the image and upload it here."
      );
    } finally {
      setIsAddingFromUrl(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${
            theme.text === "text-slate-900"
              ? "rgba(100, 116, 139, 0.3)"
              : "rgba(148, 163, 184, 0.3)"
          };
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${
            theme.text === "text-slate-900"
              ? "rgba(59, 130, 246, 0.5)"
              : "rgba(96, 165, 250, 0.5)"
          };
        }
      `}</style>

      {/* format selector */}
      {image && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 flex items-center justify-between ${theme.card} ${theme.border}`}
        >
          <div className="flex items-center gap-2">
            <Code2 size={18} className={theme.accent} />
            <span className={`text-sm font-medium ${theme.text}`}>
              {content.ui.format.label}
            </span>
          </div>
          <div className="flex gap-2">
            {(["hex", "rgb", "hsl"] as const).map((format) => (
              <button
                key={format}
                onClick={() => setColorFormat(format)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${
                    colorFormat === format
                      ? `${theme.primary} shadow-md`
                      : `${theme.bg} ${theme.text} ${theme.border} border hover:${theme.secondary}`
                  }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* image area */}
        <div
          ref={containerRef}
          className={`lg:col-span-2 rounded-3xl border overflow-hidden relative min-h-[400px] ${theme.bg} ${theme.border}`}
        >
          {!image ? (
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer p-10 w-full h-full flex items-center justify-center transition-all duration-200 min-h-[400px]
                ${isDragActive ? "scale-95" : ""}
              `}
            >
              <input {...getInputProps()} />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={`p-4 rounded-full ${theme.secondary}`}>
                  <FileUp size={32} className={theme.accent} />
                </div>
                <p className={`font-bold text-lg ${theme.text}`}>
                  {content.ui.upload.dropTitle}
                </p>
                <p className={`text-sm ${theme.textMuted}`}>
                  {content.ui.upload.dropSubtitle}
                </p>
              </motion.div>
            </div>
          ) : (
            <div
              className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4"
            >
              <img
                ref={imageRef}
                src={image}
                alt="Target"
                className={`max-w-full max-h-[600px] w-auto h-auto object-contain rounded-xl select-none transition-opacity duration-300
                  ${
                    imageLoaded
                      ? "opacity-100 cursor-crosshair"
                      : "opacity-50 cursor-wait"
                  }
                `}
                onLoad={handleImageLoad}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                onPointerLeave={handlePointerLeave}
                crossOrigin="anonymous"
                draggable={false}
                style={{ touchAction: "none" }} // important for mobile pointer events
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Magnifier */}
              {showMagnifier && imageLoaded && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="fixed pointer-events-none z-50 w-28 h-28 rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: hoverColor,
                    left: magnifierPos.x + 20,
                    top: magnifierPos.y + 20,
                  }}
                >
                  <Pipette
                    size={20}
                    className="text-white drop-shadow-lg mb-1"
                  />
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                    {formatColor(hoverColor)}
                  </span>
                </motion.div>
              )}

              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`px-4 py-2 rounded-xl ${theme.card} border ${theme.border}`}
                  >
                    <p className={`text-sm ${theme.textMuted}`}>
                      {content.ui.upload.loading}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {image && (
            <button
              onClick={resetImage}
              className={`absolute top-4 right-4 p-2 rounded-xl shadow-lg transition-all hover:scale-105 ${theme.card} border ${theme.border}`}
            >
              <Trash2 size={18} className="text-red-500" />
            </button>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-4">
          {/* current color */}
          <motion.div
            layout
            className={`p-6 rounded-3xl border text-center ${theme.card} ${theme.border}`}
          >
            <div
              className="w-full h-24 rounded-2xl mb-4 shadow-inner border-4 border-white dark:border-gray-800 transition-colors duration-150"
              style={{ backgroundColor: hoverColor }}
            />
            <p className={`text-xs font-medium mb-2 ${theme.textMuted}`}>
              {content.ui.currentColor.title}
            </p>
            <p
              className={`text-2xl font-black uppercase font-mono ${theme.text}`}
            >
              {formatColor(hoverColor)}
            </p>
            <button
              onClick={() => copyToClipboard(hoverColor, -1)}
              disabled={!imageLoaded}
              className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 mx-auto
                ${
                  copiedIndex === -1
                    ? "bg-green-500 text-white"
                    : `${theme.secondary} ${theme.accent}`
                }
                ${!imageLoaded ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {copiedIndex === -1 ? <Check size={16} /> : <Copy size={16} />}
              {copiedIndex === -1
                ? content.ui.currentColor.copied
                : content.ui.currentColor.copy}
            </button>
          </motion.div>

          {/* auto palette */}
          {palette.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border ${theme.card} ${theme.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-bold flex items-center gap-2 ${theme.text}`}
                >
                  <Palette size={18} /> {content.ui.palette.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={generateComplementary}
                    className={`p-2 rounded-lg transition hover:${theme.secondary}`}
                    title={content.ui.palette.generateComplementaryTitle}
                  >
                    <Shuffle size={16} className={theme.accent} />
                  </button>
                  <button
                    onClick={exportToCss}
                    className={`p-2 rounded-lg transition hover:${theme.secondary}`}
                    title={content.ui.palette.downloadCssTitle}
                  >
                    <Download size={16} className={theme.accent} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <AnimatePresence>
                  {palette.map((color, idx) => (
                    <motion.button
                      key={color + idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={() => copyToClipboard(color, idx + 100)}
                      className="relative group h-14 rounded-xl border-2 shadow-sm transition-transform active:scale-95 hover:scale-105"
                      style={{
                        backgroundColor: color,
                        borderColor: color,
                      }}
                      title={formatColor(color)}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 text-white rounded-xl transition-opacity">
                        {copiedIndex === idx + 100 ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* history */}
          {pickedColors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border ${theme.card} ${theme.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-bold flex items-center gap-2 ${theme.text}`}
                >
                  <Sparkles size={18} /> {content.ui.history.title}
                </h3>
                <button
                  onClick={() => setPickedColors([])}
                  className={`text-xs ${theme.textMuted} hover:text-red-500 transition`}
                >
                  {content.ui.history.clearAll}
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence>
                  {pickedColors.map((color, idx) => (
                    <motion.div
                      key={color + idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center justify-between p-2 rounded-xl border ${theme.bg} ${theme.border}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shadow-sm border-2"
                          style={{
                            backgroundColor: color,
                            borderColor: color,
                          }}
                        />
                        <span
                          className={`font-mono text-sm font-bold ${theme.text}`}
                        >
                          {formatColor(color)}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(color, idx)}
                        className={`p-2 rounded-lg transition-all
                          ${
                            copiedIndex === idx
                              ? "bg-green-100 dark:bg-green-900 text-green-600"
                              : `hover:${theme.secondary} ${theme.textMuted}`
                          }`}
                      >
                        {copiedIndex === idx ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* load from URL */}
      <div className="space-y-2">
        <p className={`text-xs ${theme.textMuted}`}>
          {content.ui.upload.urlHint}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder={content.ui.upload.urlPlaceholder}
            className={`flex-1 px-3 py-2 rounded-xl text-xs border ${theme.border} ${theme.bg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          <button
            type="button"
            onClick={handleAddFromUrl}
            disabled={isAddingFromUrl}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-60"
          >
            {isAddingFromUrl
              ? content.ui.upload.urlLoading
              : content.ui.upload.urlButton}
          </button>
        </div>
      </div>
    </div>
  );
}
