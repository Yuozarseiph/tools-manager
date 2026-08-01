"use client";

import { useState, useRef, ChangeEvent, useEffect, useCallback } from "react";
import {
  Download,
  Link as LinkIcon,
  Mail,
  Wifi,
  Type,
  Image as ImageIcon,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import QRCodeStyling from "qr-code-styling";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useQrGeneratorContent } from "./qr-generator.content";

type QrContentType = "link" | "text" | "wifi" | "email";
type DotStyle = "square" | "dots" | "rounded" | "classy" | "extraRounded";
type CornerStyle = "square" | "dot" | "extraRounded";

export default function QrGeneratorTool() {
  const theme = useThemeColors();
  const content = useQrGeneratorContent();

  // Content Type
  const [contentType, setContentType] = useState<QrContentType>("link");
  const [linkUrl, setLinkUrl] = useState(
    "https://toolsmanager.yuozarseiph.top",
  );
  const [plainText, setPlainText] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Styling
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [quietZone, setQuietZone] = useState(30);
  const [size, setSize] = useState(800);
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [cornerStyle, setCornerStyle] = useState<CornerStyle>("extraRounded");

  // Logo
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.2);

  // Mobile UI State
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // QR Preview Size (responsive)
  const [qrPreviewSize, setQrPreviewSize] = useState(250);

  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // Calculate responsive QR size
  useEffect(() => {
    const updateQrSize = () => {
      if (qrWrapperRef.current) {
        const wrapperWidth = qrWrapperRef.current.offsetWidth;
        // QR size = wrapper width minus padding (24px each side = 48px total)
        const newSize = Math.min(Math.max(wrapperWidth - 48, 150), 280);
        setQrPreviewSize(newSize);
      }
    };

    updateQrSize();
    window.addEventListener("resize", updateQrSize);

    // Small delay to ensure proper measurement after mount
    const timeout = setTimeout(updateQrSize, 100);

    return () => {
      window.removeEventListener("resize", updateQrSize);
      clearTimeout(timeout);
    };
  }, []);

  const getQrValue = useCallback(() => {
    switch (contentType) {
      case "link":
        return linkUrl || "https://toolsmanager.yuozarseiph.top";
      case "text":
        return plainText || " ";
      case "wifi":
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
      case "email":
        return `mailto:${emailAddress}?subject=${encodeURIComponent(
          emailSubject,
        )}&body=${encodeURIComponent(emailBody)}`;
      default:
        return linkUrl || "https://toolsmanager.yuozarseiph.top";
    }
  }, [
    contentType,
    linkUrl,
    plainText,
    wifiEncryption,
    wifiSsid,
    wifiPassword,
    emailAddress,
    emailSubject,
    emailBody,
  ]);

  const getDotStyleValue = useCallback(() => {
    switch (dotStyle) {
      case "square":
        return "square";
      case "dots":
        return "dots";
      case "rounded":
        return "rounded";
      case "classy":
        return "classy";
      case "extraRounded":
        return "extra-rounded";
      default:
        return "rounded";
    }
  }, [dotStyle]);

  const getCornerStyleValue = useCallback(() => {
    switch (cornerStyle) {
      case "square":
        return "square";
      case "dot":
        return "dot";
      case "extraRounded":
        return "extra-rounded";
      default:
        return "extra-rounded";
    }
  }, [cornerStyle]);

  // Create/Update QR Code
  useEffect(() => {
    if (!qrContainerRef.current || qrPreviewSize <= 0) return;

    const qrCode = new QRCodeStyling({
      width: qrPreviewSize,
      height: qrPreviewSize,
      data: getQrValue(),
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: logoScale,
        margin: 8,
        crossOrigin: "anonymous",
      },
      dotsOptions: {
        color: fgColor,
        type: getDotStyleValue() as any,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: getCornerStyleValue() as any,
      },
      cornersDotOptions: {
        color: fgColor,
        type: getCornerStyleValue() as any,
      },
      image: logoDataUrl || undefined,
    });

    qrCodeRef.current = qrCode;

    qrContainerRef.current.innerHTML = "";
    qrCode.append(qrContainerRef.current);

    return () => {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = "";
      }
    };
  }, [
    qrPreviewSize,
    getQrValue,
    getDotStyleValue,
    getCornerStyleValue,
    fgColor,
    bgColor,
    logoDataUrl,
    logoScale,
  ]);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(content.logo.errorSize);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setLogoDataUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadQr = async (format: "png" | "svg") => {
    if (!qrCodeRef.current) return;

    try {
      const finalSize = size + quietZone * 2;

      qrCodeRef.current.update({
        width: finalSize,
        height: finalSize,
        margin: quietZone,
      });

      if (format === "png") {
        await qrCodeRef.current.download({
          name: `qrcode-${Date.now()}`,
          extension: "png",
        });
      } else {
        await qrCodeRef.current.download({
          name: `qrcode-${Date.now()}`,
          extension: "svg",
        });
      }

      // Restore preview size
      qrCodeRef.current.update({
        width: qrPreviewSize,
        height: qrPreviewSize,
        margin: 0,
      });
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const contentTypeIcons = {
    link: <LinkIcon size={16} />,
    text: <Type size={16} />,
    wifi: <Wifi size={16} />,
    email: <Mail size={16} />,
  };

  const dotStyleOptions: DotStyle[] = [
    "square",
    "dots",
    "rounded",
    "classy",
    "extraRounded",
  ];
  const cornerStyleOptions: CornerStyle[] = ["square", "dot", "extraRounded"];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Mobile: Preview First */}
      <div className="order-1 lg:order-2 space-y-4 lg:space-y-6">
        {/* Preview Card */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border ${theme.card} ${theme.border}`}
        >
          <h3
            className={`font-bold mb-4 text-center text-sm sm:text-base ${theme.text}`}
          >
            {content.preview.title}
          </h3>

          {/* QR Code Wrapper - Responsive */}
          <div ref={qrWrapperRef} className="flex justify-center mb-4">
            <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg inline-block">
              <div
                ref={qrContainerRef}
                style={{
                  width: qrPreviewSize,
                  height: qrPreviewSize,
                  minWidth: qrPreviewSize,
                  minHeight: qrPreviewSize,
                }}
              />
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => downloadQr("png")}
              className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base ${theme.primary} text-white shadow-lg hover:shadow-xl transition-all active:scale-95`}
            >
              <Download size={18} />
              {content.buttons.downloadPng}
            </button>
            <button
              onClick={() => downloadQr("svg")}
              className={`flex-1 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base ${theme.secondary} ${theme.text} shadow-lg hover:shadow-xl transition-all active:scale-95`}
            >
              <Download size={18} />
              {content.buttons.downloadSvg}
            </button>
          </div>

          <p className={`text-xs text-center mt-3 ${theme.textMuted}`}>
            {content.preview.note}
          </p>
        </div>

        {/* Quick Tips - Desktop only */}
        <div
          className={`hidden lg:block p-6 rounded-2xl border border-[var(--app-accent)]/30 bg-[var(--app-secondary-bg)]`}
        >
          <h4
            className={`font-bold mb-3 flex items-center gap-2 ${theme.text}`}
          >
            <Settings size={16} />
            {content.tips.title}
          </h4>
          <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip2}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip3}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip4}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="order-2 lg:order-1 space-y-4 lg:space-y-6">
        {/* Content Type Selection */}
        <div
          className={`p-4 sm:p-6 rounded-2xl border ${theme.card} ${theme.border}`}
        >
          <h3
            className={`font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${theme.text}`}
          >
            <Type size={18} />
            {content.contentTypes.title}
          </h3>

          {/* Content Type Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
            {(["link", "text", "wifi", "email"] as QrContentType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    contentType === type
                      ? `${theme.primary} text-white`
                      : `${theme.bg} ${theme.text} border ${theme.border}`
                  }`}
                >
                  {contentTypeIcons[type]}
                  <span className="truncate">{content.contentTypes[type]}</span>
                </button>
              ),
            )}
          </div>

          {/* Dynamic Content Input */}
          {contentType === "link" && (
            <div className="space-y-2">
              <label className={`text-xs sm:text-sm font-medium ${theme.text}`}>
                {content.inputs.link.label}
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={content.inputs.link.placeholder}
                className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
              />
            </div>
          )}

          {contentType === "text" && (
            <div className="space-y-2">
              <label className={`text-xs sm:text-sm font-medium ${theme.text}`}>
                {content.inputs.text.label}
              </label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={3}
                placeholder={content.inputs.text.placeholder}
                className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm resize-none ${theme.border} ${theme.bg} ${theme.text}`}
              />
            </div>
          )}

          {contentType === "wifi" && (
            <div className="space-y-2 sm:space-y-3">
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.wifi.ssid.label}
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder={content.inputs.wifi.ssid.placeholder}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.wifi.password.label}
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder={content.inputs.wifi.password.placeholder}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.wifi.encryption.label}
                </label>
                <select
                  value={wifiEncryption}
                  onChange={(e) => setWifiEncryption(e.target.value)}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
                >
                  <option value="WPA">
                    {content.inputs.wifi.encryption.wpa}
                  </option>
                  <option value="WEP">
                    {content.inputs.wifi.encryption.wep}
                  </option>
                  <option value="nopass">
                    {content.inputs.wifi.encryption.nopass}
                  </option>
                </select>
              </div>
            </div>
          )}

          {contentType === "email" && (
            <div className="space-y-2 sm:space-y-3">
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.email.address.label}
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder={content.inputs.email.address.placeholder}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.email.subject.label}
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder={content.inputs.email.subject.placeholder}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm ${theme.border} ${theme.bg} ${theme.text}`}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.inputs.email.body.label}
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={2}
                  placeholder={content.inputs.email.body.placeholder}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border text-sm resize-none ${theme.border} ${theme.bg} ${theme.text}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Advanced Settings Toggle (Mobile) */}
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className={`w-full lg:hidden p-3 sm:p-4 rounded-2xl border flex items-center justify-between ${theme.card} ${theme.border} ${theme.text}`}
        >
          <span className="flex items-center gap-2 font-medium text-sm sm:text-base">
            <Settings size={18} />
            تنظیمات پیشرفته
          </span>
          {showAdvancedSettings ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {/* Style & Colors - Collapsible on mobile */}
        <div
          className={`${
            showAdvancedSettings ? "block" : "hidden"
          } lg:block space-y-4 lg:space-y-6`}
        >
          <div
            className={`p-4 sm:p-6 rounded-2xl border ${theme.card} ${theme.border}`}
          >
            <h3
              className={`font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${theme.text}`}
            >
              <Palette size={18} />
              {content.styling.title}
            </h3>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="space-y-2">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.styling.fgColor}
                </label>
                <div
                  className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}
                >
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span
                    className={`text-[10px] sm:text-xs font-mono ${theme.text}`}
                  >
                    {fgColor}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className={`text-xs sm:text-sm font-medium ${theme.text}`}
                >
                  {content.styling.bgColor}
                </label>
                <div
                  className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}
                >
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span
                    className={`text-[10px] sm:text-xs font-mono ${theme.text}`}
                  >
                    {bgColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Quiet Zone */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <label className={`font-medium ${theme.text}`}>
                  {content.styling.quietZone.label}
                </label>
                <span className={theme.text}>
                  {quietZone}
                  {content.styling.quietZone.unit}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={quietZone}
                onChange={(e) => setQuietZone(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg accent-[var(--app-accent)]"
              />
              <p className={`text-[10px] sm:text-xs ${theme.textMuted}`}>
                {content.styling.quietZone.hint}
              </p>
            </div>

            {/* Output Size */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <label className={`font-medium ${theme.text}`}>
                  {content.styling.size.label}
                </label>
                <span className={theme.text}>
                  {size}
                  {content.styling.size.unit}
                </span>
              </div>
              <input
                type="range"
                min="256"
                max="2048"
                step="128"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg accent-[var(--app-accent)]"
              />
            </div>

            {/* Dot Style - Horizontal scroll on mobile */}
            <div className="space-y-2 mb-4">
              <label className={`text-xs sm:text-sm font-medium ${theme.text}`}>
                {content.styling.dotStyle.label}
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
                {dotStyleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => setDotStyle(style)}
                    className={`flex-shrink-0 py-2 px-3 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      dotStyle === style
                        ? `${theme.primary} text-white`
                        : `${theme.bg} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {content.styling.dotStyle[style]}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Style */}
            <div className="space-y-2">
              <label className={`text-xs sm:text-sm font-medium ${theme.text}`}>
                {content.styling.cornerStyle.label}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {cornerStyleOptions.map((style) => (
                  <button
                    key={style}
                    onClick={() => setCornerStyle(style)}
                    className={`py-2 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                      cornerStyle === style
                        ? `${theme.primary} text-white`
                        : `${theme.bg} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {content.styling.cornerStyle[style]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div
            className={`p-4 sm:p-6 rounded-2xl border ${theme.card} ${theme.border}`}
          >
            <h3
              className={`font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base ${theme.text}`}
            >
              <ImageIcon size={18} />
              {content.logo.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <label
                className={`cursor-pointer px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-2 ${theme.bg} ${theme.border} ${theme.text} hover:opacity-80 transition-opacity`}
              >
                <ImageIcon size={16} />
                {content.logo.selectButton}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setLogoDataUrl(null)}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-600"
                >
                  {content.logo.removeButton}
                </button>
              )}
            </div>

            <p className={`text-[10px] sm:text-xs mb-3 ${theme.textMuted}`}>
              {content.logo.hint}
            </p>

            {logoDataUrl && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={theme.text}>{content.logo.sizeLabel}</span>
                  <span className={theme.text}>
                    {Math.round(logoScale * 100)}
                    {content.logo.sizeUnit}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.4}
                  step={0.02}
                  value={logoScale}
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg accent-[var(--app-accent)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tips */}
        <div
          className={`lg:hidden p-3 sm:p-4 rounded-2xl border border-[var(--app-accent)]/30 bg-[var(--app-secondary-bg)]`}
        >
          <h4
            className={`font-bold mb-2 flex items-center gap-2 text-xs sm:text-sm ${theme.text}`}
          >
            <Settings size={14} />
            {content.tips.title}
          </h4>
          <ul className={`space-y-1 text-[10px] sm:text-xs ${theme.textMuted}`}>
            <li className="flex items-start gap-1.5">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip1}</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[var(--app-accent)] flex-shrink-0">•</span>
              <span>{content.tips.tip2}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
