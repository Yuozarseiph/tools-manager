"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import download from "downloadjs";

import {
  FileUp,
  Trash2,
  Video,
  Music,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useAudioExtractorContent,
  type AudioExtractorToolContent,
} from "./audio-extractor.content";

type AudioFormat = "mp3" | "wav" | "ogg" | "m4a";

export default function AudioExtractorTool() {
  const theme = useThemeColors();
  const content: AudioExtractorToolContent = useAudioExtractorContent();

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("high");
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedAudio, setExtractedAudio] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState("");

  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    if (typeof window === "undefined") return;

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ffmpeg = new FFmpeg();

      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      ffmpeg.on("progress", ({ progress: prog }) => {
        setProgress(Math.round(prog * 100));
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      ffmpegRef.current = ffmpeg;
      setIsFFmpegLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError("خطا در بارگذاری FFmpeg");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const videoFile = acceptedFiles[0];
        setFile(videoFile);
        setExtractedAudio(null);
        setError("");

        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const mins = Math.floor(video.duration / 60);
          const secs = Math.floor(video.duration % 60);
          setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(videoFile);
      }
    },
  });

  const getBitrate = () => {
    const bitrates = {
      mp3: { low: "128k", medium: "192k", high: "320k" },
      wav: { low: "128k", medium: "192k", high: "320k" },
      ogg: { low: "128k", medium: "192k", high: "256k" },
      m4a: { low: "128k", medium: "192k", high: "256k" },
    };
    return bitrates[format][quality];
  };

const handleExtract = async () => {
  if (!file || !isFFmpegLoaded || !ffmpegRef.current) return;

  setIsProcessing(true);
  setProgress(0);
  setError("");
  setExtractedAudio(null);

  const ffmpeg = ffmpegRef.current;

  try {
    const inputName = "input.mp4";
    const outputName = `output.${format}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const bitrate = getBitrate();
    const args = ["-i", inputName];

    if (format === "mp3") {
      args.push("-vn", "-acodec", "libmp3lame", "-ab", bitrate, outputName);
    } else if (format === "wav") {
      args.push("-vn", "-acodec", "pcm_s16le", outputName);
    } else if (format === "ogg") {
      args.push("-vn", "-acodec", "libvorbis", "-ab", bitrate, outputName);
    } else if (format === "m4a") {
      args.push("-vn", "-acodec", "aac", "-ab", bitrate, outputName);
    }

    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    // کپی کردن به یک Uint8Array استاندارد جدید
    const uint8 = new Uint8Array(data.length);
    uint8.set(data as Uint8Array);
    const blob = new Blob([uint8], { type: `audio/${format}` });
    setExtractedAudio(blob);
  } catch (err) {
    console.error("Extraction error:", err);
    setError(content.ui.status.error);
  } finally {
    setIsProcessing(false);
    setProgress(0);
  }
};


  const handleDownload = () => {
    if (!extractedAudio || !file) return;
    const fileName = file.name.replace(/\.[^/.]+$/, "") + `.${format}`;
    download(extractedAudio, fileName, `audio/${format}`);
  };

  const handleClear = () => {
    setFile(null);
    setExtractedAudio(null);
    setError("");
    setProgress(0);
    setDuration("");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formats = [
    {
      value: "mp3" as const,
      label: content.ui.formats.mp3,
      desc: content.ui.formats.mp3Desc,
    },
    {
      value: "wav" as const,
      label: content.ui.formats.wav,
      desc: content.ui.formats.wavDesc,
    },
    {
      value: "ogg" as const,
      label: content.ui.formats.ogg,
      desc: content.ui.formats.oggDesc,
    },
    {
      value: "m4a" as const,
      label: content.ui.formats.m4a,
      desc: content.ui.formats.m4aDesc,
    },
  ];

  return (
    <div
      className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}
    >
      {!isFFmpegLoaded && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${theme.note.infoBorder} ${theme.note.infoBg}`}
        >
          <Loader2
            className={`animate-spin ${theme.note.infoText}`}
            size={20}
          />
          <p className={`text-sm ${theme.note.infoText}`}>
            {content.ui.status.loading}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? "border-blue-500 scale-[0.99] bg-blue-50 dark:bg-blue-950/20"
                  : `${theme.border} hover:border-blue-400`
              }
              ${theme.bg}
              ${!isFFmpegLoaded ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`p-4 rounded-full ${
                    theme.secondary
                  } transition-transform ${isDragActive ? "scale-110" : ""}`}
                >
                  <FileUp size={32} className={theme.accent} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${theme.text}`}>
                    {content.ui.upload.dropTitle}
                  </p>
                  <p className={`text-sm mt-1 ${theme.textMuted}`}>
                    {content.ui.upload.dropSubtitle}
                  </p>
                  <p className={`text-xs mt-2 ${theme.textMuted}`}>
                    {content.ui.upload.supportedFormats}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* هشدار پردازش */}
            {!isProcessing && !extractedAudio && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border ${theme.note.warningBorder} ${theme.note.warningBg}`}
              >
                <AlertTriangle
                  className={`flex-shrink-0 ${theme.note.warningText}`}
                  size={20}
                />
                <div className={`text-sm ${theme.note.warningText}`}>
                  <p className="font-bold mb-1">{content.ui.warning.title}</p>
                  <p>{content.ui.warning.description}</p>
                </div>
              </div>
            )}

            {/* اطلاعات فایل */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${theme.secondary}`}>
                  <Video size={24} className={theme.accent} />
                </div>
                <div>
                  <p className={`font-bold ${theme.text}`}>{file.name}</p>
                  <div className={`text-xs ${theme.textMuted} space-y-1`}>
                    <p>
                      {content.ui.fileInfo.fileSize} {formatSize(file.size)}
                    </p>
                    {duration && (
                      <p>
                        {content.ui.fileInfo.duration} {duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                disabled={isProcessing}
                className={`p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50`}
                title={content.ui.buttons.clear}
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* انتخاب فرمت */}
            <div className="space-y-3">
              <label className={`text-sm font-bold ${theme.text}`}>
                {content.ui.formats.title}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formats.map((fmt) => (
                  <button
                    key={fmt.value}
                    type="button"
                    onClick={() => setFormat(fmt.value)}
                    disabled={isProcessing}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border text-center disabled:opacity-50
                      ${
                        format === fmt.value
                          ? `${theme.primary} border-transparent shadow-lg`
                          : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                      }`}
                  >
                    <div className="font-bold">{fmt.label}</div>
                    <div className="text-xs opacity-70 mt-1">{fmt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* کیفیت */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-bold ${theme.text}`}>
                  {content.ui.quality.title}
                </label>
                <span className={`text-sm ${theme.accent}`}>
                  {content.ui.quality.bitrate} {getBitrate()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(["low", "medium", "high"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    disabled={isProcessing}
                    className={`p-2 rounded-lg text-sm font-medium transition-all border disabled:opacity-50
                      ${
                        quality === q
                          ? `${theme.primary} border-transparent`
                          : `${theme.bg} ${theme.border} ${theme.text}`
                      }`}
                  >
                    {content.ui.quality[q]}
                  </button>
                ))}
              </div>
            </div>

            {/* پیشرفت */}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={theme.text}>
                    {content.ui.status.processing}
                  </span>
                  <span className={theme.accent}>{progress}%</span>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${theme.bg}`}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg border ${theme.note.infoBorder} ${theme.note.infoBg}`}
                >
                  <Info
                    className={`flex-shrink-0 ${theme.note.infoText}`}
                    size={16}
                  />
                  <p className={`text-xs ${theme.note.infoText}`}>
                    {content.ui.processing.patience}
                  </p>
                </div>
              </div>
            )}

            {/* خطا */}
            {error && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border ${theme.note.errorBorder} ${theme.note.errorBg}`}
              >
                <XCircle className={theme.note.errorText} size={20} />
                <p className={`text-sm ${theme.note.errorText}`}>{error}</p>
              </div>
            )}

            {/* موفقیت */}
            {extractedAudio && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border ${theme.note.infoBorder} ${theme.note.infoBg}`}
              >
                <CheckCircle className={theme.note.infoText} size={20} />
                <p className={`text-sm ${theme.note.infoText}`}>
                  {content.ui.status.completed}
                </p>
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="space-y-3">
              {!extractedAudio ? (
                <button
                  onClick={handleExtract}
                  disabled={isProcessing || !isFFmpegLoaded}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {content.ui.buttons.extracting}
                    </>
                  ) : (
                    <>
                      <Music size={20} />
                      {content.ui.buttons.extract}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary}`}
                >
                  <Download size={20} />
                  {content.ui.buttons.download}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
