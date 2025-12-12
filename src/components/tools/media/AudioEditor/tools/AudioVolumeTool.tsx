"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Volume2, Download, Play, Pause, Info } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  fileToAudioBuffer,
  applyGainDb,
  normalizeAudioBuffer,
  cloneAudioBuffer,
} from "@/utils/audio-actions";

import {
  useAudioEditorContent,
  type AudioEditorToolContent,
} from "../audio-editor.content";

/** dB -> linear gain */
function dbToLinear(db: number) {
  return Math.pow(10, db / 20);
}

/** approximate peak to avoid freezing on huge files */
function computePeakApprox(buffer: AudioBuffer, maxSamples = 2_000_000) {
  const channels = buffer.numberOfChannels;
  const len = buffer.length;
  if (!len) return 0;

  const stride = Math.max(1, Math.floor(len / maxSamples));
  let peak = 0;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i += stride) {
      const v = Math.abs(data[i] || 0);
      if (v > peak) peak = v;
      if (peak >= 0.999999) return peak;
    }
  }
  return peak;
}

/** safer WAV encoder: no extra Float32Array allocation */
function audioBufferToWavBlobSafe(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;

  const bytesPerSample = 2; // PCM16
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const totalSize = 44 + dataSize;

  // Guard: if total is crazy large, likely to crash anyway
  // (حدود 1GB رو محافظه‌کارانه می‌گیریم)
  const ONE_GB = 1024 * 1024 * 1024;
  if (totalSize > ONE_GB) {
    throw new Error("Audio is too large to export as WAV in browser memory.");
  }

  const ab = new ArrayBuffer(totalSize);
  const view = new DataView(ab);

  let offset = 0;
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  const writeU32 = (v: number) => {
    view.setUint32(offset, v, true);
    offset += 4;
  };
  const writeU16 = (v: number) => {
    view.setUint16(offset, v, true);
    offset += 2;
  };

  // RIFF header
  writeString("RIFF");
  writeU32(36 + dataSize);
  writeString("WAVE");

  // fmt chunk
  writeString("fmt ");
  writeU32(16); // PCM
  writeU16(1); // audio format = PCM
  writeU16(numChannels);
  writeU32(sampleRate);
  writeU32(byteRate);
  writeU16(blockAlign);
  writeU16(16); // bits per sample

  // data chunk
  writeString("data");
  writeU32(dataSize);

  // interleave samples (PCM16)
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));

  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let s = channelData[ch][i] ?? 0;
      s = Math.max(-1, Math.min(1, s));
      const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}

export default function AudioVolumeTool() {
  const theme = useThemeColors();
  const content: AudioEditorToolContent = useAudioEditorContent();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // WebAudio graph for realtime preview
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);

  const [volumeDb, setVolumeDb] = useState(0);
  const [normalize, setNormalize] = useState(false);
  const [normalizePeak, setNormalizePeak] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  const disableControls = !audioUrl || !originalBuffer;

  // cleanup URL
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // cleanup AudioContext
  useEffect(() => {
    return () => {
      try {
        mediaSourceRef.current?.disconnect();
        gainNodeRef.current?.disconnect();
      } catch {}
      try {
        audioCtxRef.current?.close();
      } catch {}
      mediaSourceRef.current = null;
      gainNodeRef.current = null;
      audioCtxRef.current = null;
    };
  }, []);

  const ensureAudioGraph = () => {
    const el = audioRef.current;
    if (!el) return;

    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as any;
      audioCtxRef.current = new Ctx();
    }

    const ctx = audioCtxRef.current;

    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx!.createGain();
      gainNodeRef.current.connect(ctx!.destination);
    }

    // IMPORTANT: only create one MediaElementAudioSourceNode per element
    if (!mediaSourceRef.current) {
      mediaSourceRef.current = ctx!.createMediaElementSource(el);
      mediaSourceRef.current.connect(gainNodeRef.current);
    }
  };

  const effectiveGainLinear = useMemo(() => {
    const userGain = dbToLinear(volumeDb);
    if (!normalize) return userGain;

    // target peak (like 0.99)
    const target = 0.99;
    const peak = normalizePeak ?? 0;

    if (!peak || peak <= 0) return userGain; // fallback
    const normGain = target / peak;

    // cap normalization gain to avoid extreme boosts
    const capped = Math.min(normGain, 20);
    return userGain * capped;
  }, [volumeDb, normalize, normalizePeak]);

  // apply realtime gain
  useEffect(() => {
    if (!gainNodeRef.current) return;
    const ctx = audioCtxRef.current;
    const g = effectiveGainLinear;

    try {
      gainNodeRef.current.gain.setTargetAtTime(g, ctx?.currentTime ?? 0, 0.01);
    } catch {
      gainNodeRef.current.gain.value = g;
    }
  }, [effectiveGainLinear]);

  // compute peak when needed
  useEffect(() => {
    if (!normalize) return;
    if (!originalBuffer) return;

    // compute async-ish to keep UI responsive
    const t = window.setTimeout(() => {
      try {
        const peak = computePeakApprox(originalBuffer, 2_000_000);
        setNormalizePeak(peak);
      } catch {
        setNormalizePeak(null);
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [normalize, originalBuffer]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // stop current playback
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setIsPlaying(false);

    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setFileName(file.name);

    setDuration(0);
    setCurrentTime(0);

    setOriginalBuffer(null);
    setVolumeDb(0);
    setNormalize(false);
    setNormalizePeak(null);

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
    const el = audioRef.current;
    if (!el) return;
    setDuration(el.duration || 0);
  };

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime);
  };

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!audioUrl) return;

    try {
      ensureAudioGraph();
      // autoplay policy: resume context on user gesture
      await audioCtxRef.current?.resume();
    } catch {}

    try {
      if (!el.paused) {
        el.pause();
      } else {
        await el.play();
      }
    } catch (err) {
      console.warn("Play failed", err);
    }
  };

  const formatTime = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleDownloadProcessed = async () => {
    if (!originalBuffer) return;

    try {
      setIsExporting(true);

      const CtxConstructor =
        (window as any).OfflineAudioContext ||
        (window as any).webkitOfflineAudioContext ||
        window.AudioContext ||
        (window as any).webkitAudioContext;

      const ctx =
        CtxConstructor === (window.AudioContext || (window as any).webkitAudioContext)
          ? new CtxConstructor()
          : new CtxConstructor(
              originalBuffer.numberOfChannels,
              originalBuffer.length,
              originalBuffer.sampleRate
            );

      const working = cloneAudioBuffer(ctx, originalBuffer);

      if (normalize) {
        normalizeAudioBuffer(working, 0.99);
      }

      if (volumeDb !== 0) {
        applyGainDb(working, volumeDb);
      }

      const blob = audioBufferToWavBlobSafe(working);
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

  return (
    <div className="space-y-4">
      {/* Upload */}
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
          {/* File info */}
          <div
            className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${theme.bg} ${theme.border}`}
          >
            <div className="truncate max-w-[65%]">
              <p className={`text-sm font-semibold truncate ${theme.text}`}>
                {fileName}
              </p>
              <p className={`text-xs ${theme.textMuted}`}>
                {content.ui.volume.fileInfo.durationLabel} {formatTime(duration)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-xs">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${theme.secondary}`}>
                <Info size={12} className={theme.accent} />
                <span className={theme.text}>
                  {content.ui.volume.fileInfo.currentPositionLabel} {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Seek + transport */}
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
                  disableControls ? "opacity-50 cursor-not-allowed" : theme.primary
                }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? content.ui.volume.transport.stop : content.ui.volume.transport.play}
              </button>

              <p className={`text-xs ${theme.textMuted}`}>
                {content.ui.volume.transport.helper}
              </p>
            </div>
          </div>

          {/* Volume controls */}
          <div className={`rounded-xl border p-4 space-y-4 ${theme.bg} ${theme.border}`}>
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
                  disabled={disableControls}
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

          {/* Export */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadProcessed}
              disabled={disableControls || isExporting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                disableControls || isExporting ? "opacity-50 cursor-not-allowed" : theme.primary
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
        <div className={`mt-4 rounded-xl border border-dashed p-8 text-center ${theme.bg} ${theme.border}`}>
          <p className={`text-sm mb-2 ${theme.text}`}>
            {content.ui.volume.empty.title}
          </p>
          <p className={`text-xs ${theme.textMuted}`}>
            {content.ui.volume.empty.description}
          </p>
        </div>
      )}

      {/* Keep audio element in DOM; routed through WebAudio */}
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
