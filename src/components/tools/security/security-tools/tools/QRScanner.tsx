"use client";

import { useState, useRef } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Upload, Camera, Copy, Check } from "lucide-react";
import jsQR from "jsqr";

export default function QRScanner() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [result, setResult] = useState("");
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setResult(code.data);
        } else {
          setResult(content.qrScanner.noResult);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanFromCamera();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
    }
  };

  const scanFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const scan = () => {
      if (!scanning) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setResult(code.data);
        stopCamera();
      } else {
        requestAnimationFrame(scan);
      }
    };

    scan();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Camera Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold ${theme.primary} text-white`}
        >
          <Upload size={20} />
          {content.qrScanner.uploadImage}
        </button>
        <button
          onClick={scanning ? stopCamera : startCamera}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold ${
            scanning ? "bg-red-500" : theme.secondary
          } text-white`}
        >
          <Camera size={20} />
          {scanning ? "متوقف کردن" : content.qrScanner.useCamera}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Preview */}
      {scanning && (
        <div
          className={`relative rounded-xl overflow-hidden border ${theme.border}`}
        >
          <video ref={videoRef} className="w-full" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/50"></div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-bold ${theme.text}`}>
              {content.qrScanner.result}
            </h3>
            <button
              onClick={copyResult}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? content.common.copied : content.common.copy}
            </button>
          </div>
          <p
            className={`p-3 rounded-lg ${theme.secondary} ${theme.text} break-all`}
          >
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
