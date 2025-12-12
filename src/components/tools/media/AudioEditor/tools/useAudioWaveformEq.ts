"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fileToAudioBuffer } from "@/utils/audio-actions";

export type EqBand = {
  id: string;
  label: string;
  freq: number;
  q: number;
  gainDb: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function formatTime(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function dbToGain(db: number) {
  return Math.pow(10, db / 20);
}

const EQ31_FREQS: Array<{ label: string; freq: number }> = [
  { label: "20", freq: 20 },
  { label: "25", freq: 25 },
  { label: "31.5", freq: 31.5 },
  { label: "40", freq: 40 },
  { label: "50", freq: 50 },
  { label: "63", freq: 63 },
  { label: "80", freq: 80 },
  { label: "100", freq: 100 },
  { label: "125", freq: 125 },
  { label: "160", freq: 160 },
  { label: "200", freq: 200 },
  { label: "250", freq: 250 },
  { label: "315", freq: 315 },
  { label: "400", freq: 400 },
  { label: "500", freq: 500 },
  { label: "630", freq: 630 },
  { label: "800", freq: 800 },
  { label: "1k", freq: 1000 },
  { label: "1.25k", freq: 1250 },
  { label: "1.6k", freq: 1600 },
  { label: "2k", freq: 2000 },
  { label: "2.5k", freq: 2500 },
  { label: "3.15k", freq: 3150 },
  { label: "4k", freq: 4000 },
  { label: "5k", freq: 5000 },
  { label: "6.3k", freq: 6300 },
  { label: "8k", freq: 8000 },
  { label: "10k", freq: 10000 },
  { label: "12.5k", freq: 12500 },
  { label: "16k", freq: 16000 },
  { label: "20k", freq: 20000 },
];

function makeDefaultBands(): EqBand[] {
  const Q_DEFAULT = 4.318;
  return EQ31_FREQS.map((f, idx) => ({
    id: `b${idx}`,
    label: `${f.label}Hz`,
    freq: f.freq,
    q: Q_DEFAULT,
    gainDb: 0,
  }));
}

/** WAV encoder (PCM16) */
function audioBufferToWavBlobSafe(buffer: AudioBuffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;

  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const totalSize = 44 + dataSize;

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

  writeString("RIFF");
  writeU32(36 + dataSize);
  writeString("WAVE");
  writeString("fmt ");
  writeU32(16);
  writeU16(1);
  writeU16(numChannels);
  writeU32(sampleRate);
  writeU32(sampleRate * blockAlign);
  writeU16(blockAlign);
  writeU16(16);
  writeString("data");
  writeU32(dataSize);

  const chData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++)
    chData.push(buffer.getChannelData(ch));

  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let s = chData[ch][i] ?? 0;
      s = Math.max(-1, Math.min(1, s));
      const v = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, v, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}

type Peaks = { minArr: Float32Array; maxArr: Float32Array };

type PlayingGraph = {
  ctx: AudioContext;
  src: AudioBufferSourceNode;
  masterGain: GainNode;
  filters: BiquadFilterNode[];
  startedAtCtxTime: number;
  startedAtOffsetSec: number;
};

export function useAudioWaveformEq() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

  const [duration, setDuration] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const [selStart, _setSelStart] = useState(0);
  const [selEnd, _setSelEnd] = useState(0);
  const [loopSelection, _setLoopSelection] = useState(false);

  const [segmentGainDb, _setSegmentGainDb] = useState(0);
  const [bands, _setBands] = useState<EqBand[]>(() => makeDefaultBands());

  const [isExporting, setIsExporting] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const graphRef = useRef<PlayingGraph | null>(null);
  const rafRef = useRef<number | null>(null);

  const lastUiUpdateAtRef = useRef(0);
  const UI_FPS = 30;
  const UI_FRAME_MS = 1000 / UI_FPS;

  const loopRestartLockRef = useRef(false);

  const selStartRef = useRef(selStart);
  const selEndRef = useRef(selEnd);
  const loopRef = useRef(loopSelection);
  const segmentGainDbRef = useRef(segmentGainDb);
  const bandsRef = useRef(bands);

  useEffect(() => void (selStartRef.current = selStart), [selStart]);
  useEffect(() => void (selEndRef.current = selEnd), [selEnd]);
  useEffect(() => void (loopRef.current = loopSelection), [loopSelection]);
  useEffect(
    () => void (segmentGainDbRef.current = segmentGainDb),
    [segmentGainDb]
  );
  useEffect(() => void (bandsRef.current = bands), [bands]);

  // ✅ Peaks cache داخل hook (UI state حذف شد)
  const peaksCacheRef = useRef<{
    key: string;
    cols: number;
    peaks: Peaks;
  } | null>(null);

  const ensureCtx = () => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx = (window.AudioContext ||
      (window as any).webkitAudioContext) as any;
    ctxRef.current = new Ctx();
    return ctxRef.current!;
  };

  const stopRaf = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const stopGraph = () => {
    const g = graphRef.current;
    if (!g) return;
    try {
      g.src.onended = null;
      g.src.stop();
    } catch {}
    try {
      g.src.disconnect();
      g.masterGain.disconnect();
      g.filters.forEach((f) => f.disconnect());
    } catch {}
    graphRef.current = null;
  };

  const pause = useCallback(() => {
    const g = graphRef.current;
    const b = buffer;
    if (!g || !b) {
      stopRaf();
      stopGraph();
      setIsPlaying(false);
      return;
    }

    const t = g.startedAtOffsetSec + (g.ctx.currentTime - g.startedAtCtxTime);
    const clamped = clamp(t, 0, b.duration);
    currentTimeRef.current = clamped;
    setCurrentTime(clamped);

    stopRaf();
    stopGraph();
    setIsPlaying(false);
  }, [buffer]);

  useEffect(() => {
    return () => {
      stopRaf();
      stopGraph();
      try {
        ctxRef.current?.close();
      } catch {}
      ctxRef.current = null;

      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disableControls = !audioUrl || !buffer;

  const setSelStart = useCallback((t: number) => _setSelStart(t), []);
  const setSelEnd = useCallback((t: number) => _setSelEnd(t), []);
  const setLoopSelection = useCallback(
    (v: boolean) => _setLoopSelection(v),
    []
  );
  const setSegmentGainDb = useCallback(
    (db: number) => _setSegmentGainDb(db),
    []
  );
  const setBands = useCallback(
    (updater: (prev: EqBand[]) => EqBand[]) => _setBands(updater),
    []
  );

  const resetEq = useCallback(() => {
    setBands((prev) => prev.map((b) => ({ ...b, gainDb: 0 })));
  }, [setBands]);

  const resetSelection = useCallback(() => {
    if (!buffer) return;
    setSelStart(0);
    setSelEnd(buffer.duration);
  }, [buffer, setSelEnd, setSelStart]);

  const setBandGain = useCallback(
    (index: number, gainDb: number) => {
      setBands((prev) =>
        prev.map((b, i) => (i === index ? { ...b, gainDb } : b))
      );
    },
    [setBands]
  );

  const scheduleSelectionAutomation = useCallback(
    (params: {
      ctx: BaseAudioContext;
      when: number;
      startOffset: number;
      selectionStart: number;
      selectionEnd: number;
      masterGain: GainNode;
      filters: BiquadFilterNode[];
      bandGainsDb: number[];
      segmentGainDb: number;
    }) => {
      const {
        when,
        startOffset,
        selectionStart,
        selectionEnd,
        masterGain,
        filters,
        bandGainsDb,
        segmentGainDb,
      } = params;

      const t0 = when;
      const tSelStart = t0 + Math.max(0, selectionStart - startOffset);
      const tSelEnd = t0 + Math.max(0, selectionEnd - startOffset);

      const RAMP = 0.005;

      masterGain.gain.cancelScheduledValues(t0);
      filters.forEach((f) => f.gain.cancelScheduledValues(t0));

      masterGain.gain.setValueAtTime(1, t0);
      filters.forEach((f) => f.gain.setValueAtTime(0, t0));

      masterGain.gain.setValueAtTime(1, Math.max(t0, tSelStart - RAMP));
      masterGain.gain.linearRampToValueAtTime(
        dbToGain(segmentGainDb),
        tSelStart
      );

      filters.forEach((f, i) => {
        f.gain.setValueAtTime(0, Math.max(t0, tSelStart - RAMP));
        f.gain.linearRampToValueAtTime(bandGainsDb[i] ?? 0, tSelStart);
      });

      masterGain.gain.setValueAtTime(
        dbToGain(segmentGainDb),
        Math.max(t0, tSelEnd - RAMP)
      );
      masterGain.gain.linearRampToValueAtTime(1, tSelEnd);

      filters.forEach((f) => {
        f.gain.setValueAtTime(f.gain.value, Math.max(t0, tSelEnd - RAMP));
        f.gain.linearRampToValueAtTime(0, tSelEnd);
      });
    },
    []
  );

  const startPlayback = useCallback(
    async (fromTime: number) => {
      if (!buffer) return;

      const ctx = ensureCtx();
      try {
        await ctx.resume();
      } catch {}

      stopGraph();
      stopRaf();
      loopRestartLockRef.current = false;

      const src = ctx.createBufferSource();
      src.buffer = buffer;

      const masterGain = ctx.createGain();

      const nowBands = bandsRef.current;
      const filters = nowBands.map((b) => {
        const f = ctx.createBiquadFilter();
        f.type = "peaking";
        f.frequency.value = b.freq;
        f.Q.value = b.q;
        f.gain.value = 0;
        return f;
      });

      src.connect(masterGain);
      let head: AudioNode = masterGain;
      for (const f of filters) {
        head.connect(f);
        head = f;
      }
      head.connect(ctx.destination);

      const startedAtCtxTime = ctx.currentTime;
      const startedAtOffsetSec = clamp(fromTime, 0, buffer.duration);

      const s0 = clamp(selStartRef.current, 0, buffer.duration);
      const s1 = clamp(selEndRef.current, 0, buffer.duration);

      scheduleSelectionAutomation({
        ctx,
        when: startedAtCtxTime,
        startOffset: startedAtOffsetSec,
        selectionStart: Math.min(s0, s1),
        selectionEnd: Math.max(s0, s1),
        masterGain,
        filters,
        bandGainsDb: nowBands.map((b) => b.gainDb),
        segmentGainDb: segmentGainDbRef.current,
      });

      src.start(startedAtCtxTime, startedAtOffsetSec);

      graphRef.current = {
        ctx,
        src,
        masterGain,
        filters,
        startedAtCtxTime,
        startedAtOffsetSec,
      };

      setIsPlaying(true);

      const tick = () => {
        const g = graphRef.current;
        if (!g) return;

        const t =
          g.startedAtOffsetSec + (g.ctx.currentTime - g.startedAtCtxTime);
        const clamped = clamp(t, 0, buffer.duration);
        currentTimeRef.current = clamped;

        const nowMs = performance.now();
        if (nowMs - lastUiUpdateAtRef.current >= UI_FRAME_MS) {
          lastUiUpdateAtRef.current = nowMs;
          setCurrentTime(clamped);
        }

        if (loopRef.current) {
          const a = clamp(selStartRef.current, 0, buffer.duration);
          const b = clamp(selEndRef.current, 0, buffer.duration);
          const start = Math.min(a, b);
          const end = Math.max(a, b);

          if (end > start && clamped >= end) {
            if (!loopRestartLockRef.current) {
              loopRestartLockRef.current = true;
              startPlayback(start);
              return;
            }
          } else {
            loopRestartLockRef.current = false;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);

      src.onended = () => {
        stopRaf();
        setIsPlaying(false);
      };
    },
    [buffer, scheduleSelectionAutomation]
  );

  const togglePlay = useCallback(() => {
    if (disableControls) return;
    if (isPlaying) pause();
    else startPlayback(currentTimeRef.current);
  }, [disableControls, isPlaying, pause, startPlayback]);

  const seek = useCallback(
    (t: number) => {
      if (!buffer) return;
      const v = clamp(t, 0, buffer.duration);
      currentTimeRef.current = v;
      setCurrentTime(v);
      if (isPlaying) startPlayback(v);
    },
    [buffer, isPlaying, startPlayback]
  );

  const loadFile = useCallback(
    async (file: File) => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      pause();

      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setFileName(file.name);

      setBuffer(null);
      setDuration(0);
      currentTimeRef.current = 0;
      setCurrentTime(0);

      peaksCacheRef.current = null;

      const b = await fileToAudioBuffer(file);
      setBuffer(b);
      setDuration(b.duration);

      _setSelStart(0);
      _setSelEnd(b.duration);
      _setLoopSelection(false);
    },
    [audioUrl, pause]
  );

  // ✅ Peaks generator (cache + mix channels) => همیشه اگر buffer هست peaks می‌ده
  const getPeaks = useCallback(
    (columns: number): Peaks | null => {
      if (!buffer) return null;

      const cols = Math.max(64, Math.floor(columns));
      const key = `${buffer.length}:${buffer.sampleRate}:${buffer.numberOfChannels}`;

      const cached = peaksCacheRef.current;
      if (cached && cached.key === key && cached.cols === cols)
        return cached.peaks;

      const numChannels = buffer.numberOfChannels;
      const chData: Float32Array[] = [];
      for (let ch = 0; ch < numChannels; ch++)
        chData.push(buffer.getChannelData(ch));

      const len = buffer.length;
      const step = Math.max(1, Math.floor(len / cols));

      const minArr = new Float32Array(cols);
      const maxArr = new Float32Array(cols);

      for (let x = 0; x < cols; x++) {
        let mn = 1;
        let mx = -1;
        const start = x * step;
        const end = Math.min(len, start + step);

        for (let i = start; i < end; i++) {
          // mixdown ساده: average channels
          let v = 0;
          for (let ch = 0; ch < numChannels; ch++) v += chData[ch][i] ?? 0;
          v /= numChannels;

          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }

        minArr[x] = mn;
        maxArr[x] = mx;
      }

      const peaks = { minArr, maxArr };
      peaksCacheRef.current = { key, cols, peaks };
      return peaks;
    },
    [buffer]
  );

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSelectionWav = useCallback(async () => {
    if (!buffer || disableControls) return;

    setIsExporting(true);
    try {
      const start = clamp(selStartRef.current, 0, buffer.duration);
      const end = clamp(selEndRef.current, 0, buffer.duration);
      const s0 = Math.min(start, end);
      const s1 = Math.max(start, end);
      const dur = Math.max(0, s1 - s0);
      if (dur <= 0) throw new Error("Invalid selection.");

      const sampleRate = buffer.sampleRate;
      const length = Math.floor(dur * sampleRate);

      const offline = new OfflineAudioContext(
        buffer.numberOfChannels,
        length,
        sampleRate
      );
      const src = offline.createBufferSource();
      src.buffer = buffer;

      const masterGain = offline.createGain();
      masterGain.gain.setValueAtTime(dbToGain(segmentGainDbRef.current), 0);

      const nowBands = bandsRef.current;
      const filters = nowBands.map((b) => {
        const f = offline.createBiquadFilter();
        f.type = "peaking";
        f.frequency.value = b.freq;
        f.Q.value = b.q;
        f.gain.value = b.gainDb;
        return f;
      });

      src.connect(masterGain);
      let head: AudioNode = masterGain;
      for (const f of filters) {
        head.connect(f);
        head = f;
      }
      head.connect(offline.destination);

      src.start(0, s0, dur);
      const rendered = await offline.startRendering();

      const wav = audioBufferToWavBlobSafe(rendered);
      const baseName = (fileName || "audio").replace(/\.[^/.]+$/, "");
      downloadBlob(wav, `${baseName}-selection-eq.wav`);
    } finally {
      setIsExporting(false);
    }
  }, [buffer, disableControls, fileName]);

  const exportFullWavSelectionOnly = useCallback(async () => {
    if (!buffer || disableControls) return;

    setIsExporting(true);
    try {
      const sampleRate = buffer.sampleRate;
      const offline = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        sampleRate
      );

      const src = offline.createBufferSource();
      src.buffer = buffer;

      const masterGain = offline.createGain();

      const nowBands = bandsRef.current;
      const filters = nowBands.map((b) => {
        const f = offline.createBiquadFilter();
        f.type = "peaking";
        f.frequency.value = b.freq;
        f.Q.value = b.q;
        f.gain.value = 0;
        return f;
      });

      src.connect(masterGain);
      let head: AudioNode = masterGain;
      for (const f of filters) {
        head.connect(f);
        head = f;
      }
      head.connect(offline.destination);

      const start = clamp(selStartRef.current, 0, buffer.duration);
      const end = clamp(selEndRef.current, 0, buffer.duration);
      const s0 = Math.min(start, end);
      const s1 = Math.max(start, end);

      scheduleSelectionAutomation({
        ctx: offline,
        when: 0,
        startOffset: 0,
        selectionStart: s0,
        selectionEnd: s1,
        masterGain,
        filters,
        bandGainsDb: nowBands.map((b) => b.gainDb),
        segmentGainDb: segmentGainDbRef.current,
      });

      src.start(0);
      const rendered = await offline.startRendering();

      const wav = audioBufferToWavBlobSafe(rendered);
      const baseName = (fileName || "audio").replace(/\.[^/.]+$/, "");
      downloadBlob(wav, `${baseName}-full-selection-eq.wav`);
    } finally {
      setIsExporting(false);
    }
  }, [buffer, disableControls, fileName, scheduleSelectionAutomation]);

  const selectionLabel = useMemo(() => {
    const s = clamp(selStart, 0, duration);
    const e = clamp(selEnd, 0, duration);
    return `${formatTime(Math.min(s, e))} - ${formatTime(Math.max(s, e))}`;
  }, [duration, selEnd, selStart]);

  return {
    audioUrl,
    fileName,
    buffer,
    duration,
    currentTime,
    isPlaying,
    disableControls,
    isExporting,

    selStart,
    selEnd,
    loopSelection,
    selectionLabel,

    segmentGainDb,
    bands,

    loadFile,
    togglePlay,
    pause,
    seek,

    setSelStart,
    setSelEnd,
    resetSelection,
    setLoopSelection,

    setSegmentGainDb,
    setBandGain,
    resetEq,
    getPeaks,

    exportSelectionWav,
    exportFullWavSelectionOnly,
  };
}
