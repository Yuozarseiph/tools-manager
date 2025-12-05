"use client";

import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Clock,
  RotateCcw,
  Download,
  Waves,
} from "lucide-react";
import {
  fileToAudioBuffer,
  trimAudioBuffer,
  audioBufferToWavBlob,
  applyFadeIn,
  applyFadeOut,
} from "@/utils/audio-actions";

export default function AudioTrimTool() {
  const theme = useThemeColors();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  const [fadeInEnabled, setFadeInEnabled] = useState(false);
  const [fadeOutEnabled, setFadeOutEnabled] = useState(false);
  const [fadeInDuration, setFadeInDuration] = useState(0.5);
  const [fadeOutDuration, setFadeOutDuration] = useState(0.5);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);
    setDuration(0);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    setIsPlaying(false);
    setOriginalBuffer(null);
    setFadeInEnabled(false);
    setFadeOutEnabled(false);

    try {
      const buffer = await fileToAudioBuffer(file);
      setOriginalBuffer(buffer);
      setDuration(buffer.duration);
      setStartTime(0);
      setEndTime(buffer.duration);
    } catch (err) {
      console.error("Error decoding audio file", err);
      alert("خطا در پردازش فایل صوتی.");
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current || originalBuffer) return;
    const d = audioRef.current.duration || 0;
    setDuration(d);
    setStartTime(0);
    setEndTime(d);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);

    if (t >= endTime && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = endTime;
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playSelectedRange = () => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const resetSelection = () => {
    setStartTime(0);
    setEndTime(duration);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const formatTime = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const selectionDuration =
    endTime > startTime ? endTime - startTime : 0;

  const disableControls = !audioUrl;

  const handleDownloadSelection = async () => {
    if (!originalBuffer || !selectionDuration) return;

    try {
      setIsExporting(true);

      const trimmed = trimAudioBuffer(
        originalBuffer,
        startTime,
        endTime
      );

      const maxFade = trimmed.duration / 2 || 0.001;

      if (fadeInEnabled && fadeInDuration > 0) {
        applyFadeIn(trimmed, Math.min(fadeInDuration, maxFade));
      }
      if (fadeOutEnabled && fadeOutDuration > 0) {
        applyFadeOut(trimmed, Math.min(fadeOutDuration, maxFade));
      }

      const blob = audioBufferToWavBlob(trimmed);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const baseName =
        fileName.replace(/\.[^/.]+$/, "") || "audio";
      a.download = `${baseName}-trimmed.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting trimmed audio", err);
      alert("خطا در ساخت فایل خروجی.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleStartInputChange = (value: string) => {
    if (!duration) return;
    let v = Number(value.replace(",", "."));
    if (Number.isNaN(v) || v < 0) v = 0;
    if (v > endTime) v = endTime;
    setStartTime(v);
    if (audioRef.current && currentTime < v) {
      audioRef.current.currentTime = v;
      setCurrentTime(v);
    }
  };

  const handleEndInputChange = (value: string) => {
    if (!duration) return;
    let v = Number(value.replace(",", "."));
    if (Number.isNaN(v) || v < startTime) v = startTime;
    if (v > duration) v = duration;
    setEndTime(v);
    if (audioRef.current && currentTime > v) {
      audioRef.current.currentTime = v;
      setCurrentTime(v);
    }
  };

  const clampFade = (v: number) => {
    if (!selectionDuration) return 0.1;
    if (v < 0.1) return 0.1;
    if (v > selectionDuration) return selectionDuration;
    return v;
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${theme.bg} ${theme.border}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme.secondary}`}>
            <Upload size={18} className={theme.accent} />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme.text}`}>
              انتخاب فایل صوتی
            </p>
            <p className={`text-xs ${theme.textMuted}`}>
              فرمت‌های رایج مانند MP3, WAV, OGG پشتیبانی می‌شوند. فایل فقط روی
              دستگاه شما پردازش می‌شود.
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme.primary}`}
        >
          <Upload size={16} />
          انتخاب فایل
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {audioUrl ? (
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${theme.bg} ${theme.border}`}
          >
            <div className="truncate max-w-[65%]">
              <p className={`text-sm font-semibold truncate ${theme.text}`}>
                {fileName}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                مدت کل: {formatTime(duration)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg ${theme.secondary}`}
              >
                <Clock size={12} className={theme.accent} />
                <span className={theme.text}>
                  موقعیت فعلی: {formatTime(currentTime)}
                </span>
              </div>
              <span className={theme.textMuted}>
                بازه انتخابی: {formatTime(selectionDuration)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCurrentTime(v);
                if (audioRef.current) audioRef.current.currentTime = v;
              }}
              disabled={disableControls}
              className="w-full"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={disableControls}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${
                    disableControls
                      ? "opacity-50 cursor-not-allowed"
                      : `${theme.primary}`
                  }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "توقف" : "پخش کل فایل"}
              </button>

              <p className={`text-xs ${theme.textMuted}`}>
                برای گوش‌دادن به کل فایل از این دکمه استفاده کنید.
              </p>
            </div>
          </div>

          <div
            className={`mt-4 rounded-xl border p-4 space-y-4 ${theme.bg} ${theme.border}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Scissors size={16} className={theme.accent} />
                <p className={`text-sm font-semibold ${theme.text}`}>
                  محدوده برش
                </p>
              </div>

              <button
                onClick={resetSelection}
                disabled={disableControls || !duration}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all
                  ${
                    disableControls
                      ? "opacity-40 cursor-not-allowed"
                      : `${theme.secondary} ${theme.text}`
                  }`}
              >
                <RotateCcw size={12} />
                ریست بازه
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={theme.textMuted}>شروع (ثانیه)</span>
                    <span className={theme.text}>
                      {formatTime(startTime)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={endTime || duration || 0}
                    step={0.1}
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(
                        Math.min(Number(e.target.value), endTime)
                      )
                    }
                    disabled={disableControls}
                    className="w-full"
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={startTime.toFixed(2)}
                  onChange={(e) => handleStartInputChange(e.target.value)}
                  disabled={disableControls}
                  className={`w-28 rounded-lg border px-2 py-1 text-xs text-left ${theme.bg} ${theme.border} ${theme.text}`}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={theme.textMuted}>پایان (ثانیه)</span>
                    <span className={theme.text}>{formatTime(endTime)}</span>
                  </div>
                  <input
                    type="range"
                    min={startTime}
                    max={duration || 0}
                    step={0.1}
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(
                        Math.max(Number(e.target.value), startTime)
                      )
                    }
                    disabled={disableControls}
                    className="w-full"
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={endTime.toFixed(2)}
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  disabled={disableControls}
                  className={`w-28 rounded-lg border px-2 py-1 text-xs text-left ${theme.bg} ${theme.border} ${theme.text}`}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <button
                onClick={playSelectedRange}
                disabled={disableControls || !selectionDuration}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${
                    disableControls || !selectionDuration
                      ? "opacity-50 cursor-not-allowed"
                      : `${theme.secondary} ${theme.accent}`
                  }`}
              >
                <Play size={16} />
                پخش بازه انتخاب‌شده ({formatTime(selectionDuration)})
              </button>

              <button
                onClick={handleDownloadSelection}
                disabled={
                  disableControls ||
                  !selectionDuration ||
                  !originalBuffer ||
                  isExporting
                }
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${
                    disableControls ||
                    !selectionDuration ||
                    !originalBuffer
                      ? "opacity-50 cursor-not-allowed"
                      : `${theme.primary}`
                  }`}
              >
                <Download size={16} />
                {isExporting
                  ? "در حال ساخت فایل..."
                  : "دانلود بخش انتخاب‌شده"}
              </button>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 space-y-3 ${theme.bg} ${theme.border}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Waves size={16} className={theme.accent} />
              <p className={`text-sm font-semibold ${theme.text}`}>
                افکت‌های نرم‌کننده صدا
              </p>
            </div>

            <p className={`text-xs ${theme.textMuted}`}>
              قبل از دانلود، می‌توانید شروع و پایان صدا را نرم‌تر کنید
              (Fade In / Fade Out).
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={fadeInEnabled}
                    onChange={(e) =>
                      setFadeInEnabled(e.target.checked)
                    }
                    disabled={disableControls || !selectionDuration}
                  />
                  <span className={theme.text}>فعال‌سازی Fade In</span>
                </label>

                <div className="grid gap-2 grid-cols-[1fr_auto] items-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={theme.textMuted}>
                        مدت Fade In (ثانیه)
                      </span>
                      <span className={theme.text}>
                        {fadeInDuration.toFixed(2)}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={Math.max(0.5, selectionDuration || 1)}
                      step={0.1}
                      value={fadeInDuration}
                      onChange={(e) =>
                        setFadeInDuration(
                          clampFade(Number(e.target.value))
                        )
                      }
                      disabled={
                        !fadeInEnabled ||
                        !selectionDuration ||
                        disableControls
                      }
                      className="w-full"
                    />
                  </div>
                  <input
                    type="number"
                    min={0.1}
                    max={selectionDuration || 10}
                    step={0.1}
                    value={fadeInDuration.toFixed(2)}
                    onChange={(e) =>
                      setFadeInDuration(
                        clampFade(
                          Number(
                            e.target.value.replace(",", ".")
                          )
                        )
                      )
                    }
                    disabled={
                      !fadeInEnabled ||
                      !selectionDuration ||
                      disableControls
                    }
                    className={`w-20 rounded-lg border px-2 py-1 text-xs text-left ${theme.bg} ${theme.border} ${theme.text}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={fadeOutEnabled}
                    onChange={(e) =>
                      setFadeOutEnabled(e.target.checked)
                    }
                    disabled={disableControls || !selectionDuration}
                  />
                <span className={theme.text}>فعال‌سازی Fade Out</span>
                </label>

                <div className="grid gap-2 grid-cols-[1fr_auto] items-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={theme.textMuted}>
                        مدت Fade Out (ثانیه)
                      </span>
                      <span className={theme.text}>
                        {fadeOutDuration.toFixed(2)}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={Math.max(0.5, selectionDuration || 1)}
                      step={0.1}
                      value={fadeOutDuration}
                      onChange={(e) =>
                        setFadeOutDuration(
                          clampFade(Number(e.target.value))
                        )
                      }
                      disabled={
                        !fadeOutEnabled ||
                        !selectionDuration ||
                        disableControls
                      }
                      className="w-full"
                    />
                  </div>
                  <input
                    type="number"
                    min={0.1}
                    max={selectionDuration || 10}
                    step={0.1}
                    value={fadeOutDuration.toFixed(2)}
                    onChange={(e) =>
                      setFadeOutDuration(
                        clampFade(
                          Number(
                            e.target.value.replace(",", ".")
                          )
                        )
                      )
                    }
                    disabled={
                      !fadeOutEnabled ||
                      !selectionDuration ||
                      disableControls
                    }
                    className={`w-20 rounded-lg border px-2 py-1 text-xs text-left ${theme.bg} ${theme.border} ${theme.text}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`mt-4 rounded-xl border border-dashed p-8 text-center ${theme.bg} ${theme.border}`}
        >
          <p className={`text-sm mb-2 ${theme.text}`}>
            هنوز فایلی انتخاب نشده است
          </p>
          <p className={`text-xs ${theme.textMuted}`}>
            یک فایل صوتی انتخاب کنید تا بتوانید آن را پخش، برش و با افکت‌های
            ساده خروجی WAV دریافت کنید.
          </p>
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
