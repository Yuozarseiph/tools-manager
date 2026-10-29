"use client";
import { AccessibleSelect } from "@/components/ui/AccessibleControls";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, FileUp, FolderOpen, Play, RotateCcw, ShieldCheck, Square, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AI_TOOLS, type AiToolId } from "@/data/ai-tools";
import { type Match, type DiffLine, type TextOptions, fence, projectExclusion, projectTree, isBinary } from "@/lib/ai-text";
import { htmlMarkdown } from "@/lib/document-markdown";
import { decodeText } from "@/lib/decode-text";
import { byteSize, readLocalFile, saveText, startActivity } from "@/lib/transfer";

type FileEntry = { file: File; path: string; selected: boolean; excluded: string | null };
export default function AiTool({ id }: { id: AiToolId }) {
  const { locale } = useLanguage(), fa = locale === "fa", meta = AI_TOOLS[id];
  const [input, setInput] = useState(""), [second, setSecond] = useState(""), [output, setOutput] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState(""), [copied, setCopied] = useState(false), [preview, setPreview] = useState(false);
  const [omittedExcluded, setOmittedExcluded] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]), [selected, setSelected] = useState<number[]>([]), [scanned, setScanned] = useState(false), [diff, setDiff] = useState<DiffLine[]>([]);
  const [options, setOptions] = useState<TextOptions>({ whitespace: true, persian: true, joinLines: false, size: 4000, overlap: 200, unit: "characters", ignoreSpace: false, ignoreCase: false });
  const worker = useRef<Worker | null>(null), controller = useRef<AbortController | null>(null), run = useRef(0), task = useRef<ReturnType<typeof startActivity> | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const upload = useRef<HTMLInputElement>(null), folder = useRef<HTMLInputElement>(null);
  const t = (persian: string, english: string) => fa ? persian : english;
  useEffect(() => () => { run.current++; controller.current?.abort(); worker.current?.terminate(); task.current?.fail(new DOMException("Cancelled", "AbortError")); if (timer.current) clearTimeout(timer.current); }, []);
  const cancel = () => { run.current++; controller.current?.abort(); worker.current?.terminate(); worker.current = null; task.current?.fail(new DOMException("Cancelled", "AbortError")); setBusy(false); };
  const clearResults = () => { setOutput(""); setMatches([]); setSelected([]); setScanned(false); setDiff([]); setError(""); };
  const changeInput = (value: string) => { setInput(value); clearResults(); };
  const errors: Record<string, [string, string]> = {
    INVALID_CHUNK_SIZE: ["اندازه بخش باید حداقل ۱۰ نویسه و هم‌پوشانی کوچک‌تر از آن باشد.", "Chunk size must be at least 10 characters and overlap must be smaller."],
    TOO_MANY_CHUNKS: ["تعداد بخش‌ها بیشتر از ۵۰۰ است؛ اندازه بخش را افزایش دهید.", "More than 500 chunks; increase the chunk size."],
    INVALID_CHAT: ["ساختار گفت‌وگو قابل تشخیص نیست. آرایه پیام‌های دارای role و content وارد کنید.", "Chat format not recognized. Provide messages with role and content."],
    DIFF_LIMIT: ["مقایسه به ۲۰۰۰ خط در هر ورودی محدود است.", "Comparison is limited to 2,000 lines per input."],
    TEXT_LIMIT: ["مجموع متن نباید از ۲ میلیون نویسه بیشتر باشد.", "Total input must not exceed 2 million characters."],
    TOO_MANY_MATCHES: ["بیش از ۱۰ هزار مورد یافت شد؛ متن را کوچک‌تر کنید.", "Over 10,000 matches; use a smaller input."],
  };
  const fail = (cause: unknown) => {
    if (cause instanceof Error && cause.name === "AbortError") return;
    const key = cause instanceof Error ? cause.message : "";
    setError(errors[key]?.[fa ? 0 : 1] ?? t("پردازش ناموفق بود. فرمت و اندازه فایل را بررسی کنید و دوباره تلاش کنید.", "Processing failed. Check file format and size, then retry."));
    task.current?.fail(cause); setBusy(false);
  };
  const selectFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list), isProject = id === "project-to-markdown";
    const entries = incoming.map(file => {
      const path = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
      const excluded = isProject ? projectExclusion(path) : !/\.(?:txt|md|html?|docx)$/i.test(file.name) ? "unsupported" : null;
      return { file, path, selected: !excluded, excluded };
    });
    const eligible = entries.filter(entry => !entry.excluded);
    const counted = isProject ? eligible : entries;
    if (counted.length > (isProject ? 300 : 20) || counted.reduce((sum, entry) => sum + entry.file.size, 0) > 20 * 1024 * 1024) { setError(t("حد مجاز: ۲۰ مگابایت، ۲۰ سند یا ۳۰۰ فایل مجاز پروژه (پس از حذف وابستگی‌ها).", "Limit: 20 MB, 20 documents or 300 eligible project files after exclusions.")); return; }
    clearResults();
    const excluded = entries.filter(entry => entry.excluded);
    setOmittedExcluded(isProject ? Math.max(0, excluded.length - 50) : 0);
    setFiles(isProject ? [...eligible, ...excluded.slice(0, 50)] : entries);
  };
  const begin = () => {
    clearResults(); setBusy(true); const current = ++run.current;
    controller.current = new AbortController();
    task.current = startActivity(meta[locale][0], "process", undefined, cancel);
    return current;
  };
  const read = async (file: File) => readLocalFile(file, controller.current!.signal);
  const convertFiles = async () => {
    const current = begin();
    try {
      const included = files.filter(entry => entry.selected && !entry.excluded);
      if (!included.length && !input.trim()) throw new Error("EMPTY");
      const parts: string[] = [], paths: string[] = [];
      for (let index = 0; index < included.length; index++) {
        const { file, path } = included[index]; const buffer = await read(file);
        if (run.current !== current) return;
        let result = "";
        if (id === "file-to-markdown" && /\.docx$/i.test(file.name)) {
          const mammoth = await import("mammoth");
          const document = await mammoth.convertToHtml({ arrayBuffer: buffer }, { convertImage: mammoth.images.imgElement(async () => ({ src: "", alt: t("تصویر سند", "Document image") })) });
          if (run.current !== current) return;
          result = htmlMarkdown(document.value);
        } else {
          const text = decodeText(buffer);
          if (isBinary(text)) throw new Error("BINARY_FILE");
          result = id === "project-to-markdown" ? fence(text, file.name.split(".").at(-1)) : /\.html?$/i.test(file.name) ? htmlMarkdown(text) : text;
        }
        paths.push(path); parts.push(`# ${path.replace(/[\r\n]/g, " ")}\n\n${result}`);
        task.current?.progress(index + 1, included.length);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (input.trim()) parts.unshift(id === "file-to-markdown" ? htmlMarkdown(input) : fence(input));
      if (current !== run.current) return;
      setOutput((id === "project-to-markdown" ? `# Project bundle\n\n## Files\n\n${fence(projectTree(paths), "text")}\n\n` : "") + parts.join("\n\n---\n\n"));
      task.current?.finish(); setBusy(false);
    } catch (cause) { if (current === run.current) fail(cause); }
  };
  const process = (redaction = false) => {
    if (!input.trim() && !(id === "text-diff" && second.trim())) { setError(t("ابتدا ورودی را وارد کنید.", "Provide input first.")); return; }
    if (input.length + second.length > 2000000) { setError(errors.TEXT_LIMIT[fa ? 0 : 1]); return; }
    // Keep scan matches intact until the worker receives the approved selection.
    const approved = matches.filter((_, index) => selected.includes(index));
    if (redaction && !approved.length) return;
    const current = redaction ? (() => { setBusy(true); const value = ++run.current; task.current = startActivity(meta[locale][0], "process", undefined, cancel); return value; })() : begin();
    worker.current?.terminate();
    const instance = new Worker(new URL("../../../lib/ai-text.worker.ts", import.meta.url)); worker.current = instance;
    instance.onerror = () => { if (run.current === current) fail(new Error("WORKER_FAILED")); instance.terminate(); };
    instance.onmessage = event => {
      instance.terminate(); if (run.current !== current) return;
      if (event.data.error) { fail(new Error(event.data.error)); return; }
      const value = event.data.result;
      if (id === "sensitive-data-redactor" && !redaction) { setMatches(value); setSelected(value.map((_: Match, index: number) => index)); setScanned(true); }
      else if (id === "text-diff") { setDiff(value); setOutput(value.map((line: DiffLine) => `${line.type === "added" ? "+" : line.type === "removed" ? "-" : " "} ${line.text}`).join("\n")); }
      else if (id === "text-chunker") setOutput(value.map((chunk: string, index: number) => `## ${t("بخش", "Chunk")} ${index + 1}\n\n${chunk}`).join("\n\n---\n\n"));
      else setOutput(value);
      task.current?.finish(); setBusy(false);
    };
    instance.postMessage({ mode: redaction ? "redact" : id, input, second, options, matches: approved });
  };
  const importText = async (file?: File) => {
    if (!file) return; if (file.size > 8 * 1024 * 1024) { setError(t("فایل متنی حداکثر ۸ مگابایت باشد.", "Text files must be at most 8 MB.")); return; }
    const current = begin();
    try { const text = decodeText(await read(file)); if (isBinary(text) || text.length > 2000000) throw new Error("TEXT_LIMIT"); if (current !== run.current) return; setInput(text); task.current?.finish(); setBusy(false); }
    catch (cause) { if (current === run.current) fail(cause); }
  };
  const isFiles = id === "file-to-markdown" || id === "project-to-markdown";
  const checkbox = (key: keyof TextOptions, label: string) => <label className="ai-option"><input type="checkbox" checked={Boolean(options[key])} disabled={busy} onChange={event => { setOptions(previous => ({ ...previous, [key]: event.target.checked })); clearResults(); }} />{label}</label>;
  return <section className="ai-workspace mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-6"><span className="guide-badges mb-3"><span><ShieldCheck className="h-4 w-4" />{t("پردازش محلی و بدون ثبت‌نام", "Local processing · no account")}</span></span><h1 className="text-2xl font-extrabold sm:text-3xl">{meta[locale][0]}</h1><p className="guide-copy mt-3 max-w-3xl">{meta[locale][1]}</p></header>
    <div className="guide-panel space-y-5" aria-busy={busy}>
      {isFiles ? <>
        <div data-activity-area="upload" className="ai-dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (!busy) selectFiles(event.dataTransfer.files); }}>
          <FileUp className="mx-auto mb-3 h-8 w-8 text-[var(--app-accent)]" aria-hidden="true" /><p>{t("فایل‌ها را اینجا رها کنید یا انتخاب کنید", "Drop files here or choose files")}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3"><button className="ai-button" disabled={busy} onClick={() => upload.current?.click()}>{t("انتخاب فایل‌ها", "Choose files")}</button>{id === "project-to-markdown" && <button className="ai-button" disabled={busy} onClick={() => folder.current?.click()}><FolderOpen className="h-4 w-4" />{t("انتخاب پوشه", "Choose folder")}</button>}</div>
          <input ref={upload} className="hidden" aria-label={t("انتخاب فایل‌ها", "Choose files")} type="file" multiple accept={id === "file-to-markdown" ? ".txt,.md,.html,.htm,.docx" : undefined} onChange={event => { if (event.target.files) selectFiles(event.target.files); event.target.value = ""; }} />
          <input ref={folder} className="hidden" aria-label={t("انتخاب پوشه", "Choose folder")} type="file" multiple {...{ webkitdirectory: "" }} onChange={event => { if (event.target.files) selectFiles(event.target.files); event.target.value = ""; }} />
          <p className="guide-copy mt-3 text-xs">{t("فایل‌ها به سرور آپلود نمی‌شوند. نوار انتقال، خواندن محلی را نشان می‌دهد.", "Files are never uploaded. Transfer progress represents local file reading.")}</p>
        </div>
        {files.length > 0 && <div><div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span>{files.filter(entry => entry.selected && !entry.excluded).length} / {files.length + omittedExcluded} · {byteSize(files.reduce((sum, entry) => sum + (entry.selected && !entry.excluded ? entry.file.size : 0), 0))}</span><button className="text-[var(--app-accent)]" disabled={busy} onClick={() => setFiles(previous => previous.map(entry => ({ ...entry, selected: !entry.excluded })))}>{t("انتخاب همه مجازها", "Select eligible files")}</button></div><ul className="max-h-60 divide-y divide-[var(--app-border)] overflow-auto rounded-xl border border-[var(--app-border)]">{files.map((entry, index) => <li key={`${entry.path}-${index}`} className="flex items-center gap-3 px-3 py-2 text-xs"><input type="checkbox" aria-label={entry.path} disabled={busy || !!entry.excluded} checked={entry.selected} onChange={event => { setFiles(previous => previous.map((item, i) => i === index ? { ...item, selected: event.target.checked } : item)); clearResults(); }} /><span className="min-w-0 flex-1 break-all" dir="auto">{entry.path}</span><span className="guide-copy shrink-0">{entry.excluded ? t("حذف: مسیر حساس، وابستگی یا فرمت نامجاز", `Excluded: ${entry.excluded}`) : byteSize(entry.file.size)}</span><button aria-label={t("حذف فایل", "Remove file")} disabled={busy} onClick={() => { setFiles(previous => previous.filter((_, i) => i !== index)); clearResults(); }}><X className="h-4 w-4" /></button></li>)}</ul></div>}
      </> : <div className={`grid gap-4 ${id === "text-diff" ? "lg:grid-cols-2" : ""}`}><label className="block text-sm font-semibold">{id === "text-diff" ? t("متن اولیه", "Original text") : t("متن ورودی", "Input text")}<textarea className="ai-textarea mt-2" dir="auto" value={input} disabled={busy} onChange={event => changeInput(event.target.value)} placeholder={id === "chat-to-markdown" ? 'User: Hello\nAssistant: Hi!' : t("متن را اینجا وارد کنید…", "Paste text here…")} /></label>{id === "text-diff" && <label className="block text-sm font-semibold">{t("متن جدید", "Revised text")}<textarea className="ai-textarea mt-2" dir="auto" value={second} disabled={busy} onChange={event => { setSecond(event.target.value); clearResults(); }} /></label>}</div>}
      {id === "file-to-markdown" && <label className="block text-sm font-semibold">{t("یا HTML را وارد کنید", "Or paste HTML")}<textarea className="ai-textarea mt-2 min-h-32" dir="auto" value={input} disabled={busy} onChange={event => changeInput(event.target.value)} placeholder="<h1>Title</h1><p>Content</p>" /></label>}
      {omittedExcluded > 0 && <p className="guide-copy text-xs">{omittedExcluded.toLocaleString(locale)} {t("فایل وابستگی یا نامجاز دیگر نیز بدون خواندن محتوا حذف شد.", "additional excluded files were skipped without reading their contents.")}</p>}
      <div className="flex flex-wrap items-center gap-4">
        {id === "text-cleaner" && <>{checkbox("whitespace", t("پاک‌سازی فاصله‌ها", "Clean whitespace"))}{checkbox("persian", t("یکسان‌سازی ی و ک", "Normalize Persian letters"))}{checkbox("joinLines", t("ادغام خطوط شکسته", "Join broken lines"))}</>}
        {id === "text-diff" && <>{checkbox("ignoreSpace", t("نادیده گرفتن فاصله‌ها", "Ignore whitespace"))}{checkbox("ignoreCase", t("نادیده گرفتن بزرگی حروف", "Ignore case"))}</>}
        {id === "text-chunker" && <><label className="ai-field">{t("واحد", "Unit")}<AccessibleSelect hasVisibleLabel fieldLabel={t("واحد", "Unit")} className="ai-input" value={options.unit} disabled={busy} onChange={event => { setOptions(previous => ({ ...previous, unit: event.target.value as TextOptions["unit"] })); clearResults(); }}><option value="characters">{t("نویسه", "Characters")}</option><option value="tokens">{t("توکن تخمینی (۳ نویسه)", "Estimated tokens (3 characters)")}</option></AccessibleSelect></label>{(["size", "overlap"] as const).map(key => <label className="ai-field" key={key}>{key === "size" ? t("اندازه هر بخش", "Chunk size") : t("هم‌پوشانی", "Overlap")}<input className="ai-input w-32" type="number" min={key === "size" ? 10 : 0} value={options[key]} disabled={busy} onChange={event => { setOptions(previous => ({ ...previous, [key]: Number(event.target.value) })); clearResults(); }} /></label>)}</>}
      </div>
      <div data-activity-area="input-actions" className="flex flex-wrap items-center gap-3">
        <button className="ai-button ai-primary" disabled={busy || (isFiles ? !input.trim() && !files.some(entry => entry.selected && !entry.excluded) : !input.trim() && !second.trim())} onClick={() => isFiles ? convertFiles() : process()}><Play className="h-4 w-4" />{id === "sensitive-data-redactor" ? t("جست‌وجوی موارد احتمالی", "Scan for matches") : t("اجرای ابزار", "Run tool")}</button>
        {busy && <button className="ai-button" onClick={cancel}><Square className="h-4 w-4" />{t("لغو پردازش", "Cancel")}</button>}
        {!isFiles && <><button type="button" className="ai-button" disabled={busy} onClick={() => upload.current?.click()}><FileUp className="h-4 w-4" />{t("ورود فایل متنی", "Import text file")}</button><input ref={upload} className="hidden" aria-label={t("ورود فایل متنی", "Import text file")} type="file" accept=".txt,.md,.json,.csv,.log" disabled={busy} onChange={event => { importText(event.target.files?.[0]); event.target.value = ""; }} /></>}
        <button className="ai-button" disabled={busy} onClick={() => { setInput(""); setSecond(""); setFiles([]); setOmittedExcluded(0); clearResults(); }}><RotateCcw className="h-4 w-4" />{t("پاک کردن", "Reset")}</button>
        {!isFiles && <span className="guide-copy ms-auto text-xs">{(input.length + second.length).toLocaleString(locale)} {t("نویسه", "characters")} · ~{Math.ceil((input.length + second.length) / 3).toLocaleString(locale)} {t("توکن تخمینی", "estimated tokens")}</span>}
      </div>
      {busy && <div role="status"><p className="mb-2 text-sm">{t("در حال پردازش؛ می‌توانید عملیات را لغو کنید…", "Processing; you can cancel this operation…")}</p><progress className="task-progress w-full" /></div>}
      {error && <p role="alert" className="rounded-xl bg-[var(--app-error-bg)] p-4 text-sm text-[var(--app-error-text)]">{error}</p>}
      <p className="guide-copy text-xs">{meta.limit[fa ? 0 : 1]}</p>
    </div>
    {scanned && id === "sensitive-data-redactor" && <div className="guide-panel mt-5 space-y-4"><h2 className="font-bold">{t("بازبینی موارد احتمالی", "Review potential matches")} ({matches.length.toLocaleString(locale)})</h2><p className="guide-copy text-sm">{t("تشخیص تضمینی نیست. هر مورد را بررسی کنید و سپس پوشاندن را تأیید کنید.", "Detection is not guaranteed. Review each match before applying redaction.")}</p><ul className="max-h-72 space-y-2 overflow-auto">{matches.map((match, index) => <li key={`${match.start}-${match.end}`}><label className="flex items-start gap-3 rounded-xl bg-[var(--app-secondary-bg)] p-3 text-sm"><input type="checkbox" disabled={busy} checked={selected.includes(index)} onChange={event => { setSelected(previous => event.target.checked ? [...previous, index] : previous.filter(item => item !== index)); setOutput(""); }} /><span className="min-w-0 break-all" dir="auto"><b>{match.kind}</b> · {match.value}</span></label></li>)}</ul>{!matches.length && <p role="status">{t("موردی با الگوهای فعلی پیدا نشد؛ متن را خودتان هم بازبینی کنید.", "No matches found with these patterns; manually review your text too.")}</p>}<button className="ai-button ai-primary" disabled={busy || !selected.length} onClick={() => process(true)}>{t("تأیید پوشاندن موارد انتخاب‌شده", "Apply selected redactions")} ({selected.length})</button></div>}
    {output && <div className="guide-panel mt-5 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">{t("خروجی", "Result")}</h2><div className="flex flex-wrap gap-2">{id !== "text-diff" && <button className="ai-button" onClick={() => setPreview(!preview)}>{preview ? t("کد Markdown", "Markdown source") : t("پیش‌نمایش", "Preview")}</button>}<button className="ai-button" onClick={async () => { try { await navigator.clipboard.writeText(output); setCopied(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 2000); } catch { setError(t("کپی ممکن نشد؛ از دانلود استفاده کنید.", "Clipboard unavailable; use download.")); } }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{t("کپی", "Copy")}</button><button className="ai-button" onClick={() => saveText(output, `${id}.${id === "text-diff" ? "diff" : "md"}`)}><Download className="h-4 w-4" />{t("دانلود", "Download")}</button></div></div>
      {id === "text-diff" ? <div className="max-h-[36rem] overflow-auto rounded-xl border border-[var(--app-border)] font-mono text-sm" dir="auto">{diff.map((line, index) => <div key={index} className={`flex gap-3 whitespace-pre-wrap break-all px-3 py-1 ${line.type === "added" ? "bg-[var(--app-success-bg)] text-[var(--app-success-text)]" : line.type === "removed" ? "bg-[var(--app-error-bg)] text-[var(--app-error-text)]" : ""}`}><span className="select-none" aria-label={line.type}>{line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}</span>{line.text || " "}</div>)}</div> : preview ? <div className="ai-preview max-h-[36rem] overflow-auto" dir="auto"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{ img: ({ alt }) => <span>[{alt}]</span>, a: ({ children }) => <span className="underline">{children}</span> }}>{output}</ReactMarkdown></div> : <label className="block"><span className="sr-only">{t("متن خروجی", "Output text")}</span><textarea className="ai-textarea" dir="auto" readOnly value={output} /></label>}
    </div>}
  </section>;
}
