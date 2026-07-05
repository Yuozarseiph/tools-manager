// Copies the pdf.js library + worker from node_modules into /public/pdfjs so
// the PDF-to-Image tool can load them fully offline (no CDN), always matching
// the installed pdfjs-dist version. Runs automatically before dev/build.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = resolve(root, "node_modules/pdfjs-dist/legacy/build");
const destDir = resolve(root, "public/pdfjs");
// Copied with a .js extension (not .mjs) so the production host serves them
// with a JavaScript MIME type — native module import() rejects missing/wrong
// MIME types, which broke the deployed PDF-to-Image tool.
const files = [
  { src: "pdf.min.mjs", dest: "pdf.min.js" },
  { src: "pdf.worker.min.mjs", dest: "pdf.worker.min.js" },
];

try {
  mkdirSync(destDir, { recursive: true });
  for (const f of files) {
    copyFileSync(resolve(buildDir, f.src), resolve(destDir, f.dest));
  }
  console.log(
    `[copy-pdf-worker] copied ${files.map((f) => f.dest).join(", ")} -> public/pdfjs`,
  );
} catch (err) {
  console.error("[copy-pdf-worker] failed:", err.message);
  process.exit(1);
}
