"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Volume2, Download, Play, Pause, Info } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  fileToAudioBuffer,
  audioBufferToWavBlob,
  applyGainDb,
  normalizeAudioBuffer,
  cloneAudioBuffer,
} from "@/utils/audio-actions";
import {
  useToolContent,
  type AudioEditorToolContent,
} from "@/hooks/useToolContent";

export default function AudioVolumeTool() {
  const theme = useThemeColors();
  const content = useToolContent<AudioEditorToolContent>("audio-editor");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(
    null
  );
  const [volumeDb, setVolumeDb] = useState(0);
  const [normalize, setNormalize] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setOriginalBuffer(null);
    setVolumeDb(0);
    setNormalize(false);

    try {
      const buffer = await fileToAudioBuffer(file);
      setOriginalBuffer(buffer);
      setDuration(buffer.duration);
    } catch (err) {
      console.error("Error decoding audio file", err);
      alert(content.ui.volume.errors.decode);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const d = audioRef.current.duration || 0;
    setDuration(d);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
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

  const formatTime = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleDownloadProcessed = async () => {
    if (!originalBuffer) return;

    try {
      setIsExporting(true);

      const ctx =
        (window as any).OfflineAudioContext ||
        (window as any).webkitOfflineAudioContext
          ? new OfflineAudioContext(
              originalBuffer.numberOfChannels,
              originalBuffer.length,
              originalBuffer.sampleRate
            )
          : new (window.AudioContext || (window as any).webkitAudioContext)();

      const working = cloneAudioBuffer(ctx, originalBuffer);

      if (normalize) {
        normalizeAudioBuffer(working, 0.99);
      }

      if (volumeDb !== 0) {
        applyGainDb(working, volumeDb);
      }

      const blob = audioBufferToWavBlob(working);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const baseName = fileName.replace(/\.[^/.]+$/, "") || "audio-volume";
      a.download = `${baseName}-volume.wav`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting processed audio", err);
      alert(content.ui.volume.errors.export);
    } finally {
      setIsExporting(false);
    }
  };

  const disableControls = !audioUrl || !originalBuffer;

  return (
    <div className="space-y-4">
      {/* آپلود */}
      <div
        className={`rounded-xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${theme.bg} ${theme.border}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme.secondary}`}>
            <Upload size={18} className={theme.accent} />
          </div>
          <div>
            <p className={`text-sm font-medium ${theme.text}`}>
              {content.ui.volume.upload.title}
            </p>
            <p className={`text-xs ${theme.textMuted}`}>
              {content.ui.volume.upload.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme.primary}`}
        >
          <Upload size={16} />
          {content.ui.volume.upload.button}
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
          {/* اطلاعات فایل */}
          <div
            className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${theme.bg} ${theme.border}`}
          >
            <div className="truncate max-w-[65%]">
              <p className={`text-sm font-semibold truncate ${theme.text}`}>
                {fileName}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                {content.ui.volume.fileInfo.durationLabel}{" "}
                {formatTime(duration)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg ${theme.secondary}`}
              >
                <Info size={12} className={theme.accent} />
                <span className={theme.text}>
                  {content.ui.volume.fileInfo.currentPositionLabel}{" "}
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* اسلایدر زمان + پخش */}
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  disableControls
                    ? "opacity-50 cursor-not-allowed"
                    : theme.primary
                }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying
                  ? content.ui.volume.transport.stop
                  : content.ui.volume.transport.play}
              </button>

              <p className={`text-xs ${theme.textMuted}`}>
                {content.ui.volume.transport.helper}
              </p>
            </div>
          </div>

          {/* کنترل ولوم */}
          <div
            className={`rounded-xl border p-4 space-y-4 ${theme.bg} ${theme.border}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Volume2 size={16} className={theme.accent} />
              <p className={`text-sm font-semibold ${theme.text}`}>
                {content.ui.volume.controls.title}
              </p>
            </div>

            <p className={`text-xs ${theme.textMuted}`}>
              {content.ui.volume.controls.description}
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className={theme.textMuted}>
                    {content.ui.volume.controls.gainLabel}
                  </span>
                  <span className={theme.text}>
                    {volumeDb > 0 ? "+" : ""}
                    {volumeDb.toFixed(1)} dB
                  </span>
                </div>
                <input
                  type="range"
                  min={-24}
                  max={24}
                  step={0.5}
                  value={volumeDb}
                  onChange={(e) => setVolumeDb(Number(e.target.value))}
                  disabled={disableControls || normalize}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={normalize}
                  onChange={(e) => setNormalize(e.target.checked)}
                  disabled={disableControls}
                />
                <span className={theme.text}>
                  {content.ui.volume.controls.normalizeLabel}
                </span>
              </label>
            </div>
          </div>

          {/* دکمه خروجی */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadProcessed}
              disabled={disableControls || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                disableControls
                  ? "opacity-50 cursor-not-allowed"
                  : theme.primary
              }`}
            >
              <Download size={16} />
              {isExporting
                ? content.ui.volume.actions.downloadWorking
                : content.ui.volume.actions.downloadIdle}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`mt-4 rounded-xl border border-dashed p-8 text-center ${theme.bg} ${theme.border}`}
        >
          <p className={`text-sm mb-2 ${theme.text}`}>
            {content.ui.volume.empty.title}
          </p>
          <p className={`text-xs ${theme.textMuted}`}>
            {content.ui.volume.empty.description}
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
