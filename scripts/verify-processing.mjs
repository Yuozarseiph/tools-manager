import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createServer } from "node:http";
import { JSDOM } from "jsdom";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), dom = new JSDOM(""), events = new EventTarget();
const shared = { window: events, document: dom.window.document, DOMParser: dom.window.DOMParser, Node: dom.window.Node, Element: dom.window.Element, HTMLElement: dom.window.HTMLElement, File: dom.window.File, FileReader: dom.window.FileReader, Blob, TextDecoder, TextEncoder, CustomEvent, crypto, Date, Error, DOMException, Event, Response, AbortController, Uint8Array, ArrayBuffer, URL, setTimeout, clearTimeout, fetch, Promise };
function load(file, overrides = {}) {
  const exports = {};
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }, fileName: file }).outputText;
  vm.runInNewContext(compiled, { ...shared, exports, require, ...overrides }, { filename: file }); return exports;
}
const core = load("src/lib/ai/ai-text.ts");
const markdown = load("src/lib/ai/document-markdown.ts", { require: name => name === "./ai-text" ? core : require(name) });
const source = '<h1>Title</h1><p>Hello <b>bold</b> <a href="javascript:alert(1)">bad</a></p><table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table><pre><code>const x = `a`;</code></pre><script>BAD_SCRIPT</script><img src="https://invalid.example/image.png" alt="Image">';
const md = markdown.htmlMarkdown(source);
assert(md.includes("# Title")); assert(md.includes("**bold**")); assert(md.includes("| A | B |")); assert(md.includes("const x = `a`;")); assert(!md.includes("javascript:")); assert(!md.includes("BAD_SCRIPT")); assert(!md.includes("https://invalid.example"));
const parser = load("src/features/tools/presentation/html-to-pptx/HtmlParser.tsx", { window: dom.window });
const parsed = parser.parseHtmlToSlides('<style>h1{color:#123456}</style><section class="slide"><h1>Title</h1><p dir="rtl">سلام <a href="https://example.com/">پیوند</a></p><ul><li>Parent<ol start="3"><li>Child</li></ol></li></ul><pre>first\nsecond</pre><table><tr><th colspan="2">Header</th></tr><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></table></section>');
assert.equal(parsed.length, 1);
const blocks = parsed[0].blocks;
assert.equal(blocks.find(block => block.kind === "code").text, "first\nsecond");
assert.equal(blocks.find(block => block.kind === "heading").css.color, "#123456");
assert.equal(blocks.find(block => block.text?.includes("سلام")).css.direction, "rtl");
assert(blocks.find(block => block.text?.includes("سلام")).runs.some(run => run.options?.hyperlink?.url === "https://example.com/"));
assert.equal(blocks.filter(block => block.kind === "listItem").length, 2);
assert.equal(blocks.find(block => block.text === "Parent").listLevel, 1);
assert.equal(blocks.find(block => block.text === "Child").listNumber, 3);
assert.equal(blocks.find(block => block.kind === "table").colSpans[0][0], 2);
assert.equal(blocks.find(block => block.kind === "table").rowSpans[1][0], 2);
assert(parser.parseHtmlToSlides("plain text")[0].blocks[0].text === "plain text");
const decoder = load("src/lib/files/decode-text.ts");
assert.equal(decoder.decodeText(new Uint8Array([255, 254, 65, 0, 66, 0]).buffer), "AB");
assert.equal(decoder.decodeText(new Uint8Array([254, 255, 0, 65, 0, 66]).buffer), "AB");
const names = load("src/lib/files/output-name.ts");
const origins = load("src/lib/files/activity-origin.ts");
const fileExport = load("src/lib/files/file-export.ts", { require: name => name === "./output-name" ? names : name === "./activity-origin" ? origins : require(name) });
const transfer = load("src/lib/files/transfer.ts", { require: name => name === "./file-export" ? fileExport : name === "./activity-origin" ? origins : require(name) }), observed = [];
events.addEventListener(transfer.activityEvent, event => observed.push(event.detail));
const restore = transfer.observeFileReads("Reading file");
const input = new dom.window.File(["Hello فارسی"], "input.txt", { type: "text/plain" });
assert.equal(await input.text(), "Hello فارسی");
assert.equal(new TextDecoder().decode(await input.arrayBuffer()), "Hello فارسی");
assert(observed.some(task => task.kind === "read" && task.status === "done" && task.done === input.size));
restore();
const payload = Buffer.alloc(6 * 4096, 65);
const server = createServer((request, response) => {
  if (request.url === "/error") { response.writeHead(503); response.end("Unavailable"); return; }
  response.setHeader("content-type", "application/octet-stream");
  if (request.url === "/known") response.setHeader("content-length", payload.length);
  let offset = 0;
  const timer = setInterval(() => { response.write(payload.subarray(offset, offset + 4096)); offset += 4096; if (offset >= payload.length) { clearInterval(timer); response.end(); } }, 40);
  response.on("close", () => clearInterval(timer));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const known = await transfer.downloadBlob(`${base}/known`, "Known");
  assert.equal(known.size, payload.length); assert.equal(await known.text(), payload.toString());
  assert(observed.some(task => task.name === "Known" && task.status === "running" && task.total === payload.length && task.done > 0));
  const unknown = await transfer.downloadBlob(`${base}/unknown`, "Unknown");
  assert.equal(unknown.size, payload.length);
  assert(observed.some(task => task.name === "Unknown" && task.status === "running" && task.total === undefined));
  const manifest = await transfer.downloadBlob(`${base}/unknown`, "Manifest", undefined, payload.length);
  assert.equal(manifest.size, payload.length);
  assert(observed.some(task => task.name === "Manifest" && task.done === 0 && task.total === payload.length));
  const controller = new AbortController();
  const cancel = event => { if (event.detail.name === "Abort" && event.detail.done > 0) controller.abort(); };
  events.addEventListener(transfer.activityEvent, cancel);
  await assert.rejects(() => transfer.downloadBlob(`${base}/unknown`, "Abort", controller.signal));
  events.removeEventListener(transfer.activityEvent, cancel);
  assert.equal(observed.filter(task => task.name === "Abort").at(-1).status, "cancelled");
  await assert.rejects(() => transfer.downloadBlob(`${base}/error`, "Error"));
  assert.equal(observed.filter(task => task.name === "Error").at(-1).status, "error");
  const cacheEntries = new Map();
  let downloads = 0;
  const runtimePath = "/runtime/ffmpeg-v0.12.10/ffmpeg-core.wasm";
  const cache = {
    match: async url => cacheEntries.get(url)?.clone(),
    put: async (url, response) => cacheEntries.set(url, response.clone()),
    keys: async () => [...cacheEntries.keys()].map(path => ({ url: new URL(path, base).href })),
    delete: async request => cacheEntries.delete(request.url.replace(base, "")),
  };
  const runtime = load("src/lib/files/transfer.ts", {
    caches: { open: async () => cache },
    fetch: async (path, options) => {
      if (path === "/runtime/manifest.json") return Response.json({ [runtimePath]: { size: payload.length, hash: "v1" } });
      downloads++;
      return fetch(new URL(path, base), options);
    },
    require: name => name === "./file-export" ? fileExport : name === "./activity-origin" ? origins : require(name),
  });
  const first = await runtime.downloadResource(runtimePath, "Engine");
  const second = await runtime.downloadResource(runtimePath, "Engine");
  assert.equal(first.size, payload.length);
  assert.equal(second.size, payload.length);
  assert.equal(downloads, 1, "a second engine load must use the versioned cache");
  assert.equal(observed.filter(task => task.name === "Engine").at(-1).cached, true);
  assert.equal(await runtime.hasRuntimeCache("audio"), true);
  await runtime.clearRuntimeCache("audio");
  assert.equal(await runtime.hasRuntimeCache("audio"), false);
  await runtime.downloadResource(runtimePath, "Engine");
  assert.equal(downloads, 2, "deleting the saved resource should permit another download");
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
console.log("Processing checks passed: safe HTML/Markdown, PPTX CSS/RTL/links/lists/code/merges, UTF-16 BOM, single native file reads, streamed download bytes, known/unknown/manifest totals, cancellation and HTTP errors.");

const uploadDom = new JSDOM("<div id='root'></div>", { url: "http://localhost:3000/en" });
uploadDom.window.matchMedia = query => ({ matches: query === "(width < 640px)" });
globalThis.window = uploadDom.window;
globalThis.document = uploadDom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createElement: h, act } = require("react");
const { createRoot } = require("react-dom/client");
const uploadWidgets = load("src/components/ui/FileTransfer.tsx", {
  window: uploadDom.window,
  document: uploadDom.window.document,
  require: name => {
    if (name === "@/providers/LanguageContext") return { useLanguage: () => ({ locale: "en" }) };
    if (name === "@/lib/files/decode-text") return decoder;
    if (name === "@/lib/files/transfer") return transfer;
    return require(name);
  },
});
const received = [], reads = [];
const fileA = new uploadDom.window.File(["aaaa"], "alpha.txt");
fileA.stream = () => new ReadableStream({ start(controller) { reads.push(controller); } });
const fileB = new uploadDom.window.File(["bbbb"], "beta.txt");
fileB.stream = () => new Blob(["bbbb"]).stream();
const onReady = files => received.push(files.map(({ file }) => file.name).join(","));
const uploadRoot = createRoot(document.getElementById("root"));
await act(async () => uploadRoot.render(h(uploadWidgets.default, { multiple: true, onReady })));
const drop = document.querySelector('[data-file-control="drop"]');
const event = new uploadDom.window.Event("drop", { bubbles:true, cancelable:true });
Object.defineProperty(event, "dataTransfer", { value: { files: [fileA, fileB] } });
await act(async () => { drop.dispatchEvent(event); });
assert.equal(document.querySelectorAll(".file-transfer-list li").length, 2);
assert.equal(document.querySelectorAll(".file-transfer-list progress").length, 2);
assert.equal(received.length, 0, "a batch is handed off once its pending reads are settled");
await act(async () => document.querySelector('.file-transfer-list li button').click());
assert.equal(received.join(","), "beta.txt", "cancelling one file must preserve the other");
const alpha = document.querySelector(".file-transfer-list li");
assert(alpha.textContent.includes("Cancelled"));
await act(async () => [...alpha.querySelectorAll("button")].find(button => button.textContent === "Retry").click());
assert.equal(reads.length, 2);
await act(async () => {
  reads[1].enqueue(new Uint8Array([1,2,3,4]));
  reads[1].close();
});
assert.equal(received.join(","), "beta.txt,alpha.txt");
await act(async () => [...alpha.querySelectorAll("button")].find(button => button.textContent === "Dismiss").click());
assert.equal(document.querySelectorAll(".file-transfer-list li").length, 1);
assert(!document.body.textContent.includes("Use ready files"));
await act(async () => { await new Promise(resolve => setTimeout(resolve, 1550)); });
assert.equal(document.querySelectorAll(".file-transfer-list li").length, 0, "ready status should clear automatically on mobile");
await act(async () => uploadRoot.unmount());
uploadDom.window.close();
console.log("Transfer UX passed: independent file progress, drop handling, cancellation, retry, dismissal and automatic batch delivery and faster mobile dismissal.");
