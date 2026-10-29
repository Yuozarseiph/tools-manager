"use client";
import { saveFile } from "@/lib/file-export";
import { outputFilename } from "@/lib/output-name";
import { AccessibleInput, AccessibleSelect } from "@/components/ui/AccessibleControls";

import { useState, useEffect, useRef } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Download } from "lucide-react";
import JsBarcode from "jsbarcode";

export default function BarcodeGenerator() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [text, setText] = useState("1234567890128");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [width, setWidth] = useState("2");
  const [height, setHeight] = useState("100");
  const [displayValue, setDisplayValue] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [lineColor, setLineColor] = useState("#000000");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateBarcode();
  }, [
    text,
    barcodeType,
    width,
    height,
    displayValue,
    backgroundColor,
    lineColor,
  ]);

  const generateBarcode = () => {
    if (!canvasRef.current || !text) return;

    try {
      JsBarcode(canvasRef.current, text, {
        format: barcodeType,
        width: parseInt(width),
        height: parseInt(height),
        displayValue: displayValue,
        background: backgroundColor,
        lineColor: lineColor,
      });
    } catch (err) {
      console.error("Barcode generation error:", err);
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = outputFilename(`barcode-${Date.now()}.png`);
    link.href = canvasRef.current.toDataURL();
    void saveFile(link.href, link.download);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.barcodeGenerator.inputText}
        </label>
        <AccessibleInput fieldLabel={content.barcodeGenerator.inputText}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
        />
      </div>

      {/* Type Selection */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.barcodeGenerator.barcodeType}
        </label>
        <AccessibleSelect fieldLabel={content.barcodeGenerator.barcodeType}
          value={barcodeType}
          onChange={(e) => setBarcodeType(e.target.value)}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
        >
          {Object.entries(content.barcodeGenerator.types).map(
            ([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            )
          )}
        </AccessibleSelect>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.barcodeGenerator.width}
          </label>
          <AccessibleInput fieldLabel={content.barcodeGenerator.width}
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            min="1"
            max="5"
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.barcodeGenerator.height}
          </label>
          <AccessibleInput fieldLabel={content.barcodeGenerator.height}
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            min="50"
            max="200"
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.barcodeGenerator.backgroundColor}
          </label>
          <AccessibleInput fieldLabel={content.barcodeGenerator.backgroundColor}
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className={`w-full h-12 rounded-xl border ${theme.border} cursor-pointer`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.barcodeGenerator.lineColor}
          </label>
          <AccessibleInput fieldLabel={content.barcodeGenerator.lineColor}
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className={`w-full h-12 rounded-xl border ${theme.border} cursor-pointer`}
          />
        </div>
      </div>

      {/* Display Value Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <AccessibleInput hasVisibleLabel
          type="checkbox"
          checked={displayValue}
          onChange={(e) => setDisplayValue(e.target.checked)}
          className="w-5 h-5"
        />
        <span className={theme.text}>
          {content.barcodeGenerator.displayValue}
        </span>
      </label>

      {/* Barcode Preview */}
      <div
        className={`p-6 rounded-xl border ${theme.border} ${theme.bg} flex flex-col items-center gap-4`}
      >
        <canvas ref={canvasRef} />
        <button data-testid="download-result"
          onClick={downloadBarcode}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${theme.primary} text-white`}
        >
          <Download size={20} />
          {content.common.download}
        </button>
      </div>
    </div>
  );
}
