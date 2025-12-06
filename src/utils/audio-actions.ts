// utils/audio-actions.ts

let sharedAudioContext: AudioContext | null = null;

export const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return sharedAudioContext;
};

// تبدیل فایل به AudioBuffer
export async function fileToAudioBuffer(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = getAudioContext();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer); // [web:189]
  return audioBuffer;
}

// بریدن بخش انتخاب‌شده از AudioBuffer
export function trimAudioBuffer(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;

  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(
    buffer.length,
    Math.floor(endTime * sampleRate)
  );
  const frameCount = Math.max(0, endSample - startSample);

  const ctx = getAudioContext();
  const trimmed = ctx.createBuffer(channels, frameCount, sampleRate); // [web:193]

  for (let ch = 0; ch < channels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = trimmed.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      dst[i] = src[i + startSample];
    }
  }

  return trimmed;
}

// تبدیل AudioBuffer به Blob فرمت WAV (16-bit PCM)
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const samples = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  let offset = 0;

  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset++, s.charCodeAt(i));
    }
  };

  // RIFF header [web:182]
  writeString("RIFF");
  view.setUint32(offset, totalSize - 8, true);
  offset += 4;
  writeString("WAVE");

  // fmt chunk
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4;
  view.setUint16(offset, format, true);
  offset += 2;
  view.setUint16(offset, numChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, bitDepth, true);
  offset += 2;

  // data chunk
  writeString("data");
  view.setUint32(offset, dataSize, true);
  offset += 4;

  // نوشتن نمونه‌ها به صورت Int16
  const tmp = new Float32Array(samples * numChannels);

  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = buffer.getChannelData(ch);
    for (let i = 0; i < samples; i++) {
      tmp[i * numChannels + ch] = channelData[i];
    }
  }

  let idx = 0;
  while (offset < totalSize) {
    let s = Math.max(-1, Math.min(1, tmp[idx++])); // clamp
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, s, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export function applyFadeIn(
  buffer: AudioBuffer,
  fadeDuration: number
): void {
  const sampleRate = buffer.sampleRate;
  const fadeSamples = Math.min(
    buffer.length,
    Math.floor(fadeDuration * sampleRate)
  );
  const channels = buffer.numberOfChannels;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < fadeSamples; i++) {
      const gain = i / fadeSamples; // خطی 0 → 1
      data[i] *= gain;
    }
  }
}

export function applyFadeOut(
  buffer: AudioBuffer,
  fadeDuration: number
): void {
  const sampleRate = buffer.sampleRate;
  const fadeSamples = Math.min(
    buffer.length,
    Math.floor(fadeDuration * sampleRate)
  );
  const channels = buffer.numberOfChannels;
  const start = buffer.length - fadeSamples;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < fadeSamples; i++) {
      const gain = 1 - i / fadeSamples; // خطی 1 → 0
      data[start + i] *= gain;
    }
  }
}
export function applyGainDb(buffer: AudioBuffer, gainDb: number): void {
  const gain = Math.pow(10, gainDb / 20);
  const channels = buffer.numberOfChannels;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] *= gain;
    }
  }
}

export function normalizeAudioBuffer(
  buffer: AudioBuffer,
  targetPeak = 0.99
): void {
  const channels = buffer.numberOfChannels;
  let maxAmp = 0;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i]);
      if (v > maxAmp) maxAmp = v;
    }
  }

  if (!maxAmp || maxAmp <= 0) return;

  const gain = targetPeak / maxAmp;

  for (let ch = 0; ch < channels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] *= gain;
    }
  }
}

export function cloneAudioBuffer(
  context: BaseAudioContext,
  buffer: AudioBuffer
): AudioBuffer {
  const clone = context.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    clone.getChannelData(ch).set(buffer.getChannelData(ch));
  }

  return clone;
}
