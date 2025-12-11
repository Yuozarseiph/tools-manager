"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Download,
  Link as LinkIcon,
  Image as ImageIcon,
  Sliders,
} from "lucide-react";
import QRCode from "react-qr-code";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useQrGeneratorContent,
  type QrGeneratorToolContent,
} from "./qr-generator.content";

type CornerStyle = "square" | "rounded";

export default function QrGeneratorTool() {
  const theme = useThemeColors();
  const content: QrGeneratorToolContent = useQrGeneratorContent();

  const [text, setText] = useState("https://toolsmanager.yuozarseiph.top");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const [cornerStyle, setCornerStyle] = useState<CornerStyle>("square");
  const [qrMargin, setQrMargin] = useState(4);

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.2);

  // تغییر نوع ref
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setLogoDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadQr = async () => {
    // پیدا کردن SVG از داخل container
    const svgElement = qrContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    // تبدیل به canvas با سایز واقعی
    const canvas = document.createElement("canvas");
    const finalSize = size + qrMargin * 2;
    canvas.width = finalSize;
    canvas.height = finalSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const img = new Image();
    img.onload = async () => {
      // پس‌زمینه
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, finalSize, finalSize);

      // رسم QR
      ctx.drawImage(img, qrMargin, qrMargin, size, size);

      // اگه لوگو داریم
      if (logoDataUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = size * logoScale;
          const logoX = (finalSize - logoSize) / 2;
          const logoY = (finalSize - logoSize) / 2;

          // پس‌زمینه لوگو
          ctx.fillStyle = bgColor;
          const padding = 8;
          ctx.beginPath();
          ctx.roundRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2,
            12
          );
          ctx.fill();

          // رسم لوگو
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          // دانلود
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `qrcode-${Date.now()}.png`;
          a.click();
        };
        logoImg.src = logoDataUrl;
      } else {
        // دانلود بدون لوگو
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `qrcode-${Date.now()}.png`;
        a.click();
      }
    };
    img.src =
      "data:image/svg+xml;base64," +
      window.btoa(unescape(encodeURIComponent(svgString)));
  };

  const svgStyle =
    cornerStyle === "rounded"
      ? { borderRadius: 24, overflow: "hidden" as const }
      : {};

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* تنظیمات */}
      <div
        className={`space-y-6 p-6 rounded-3xl border ${theme.card} ${theme.border}`}
      >
        {/* متن / URL */}
        <div className="space-y-2">
          <label className="font-bold flex items-center gap-2">
            <LinkIcon size={18} /> {content.ui.input.label}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full p-4 rounded-xl border h-32 resize-none focus:outline-none focus:ring-2 ring-blue-500/50 ${theme.bg} ${theme.border}`}
            placeholder={content.ui.input.placeholder}
          />
        </div>

        {/* رنگ‌ها */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">
              {content.ui.colors.fgLabel}
            </label>
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}
            >
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs font-mono">{fgColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">
              {content.ui.colors.bgLabel}
            </label>
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}
            >
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs font-mono">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* سایز و مارجین */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-bold">{content.ui.size.label}</label>
              <span>
                {size}
                {content.ui.size.unit}
              </span>
            </div>
            <input
              type="range"
              min="128"
              max="1024"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-bold flex items-center gap-1">
                <Sliders size={14} />
                {content.ui.margin.label}
              </label>
              <span>
                {qrMargin}
                {content.ui.margin.unit}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              step={1}
              value={qrMargin}
              onChange={(e) => setQrMargin(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg accent-blue-600"
            />
          </div>
        </div>

        {/* استایل گوشه‌ها */}
        <div className="space-y-2">
          <label className="text-sm font-bold">
            {content.ui.corners.label}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCornerStyle("square")}
              className={`px-3 py-1 rounded-lg text-sm border ${
                cornerStyle === "square"
                  ? "bg-blue-600 text-white border-blue-600"
                  : theme.bg + " " + theme.border
              }`}
            >
              {content.ui.corners.square}
            </button>
            <button
              type="button"
              onClick={() => setCornerStyle("rounded")}
              className={`px-3 py-1 rounded-lg text-sm border ${
                cornerStyle === "rounded"
                  ? "bg-blue-600 text-white border-blue-600"
                  : theme.bg + " " + theme.border
              }`}
            >
              {content.ui.corners.rounded}
            </button>
          </div>
        </div>

        {/* لوگو */}
        <div className="space-y-3">
          <label className="text-sm font-bold flex items-center gap-2">
            <ImageIcon size={16} />
            {content.ui.logo.label}
          </label>
          <div className="flex items-center gap-3">
            <label
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${theme.bg} ${theme.border}`}
            >
              <ImageIcon size={16} />
              {content.ui.logo.selectButton}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
            {logoDataUrl && (
              <button
                type="button"
                onClick={() => setLogoDataUrl(null)}
                className="text-xs text-red-500"
              >
                {content.ui.logo.removeButton}
              </button>
            )}
          </div>

          {logoDataUrl && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{content.ui.logo.sizeLabel}</span>
                <span>
                  {Math.round(logoScale * 100)}
                  {content.ui.logo.sizeUnit}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.4}
                step={0.02}
                value={logoScale}
                onChange={(e) => setLogoScale(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg accent-blue-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-3xl border ${theme.bg} ${theme.border}`}
      >
        <div className="p-4 bg-white rounded-xl shadow-2xl mb-8">
          <div
            ref={qrContainerRef}
            style={{
              position: "relative",
              width: 300,
              height: 300,
            }}
          >
            <QRCode
              value={text || " "}
              size={300}
              bgColor={bgColor}
              fgColor={fgColor}
              style={svgStyle}
              level="H"
            />
            {logoDataUrl && (
              <img
                src={logoDataUrl}
                alt="Logo"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: `${logoScale * 100}%`,
                  height: `${logoScale * 100}%`,
                  objectFit: "contain",
                  borderRadius: 12,
                  backgroundColor: bgColor,
                  padding: 4,
                }}
              />
            )}
          </div>
        </div>

        <button
          onClick={downloadQr}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform ${theme.primary}`}
        >
          <Download size={20} />
          {content.ui.buttons.downloadPng}
        </button>
      </div>
    </div>
  );
}
