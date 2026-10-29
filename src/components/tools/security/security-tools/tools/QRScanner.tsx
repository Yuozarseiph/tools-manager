"use client";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import { useState, useRef, useEffect } from "react";
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
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const sessionRef = useRef(0);
  const mountedRef = useRef(true);
  const [cameraError, setCameraError] = useState("");

  const stopStream = () => {
    activeRef.current = false;
    sessionRef.current += 1;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; stopStream(); };
  }, []);


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

  const stopCamera = () => {
    stopStream();
    if (mountedRef.current) setScanning(false);
  };

  const scanFromCamera = () => {
    const scan = () => {
      if (!activeRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      if (video && canvas && ctx && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(data.data, data.width, data.height);
          if (code) {
            setResult(code.data);
            stopCamera();
            return;
          }
        } catch {
          setCameraError(content.qrScanner.cameraError);
          stopCamera();
          return;
        }
      }
      frameRef.current = requestAnimationFrame(scan);
    };
    frameRef.current = requestAnimationFrame(scan);
  };

  const startCamera = async () => {
    if (activeRef.current) return;
    activeRef.current = true;
    const session = ++sessionRef.current;
    setCameraError("");
    setScanning(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("No camera API");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (!activeRef.current || !mountedRef.current || sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera preview unavailable");
      video.srcObject = stream;
      await video.play();
      if (!activeRef.current || !mountedRef.current || sessionRef.current !== session) return;
      scanFromCamera();
    } catch {
      if (!mountedRef.current || sessionRef.current !== session) return;
      setCameraError(content.qrScanner.cameraError);
      stopCamera();
    }
  };

  const copyResult = () => {
    void navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => setCopied(false));
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
            scanning ? "bg-red-700 text-white" : theme.secondary
          }`}
        >
          <Camera size={20} />
          {scanning ? content.qrScanner.stopCamera : content.qrScanner.useCamera}
        </button>
      </div>

      <AccessibleInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      {cameraError && <p role="alert" className="text-sm text-[var(--app-error-text)]">{cameraError}</p>}

      {/* Camera Preview */}
      <div
          className={`relative rounded-xl overflow-hidden border ${theme.border} ${scanning ? "" : "hidden"}`}
        >
          <video ref={videoRef} className="w-full" playsInline muted autoPlay={false} />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-4 border-[var(--app-accent)] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/50"></div>
          </div>
        </div>

      {/* Result */}
      {result && (
        <div role="status" aria-live="polite" className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
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
