// public/vendor/pdfjs/init.mjs
try {
  let mod = null;

  // try min first
  try {
    mod = await import("./pdf.min.mjs");
  } catch {
    mod = await import("./pdf.mjs");
  }

  const pdfjsLib = mod?.default ?? mod;

  if (!pdfjsLib?.getDocument) {
    throw new Error("Invalid pdfjs module build: getDocument is missing.");
  }

  // worker (min first)
  let workerUrl = null;
  try {
    workerUrl = new URL("./pdf.worker.min.mjs", import.meta.url).toString();
  } catch {
    workerUrl = new URL("./pdf.worker.mjs", import.meta.url).toString();
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  globalThis.pdfjsLib = pdfjsLib;
  globalThis.pdfjsInitError = null;
} catch (e) {
  globalThis.pdfjsLib = null;
  globalThis.pdfjsInitError = e?.message ?? String(e);
}
