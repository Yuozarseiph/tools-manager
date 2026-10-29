/** The optional export name is scoped to the current tool, kept in memory only. */
export const OUTPUT_NAME_TOOLS = new Set([
  "file-to-markdown", "project-to-markdown", "text-cleaner", "text-chunker",
  "chat-to-markdown", "text-diff", "sensitive-data-redactor", "json-formatter",
  "code-editor", "excel-viewer", "excel-editor", "bank", "audio-editor",
  "audio-extractor", "image-to-text", "image-to-svg", "color-picker",
  "image-editor", "image-to-pdf", "background-remover", "exif-remover",
  "image-converter", "image-compressor", "image-resizer", "image-stitcher",
  "pdf-editor", "pdf-merge", "pdf-to-image", "pdf-to-word", "word-to-pdf",
  "text-to-pdf", "qr-generator", "security-tools",
]);

const knownExtension = /\.(?:png|jpe?g|webp|gif|svg|ico|pdf|docx?|pptx?|xlsx?|csv|tsv|json|txt|md|markdown|diff|zip|wav|mp3|ogg|aac|m4a|flac|css|html?|js|jsx|ts|tsx|py|php|java|cpp|c|cs|go|rs|sql|xml|ya?ml|sh|exe|bat|cmd|psd|psb)$/i;
function cleanBase(value: string) {
  // Keep Unicode names, but disallow path traversal, control characters and Windows device names.
  let clean = Array.from(value.normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>:"/\\|?*]/g, "-").trim().replace(/^[.\s]+|[.\s]+$/g, "")).slice(0, 120).join("");
  if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(clean)) clean = `_${clean}`;
  return clean;
}

export function normaliseOutputName(requested: string, suggested: string, suffix = "") {
  const extension = suggested.match(/\.[a-z\d]{1,12}$/i)?.[0] ?? "";
  if (!requested.trim()) {
    const base = extension ? suggested.slice(0, -extension.length) : suggested;
    return `${cleanBase(base) || "output"}${extension}`;
  }
  const base = cleanBase(requested.replace(knownExtension, "")) || "output";
  return `${base}${suffix ? `-${cleanBase(suffix)}` : ""}${extension}`;
}

let active: { path: string; value: string; owner: symbol } | undefined;
export function configureOutputName(path: string, value: string, owner: symbol) {
  active = { path, value, owner };
}
export function releaseOutputName(owner: symbol) {
  if (active?.owner === owner) active = undefined;
}
export function outputFilename(suggested: string, suffix = "") {
  const path = typeof window === "undefined" ? "" : window.location.pathname.replace(/\/$/, "").replace(/\.html$/i, "");
  return normaliseOutputName(active?.path === path ? active.value : "", suggested, suffix);
}
