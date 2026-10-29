# AI preparation tools and processing UI

Seven active tools are registered under `ai`, with Persian/English pages, specific guides, limitations, FAQs, related links, Markdown equivalents, social images, canonical/hreflang metadata and sitemap inclusion:

- `file-to-markdown`: TXT, MD, HTML and DOCX conversion with safe GFM preview. PDF/OCR is intentionally a separate workflow. UTF-8 and BOM-marked UTF-16 text are supported.
- `project-to-markdown`: folder/multiple-file selection, dependency and sensitive-path exclusion before applying limits, explicit selection, a directory tree and safe code fences. Exclusions are pattern-based; users still review output before sharing it.
- `text-cleaner`: configurable whitespace, Persian character normalization and optional line joining.
- `text-chunker`: paragraph-aware chunk boundaries, configurable overlap and character/estimated-token units. Token estimates use three characters per token; no model-specific tokenizer is claimed.
- `chat-to-markdown`: role-labelled Persian/English text and message-array JSON, with fenced-code protection.
- `text-diff`: bounded line-based LCS comparison, additions/deletions and optional case/whitespace normalization.
- `sensitive-data-redactor`: pattern detection followed by explicit per-match approval. Names/addresses and all secret formats are not covered.

Text operations run in disposable Web Workers. Cancellation terminates the worker, stale results are ignored and inputs are not persisted. Document batches run sequentially with size limits and event-loop yields; DOCX conversion itself is a library operation, so cancellation suppresses its result rather than interrupting decompression mid-call.

File-reading and resource-download status appears beside the relevant input/output controls, with separate short inline processing messages. There is no floating activity panel. Native FileReader progress and File.text()/arrayBuffer() use a single native read; local reading is not a server upload. The streamed downloader reports bytes and transfer speed while running, supports AbortController and uses indeterminate progress when total size is unknown. A generated size/hash manifest supplies totals for bundled resources even when HTTP compression hides Content-Length. Resource caches contain only public engines/models, never user input.

Downloadable results use the shared save dialog once the file is ready. Users choose a filename at that point; extensions follow the output format and cancelling starts no download. There is no filename field above the tools. See [Current interface and file exports](current-interface-and-exports.md).

Before dev/build, `scripts/copy-processing-runtime.mjs` copies FFmpeg, Tesseract's worker/embedded-WASM variants and Persian/English traineddata into `public/runtime/`. These large assets are excluded from PWA precaching and fetched only on demand. **Deploy the entire `out/` including `runtime/`.** Background-removal resource progress is provided by the library callback; that library still obtains its model from its configured upstream host.

HTML/Markdown-to-PPTX now supports editable and visual export. Editable output measures and paginates text, keeps inline formatting/hyperlinks and RTL, handles nested list numbering, draws paginated vector tables with merged cells and repeats headers. Oversized table groups fall back to text with a warning to preserve content. Image sizing preserves aspect ratio without upscaling. Final numbering includes overflow slides. Settings include direction, fonts, CSS preservation, margins, footers, author, notes, image permissions and visual resolution. Full-document uploads retain head CSS.

Visual export uses a script-disabled, same-origin sandbox and restrictive CSP; it captures rendered content as images. Long pages are sliced; `.slide` / `[data-slide]` sections control boundaries. It does not make slide text editable, and unsupported html2canvas CSS or inaccessible images may affect fidelity. External images require explicit opt-in and CORS. Fonts are not embedded.

Validation commands:

```text
npm run verify-ai-tools
npm run verify-processing
npx tsc --noEmit
npm run build
npm run verify-seo
npm run verify-apache -- http://127.0.0.1:4186
```

Broader processing smoke-test scenarios include all seven new tools, actual TXT/DOCX conversion, explicit redaction selection, project secret-file exclusion, OCR from same-origin models, FFmpeg initialization and real MP4-to-MP3 extraction. A synthetic bilingual HTML fixture exercises long text, nested lists, code, hyperlinks and a 35-row table. Those broader scenarios are not all re-run for each UI revision. The October 26 checks and their limits are recorded in [Current interface and file exports](current-interface-and-exports.md).
