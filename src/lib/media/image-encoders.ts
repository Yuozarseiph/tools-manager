/** Standalone, single-frame image encoders. GIF exports use an opaque RGB332 palette. */
export function encodeBmp(image: ImageData): Blob {
  const { width, height, data } = image;
  const stride = (width * 3 + 3) & ~3;
  const bytes = new Uint8Array(54 + stride * height);
  const view = new DataView(bytes.buffer);
  bytes.set([0x42, 0x4d], 0);
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, stride * height, true);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3] / 255;
      const j = 54 + (height - y - 1) * stride + x * 3;
      bytes[j] = Math.round(data[i + 2] * a + 255 * (1 - a));
      bytes[j + 1] = Math.round(data[i + 1] * a + 255 * (1 - a));
      bytes[j + 2] = Math.round(data[i] * a + 255 * (1 - a));
    }
  }
  return new Blob([bytes], { type: "image/bmp" });
}

export function encodeGif(image: ImageData): Blob {
  const { width, height, data } = image;
  if (width > 65535 || height > 65535) throw new Error("GIF dimensions exceed format limits");
  const bytes: number[] = [];
  const word = (x: number) => { bytes.push(x & 255, (x >> 8) & 255); };
  for (const c of "GIF89a") bytes.push(c.charCodeAt(0));
  word(width); word(height);
  bytes.push(0xf7, 0, 0); // Global palette: 256 colors, RGB 3:3:2
  for (let i = 0; i < 256; i++) {
    bytes.push(Math.round(((i >> 5) & 7) * 255 / 7), Math.round(((i >> 2) & 7) * 255 / 7), Math.round((i & 3) * 255 / 3));
  }
  bytes.push(0x2c); // image descriptor
  word(0); word(0); word(width); word(height); bytes.push(0);
  bytes.push(8); // LZW min code size
  const clear = 256;
  const end = 257;
  let nextCode = 258;
  let bits = 9;
  let dictionary = new Map<number, number>();
  const compressed: number[] = [];
  let accumulator = 0;
  let accBits = 0;
  const emit = (code: number) => {
    accumulator |= code << accBits;
    accBits += bits;
    while (accBits >= 8) {
      compressed.push(accumulator & 255);
      accumulator >>>= 8;
      accBits -= 8;
    }
  };
  const reset = () => { dictionary = new Map(); nextCode = 258; bits = 9; };
  emit(clear);
  let prefix = -1;
  for (let i = 0; i < width * height; i++) {
    const at = i * 4;
    const a = data[at + 3] / 255;
    const r = Math.round(data[at] * a + 255 * (1 - a));
    const g = Math.round(data[at + 1] * a + 255 * (1 - a));
    const b = Math.round(data[at + 2] * a + 255 * (1 - a));
    const color = (r & 0xe0) | ((g & 0xe0) >> 3) | (b >> 6);
    if (prefix === -1) { prefix = color; continue; }
    const key = prefix * 256 + color;
    const found = dictionary.get(key);
    if (found !== undefined) { prefix = found; continue; }
    emit(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode++);
      // Grow code size once decoder will have encountered the next new code.
      if (nextCode > (1 << bits) && bits < 12) bits++;
    } else {
      emit(clear);
      reset();
    }
    prefix = color;
  }
  if (prefix >= 0) emit(prefix);
  emit(end);
  if (accBits > 0) compressed.push(accumulator & 255);
  for (let i = 0; i < compressed.length; i += 255) {
    const block = compressed.slice(i, i + 255);
    bytes.push(block.length, ...block);
  }
  bytes.push(0, 0x3b);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}
