import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
const files = [
  ["node_modules/tesseract.js/dist/worker.min.js", "public/runtime/ocr-v7/worker.min.js"],
  ...["lstm", "simd-lstm", "relaxedsimd-lstm"].map(variant => [`node_modules/tesseract.js-core/tesseract-core-${variant}.wasm.js`, `public/runtime/ocr-v7/tesseract-core-${variant}.wasm.js`]),
  ...["ffmpeg-core.js", "ffmpeg-core.wasm"].map(name => [`node_modules/@ffmpeg/core/dist/umd/${name}`, `public/runtime/ffmpeg-v0.12.10/${name}`]),
  ...["eng", "fas"].flatMap(language => [
    [`node_modules/@tesseract.js-data/${language}/4.0.0_best_int/${language}.traineddata.gz`, `public/runtime/ocr-v7/languages/balanced/${language}.traineddata.gz`],
    [`node_modules/@tesseract.js-data/${language}/4.0.0/${language}.traineddata.gz`, `public/runtime/ocr-v7/languages/accurate/${language}.traineddata.gz`],
  ]),
];
for (const [source, destination] of files) { mkdirSync(dirname(destination), { recursive: true }); copyFileSync(source, destination); }
const manifest = Object.fromEntries(files.map(([source, destination]) => [destination.replace(/^public/, ""), { size: statSync(source).size, hash: createHash("sha256").update(readFileSync(source)).digest("hex").slice(0, 16) }]));
writeFileSync("public/runtime/manifest.json", JSON.stringify(manifest));
writeFileSync("public/runtime/README.txt", "Public processing runtime files. Generated from the project's locked npm dependencies; include this folder when deploying out/. No user files are stored here.\n");
console.log(`[copy-processing-runtime] copied ${files.length} engine/model files for same-origin, on-demand downloads`);
