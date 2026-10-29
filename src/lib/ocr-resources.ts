import { downloadResource } from "./transfer";
// Keep versions aligned with tesseract.js 7 and its embedded-WASM core.
export async function prepareOcrResources(languages: string, accurate: boolean, signal: AbortSignal) {
  const detector = await import("wasm-feature-detect");
  const variant = await detector.relaxedSimd() ? "relaxedsimd-lstm" : await detector.simd() ? "simd-lstm" : "lstm";
  const urls: string[] = [];
  try {
    const worker = await downloadResource("/runtime/ocr-v7/worker.min.js", "OCR · Worker", signal);
    const core = await downloadResource(`/runtime/ocr-v7/tesseract-core-${variant}.wasm.js`, "OCR · WebAssembly engine", signal);
    const workerPath = URL.createObjectURL(new Blob([worker], { type: "text/javascript" })); urls.push(workerPath);
    const corePath = URL.createObjectURL(new Blob([core], { type: "text/javascript" })); urls.push(corePath);
    const cachePath = `qodeforge-ocr-${accurate ? "accurate" : "balanced"}-v7`;
    const { get, set } = await import("idb-keyval");
    for (const code of languages.split("+")) {
      signal.throwIfAborted();
      if (await get(`${cachePath}/${code}.traineddata`)) continue;
      const url = `/runtime/ocr-v7/languages/${accurate ? "accurate" : "balanced"}/${code}.traineddata.gz`;
      const compressed = await downloadResource(url, `OCR · ${code}`, signal);
      signal.throwIfAborted();
      const data = new Uint8Array(await compressed.arrayBuffer());
      const raw = data[0] === 31 && data[1] === 139 ? new Uint8Array(await new Response(compressed.stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()) : data;
      // Tesseract uses this same IndexedDB store for its public language packs.
      await set(`${cachePath}/${code}.traineddata`, raw);
    }
    signal.throwIfAborted();
    return { workerPath, corePath: `${corePath}#.js`, cachePath, release: () => urls.forEach(url => URL.revokeObjectURL(url)) };
  } catch (error) { urls.forEach(url => URL.revokeObjectURL(url)); throw error; }
}
