"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/providers/LanguageContext";
import FileTransfer from "@/components/ui/FileTransfer";
import { AccessibleSelect } from "@/components/ui/AccessibleControls";
import { AI_TOOLS } from "@/config/ai-tools";
import { decodeText } from "@/lib/files/decode-text";
import { htmlMarkdown } from "@/lib/ai/document-markdown";
import { fence, isBinary } from "@/lib/ai/ai-text";
import { readLocalFile, saveText } from "@/lib/files/transfer";
import {
  compareResponses, extractFiles, fillPrompt, finishInput,
  prepareInput, PROMPT_FIELDS, promptVariables, WORKFLOW_LIMIT,
  type PromptTemplate, type WorkflowId,
} from "@/lib/ai/ai-workflows";

type Translate = (fa: string, en: string) => string;

export default function AiWorkflow({ id }: { id: WorkflowId }) {
  const { locale } = useLanguage();
  const t: Translate = (fa, en) => locale === "fa" ? fa : en;
  const [title, description] = AI_TOOLS[id][locale];
  return <section className="ai-workspace mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <header className="mb-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      <p className="guide-copy mt-3 max-w-3xl">{description}</p>
    </header>
    {id === "ai-input-preparer" && <InputPreparer t={t} />}
    {id === "ai-response-review" && <ResponseReview t={t} />}
    {id === "ai-output-extractor" && <OutputExtractor t={t} />}
    {id === "prompt-builder" && <PromptBuilder t={t} />}
  </section>;
}

const TEXT_INPUT_TYPES = /\.(?:txt|md|markdown|json|csv|tsv|xml|log|ya?ml)$/i;

function TextField({ label, value, onChange, maxLength = WORKFLOW_LIMIT, compact = false, inputActions }: {
  label: string; value: string; onChange: (value: string) => void; maxLength?: number;
  compact?: boolean; inputActions?: Translate;
}) {
  const id = useId();
  const control = useRef<HTMLTextAreaElement>(null);
  const sequence = useRef(0);
  const fileRead = useRef<AbortController | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => () => { sequence.current++; fileRead.current?.abort(); }, []);
  const t = inputActions;

  function changeText(text: string) {
    sequence.current++;
    fileRead.current?.abort();
    setMessage("");
    onChange(text);
  }

  async function importText(file: File) {
    if (!t) return;
    const current = ++sequence.current;
    fileRead.current?.abort();
    const controller = new AbortController();
    fileRead.current = controller;
    setMessage("");
    try {
      const text = decodeText(await readLocalFile(file, controller.signal));
      if (sequence.current !== current) return;
      if (isBinary(text) || text.length > maxLength) {
        setMessage(t("این فایل متنی نیست یا از حد نویسهٔ این کادر بیشتر است.", "Use a text file within this field’s character limit."));
        return;
      }
      changeText(text);
      control.current?.focus();
    } catch {
      if (sequence.current === current) setMessage(t("فایل خوانده نشد. دوباره تلاش کنید.", "Could not read the file. Try again."));
    } finally {
      if (fileRead.current === controller) fileRead.current = null;
    }
  }

  async function paste() {
    if (!t) return;
    const current = ++sequence.current;
    fileRead.current?.abort();
    try {
      const text = await navigator.clipboard.readText();
      if (sequence.current !== current) return;
      if (!text) setMessage(t("متنی در کلیپ‌بورد نیست.", "There is no text on the clipboard."));
      else if (text.length > maxLength) setMessage(t("متن کلیپ‌بورد از حد نویسهٔ این کادر بیشتر است.", "Clipboard text exceeds this field’s character limit."));
      else changeText(text);
      control.current?.focus();
    } catch {
      if (sequence.current !== current) return;
      setMessage(t("برای چسباندن متن، Ctrl+V یا Command+V را بزنید.", "Press Ctrl+V or Command+V to paste."));
      control.current?.focus();
    }
  }

  return <div className="min-w-0">
    <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
    <textarea id={id} ref={control} className={`ai-textarea mt-2 ${compact ? "!min-h-24" : ""}`} dir="auto"
      value={value} maxLength={maxLength} onChange={event => changeText(event.target.value)}
      aria-describedby={message ? `${id}-status` : undefined} />
    {t && <div className="mt-2 flex flex-wrap items-start gap-2" role="group" aria-label={label}>
      <FileTransfer compact accept=".txt,.md,.markdown,.json,.csv,.tsv,.xml,.log,.yaml,.yml"
        pickerLabel={t("ورود فایل متنی", "Import text file")}
        validate={file => file.size <= 2 * 1024 * 1024 && TEXT_INPUT_TYPES.test(file.name)}
        onReady={([{ file }]) => void importText(file)} />
      <button type="button" className="ai-button" onClick={() => void paste()}>{t("چسباندن", "Paste")}</button>
    </div>}
    {message && <p id={`${id}-status`} role="status" className="guide-copy mt-2 text-sm">{message}</p>}
  </div>;
}

function Output({ label, children, text, filename, mime, t }: {
  label: string; children?: ReactNode; text: string; filename: string; mime?: string; t: Translate;
}) {
  const id = useId();
  const [message, setMessage] = useState("");
  return <section className="guide-panel min-w-0 space-y-3" data-activity-area="output" aria-labelledby={id}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id={id} className="font-bold">{label}</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="ai-button" onClick={async () => {
          try {
            await navigator.clipboard.writeText(text.replace(/^\uFEFF/, ""));
            setMessage(t("کپی شد.", "Copied."));
          } catch { setMessage(t("کپی انجام نشد. متن را دستی انتخاب کنید.", "Copy failed. Select the text manually.")); }
        }}>{t("کپی", "Copy")}</button>
        <button data-file-control="download" type="button" className="ai-button" onClick={() => void saveText(text, filename, mime)}>
          {t("دانلود", "Download")}
        </button>
      </div>
    </div>
    {children}
    <textarea aria-labelledby={id} className="ai-textarea" dir="auto" readOnly value={text.replace(/^\uFEFF/, "")} />
    {message && <p role="status" className="guide-copy text-sm">{message}</p>}
  </section>;
}

function InputPreparer({ t }: { t: Translate }) {
  const [input, setInput] = useState("");
  const [clean, setClean] = useState(false);
  const [budget, setBudget] = useState("");
  const [review, setReview] = useState<ReturnType<typeof prepareInput>>();
  const [approved, setApproved] = useState<ReadonlySet<number>>(new Set());
  const [result, setResult] = useState<ReturnType<typeof finishInput>>();
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);

  function changeInput(value: string) {
    setInput(value);
    setReview(undefined);
    setResult(undefined);
    setError("");
  }

  async function importFile(file: File) {
    setError("");
    setReading(true);
    try {
      if (file.size > 2 * 1024 * 1024 || !/\.(txt|md|html?|docx)$/i.test(file.name)) throw new Error();
      const buffer = await readLocalFile(file);
      let text: string;
      if (/\.docx$/i.test(file.name)) {
        const mammoth = await import("mammoth");
        const doc = await mammoth.convertToHtml({ arrayBuffer: buffer }, {
          convertImage: mammoth.images.imgElement(async () => ({ src: "", alt: t("تصویر سند", "Document image") })),
        });
        text = htmlMarkdown(doc.value);
      } else {
        text = decodeText(buffer);
        if (isBinary(text)) throw new Error();
        if (/\.html?$/i.test(file.name)) text = htmlMarkdown(text);
      }
      if (text.length > WORKFLOW_LIMIT || !text.trim()) throw new Error();
      changeInput(text);
    } catch {
      setError(t("فایل خوانده نشد. فایل TXT، MD، HTML یا DOCX تا ۲ مگابایت و ۲۰۰ هزار نویسه انتخاب کنید.",
        "Could not read the file. Use a TXT, MD, HTML or DOCX file up to 2 MB and 200,000 characters."));
    } finally { setReading(false); }
  }

  return <div className="space-y-4">
    <div className="guide-panel space-y-4">
      <fieldset disabled={reading} className="space-y-4">
        <TextField label={t("متن ورودی", "Input text")} value={input} onChange={changeInput} />
        <FileTransfer accept=".txt,.md,.html,.htm,.docx" disabled={reading}
          validate={file => file.size <= 2 * 1024 * 1024 && /\.(txt|md|html?|docx)$/i.test(file.name)}
          onReady={([{ file }]) => void importFile(file)} />
        <label className="ai-option"><input type="checkbox" checked={clean} onChange={event => {
          setClean(event.target.checked);
          setReview(undefined);
          setResult(undefined);
        }} />{t("پاک‌سازی فاصله‌ها و یکسان‌سازی حروف فارسی", "Clean whitespace and normalize Persian letters")}</label>
        <button className="ai-button ai-primary" disabled={!input.trim()} onClick={() => {
          setError("");
          setResult(undefined);
          try {
            const data = prepareInput(input, clean);
            setReview(data);
            setApproved(new Set(data.matches.map((_, index) => index)));
          } catch { setError(t("تعداد موارد زیاد است. متن کوتاه‌تری وارد کنید.", "Too many matches. Try a smaller input.")); }
        }}>{t("بازبینی اطلاعات حساس", "Review sensitive data")}</button>
      </fieldset>
    </div>
    {error && <p role="alert" className="guide-panel">{error}</p>}
    {review && <div className="guide-panel space-y-4">
      <h2 className="font-bold">{t("بازبینی متن", "Review text")}</h2>
      <textarea className="ai-textarea" dir="auto" readOnly aria-label={t("متن برای بازبینی", "Text to review")} value={review.source} />
      <p className="guide-copy text-sm">{t("مواردی را که باید پوشانده شوند انتخاب کنید. تشخیص خودکار ممکن است همهٔ موارد را پیدا نکند.", "Select what should be redacted. Automatic detection can miss sensitive information.")}</p>
      {review.matches.length ? <ul className="max-h-56 space-y-2 overflow-auto">
        {review.matches.map((match, index) => <li key={match.start}>
          <label className="ai-option min-w-0"><input type="checkbox" checked={approved.has(index)} onChange={event => {
            const next = new Set(approved);
            if (event.target.checked) next.add(index); else next.delete(index);
            setApproved(next);
            setResult(undefined);
          }} /><bdi className="min-w-0 break-all">{match.value.slice(0, 150)}</bdi></label>
        </li>)}
      </ul> : <p>{t("موردی شناسایی نشد.", "No matches found.")}</p>}
      <form className="flex flex-wrap items-end gap-3" onSubmit={event => {
        event.preventDefault();
        setError("");
        setChunkIndex(0);
        try { setResult(finishInput(review.source, review.matches.filter((_, index) => approved.has(index)), budget === "" ? undefined : Number(budget))); }
        catch { setError(t("تقسیم متن ممکن نبود. بودجهٔ بیشتری وارد کنید.", "Could not split the text. Use a larger budget.")); }
      }}>
        <label className="ai-field">{t("بودجهٔ تقریبی توکن هر بخش (اختیاری)", "Estimated token budget per chunk (optional)")}
          <input className="ai-input" type="number" min={10} max={60000} step={1} value={budget} onChange={event => {
            setBudget(event.target.value);
            setResult(undefined);
          }} />
        </label>
        <button className="ai-button ai-primary">{t("آماده‌سازی خروجی", "Prepare output")}</button>
      </form>
      <p className="guide-copy text-sm">{t("تخمین بر پایهٔ هر ۳ نویسه است و شمارش واقعی مدل نیست.", "The estimate uses three characters per token. Actual counts vary by model.")}</p>
    </div>}
    {result && <Output key={result.text} t={t} label={t("متن آماده", "Prepared text")} text={result.text} filename="ai-input.md">
      <p className="guide-copy text-sm">{t("توکن تخمینی", "Estimated tokens")}: {result.estimatedTokens.toLocaleString()}</p>
    </Output>}
    {!!result?.chunks.length && <div className="space-y-3">
      <AccessibleSelect fieldLabel={t("انتخاب بخش", "Choose chunk")} className="ai-input" value={chunkIndex}
        onChange={event => setChunkIndex(Number(event.target.value))}>
        {result.chunks.map((_, index) => <option key={index} value={index}>
          {t("بخش", "Chunk")} {index + 1} / {result.chunks.length}
        </option>)}
      </AccessibleSelect>
      <Output key={chunkIndex} t={t} label={`${t("بخش", "Chunk")} ${chunkIndex + 1}`}
        text={result.chunks[chunkIndex]} filename={`ai-input-${chunkIndex + 1}.md`} />
    </div>}
  </div>;
}

const SCORE_FIELDS = ["a", "b"] as const;
type Score = { a: string; b: string };
function ResponseReview({ t }: { t: Translate }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [criteria, setCriteria] = useState(t("دقت\nکامل بودن\nرعایت قالب", "Accuracy\nCompleteness\nFormat"));
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [notes, setNotes] = useState("");
  const [diff, setDiff] = useState<ReturnType<typeof compareResponses>>();
  const [error, setError] = useState("");
  const labels = [...new Set(criteria.split("\n").map(line => line.trim()).filter(Boolean))].slice(0, 12);
  const report = [
    `## ${t("ارزیابی پاسخ‌ها", "Response review")}`,
    ...labels.map(label => `- ${label}: A ${(Object.hasOwn(scores, label) ? scores[label].a : "") || "–"} / 5 · B ${(Object.hasOwn(scores, label) ? scores[label].b : "") || "–"} / 5`),
    notes.trim() && `\n## ${t("یادداشت‌ها", "Notes")}\n\n${notes.trim()}`,
    `\n## ${t("پاسخ", "Response")} A\n\n${fence(a, "text")}`,
    `\n## ${t("پاسخ", "Response")} B\n\n${fence(b, "text")}`,
  ].filter(Boolean).join("\n");
  return <div className="space-y-4">
    <div className="guide-panel space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField inputActions={t} label={t("پاسخ A", "Response A")} value={a} onChange={value => { setA(value); setDiff(undefined); setError(""); }} />
        <TextField inputActions={t} label={t("پاسخ B", "Response B")} value={b} onChange={value => { setB(value); setDiff(undefined); setError(""); }} />
      </div>
      <button type="button" className="ai-button ai-primary" disabled={!a.trim() || !b.trim()} onClick={() => {
        setError("");
        try { setDiff(compareResponses(a, b)); }
        catch { setError(t("هر پاسخ حداکثر ۲۰۰۰ خط باشد.", "Use no more than 2,000 lines per response.")); }
      }}>{t("نمایش تفاوت‌ها", "Show differences")}</button>
      {error && <p role="alert">{error}</p>}
      {diff && <div>
        <p role="status">{diff.lines.length
          ? `${diff.added} ${t("اضافه", "added")} · ${diff.removed} ${t("حذف", "removed")}`
          : t("تفاوتی پیدا نشد.", "No differences found.")}</p>
        {diff.lines.length > 0 && <ol className="mt-2 max-h-64 overflow-auto rounded-lg border border-[var(--app-border)] p-3 font-mono text-sm">
          {diff.lines.map((line, index) => <li key={index} dir="auto" className="break-all whitespace-pre-wrap">
            <bdi>{line.type === "added" ? "+" : "−"}</bdi> {line.text}
          </li>)}
        </ol>}
      </div>}
    </div>
    <div className="guide-panel space-y-4">
      <TextField compact label={t("معیارها (هر معیار در یک خط، حداکثر ۱۲)", "Criteria (one per line, up to 12)")}
        value={criteria} onChange={setCriteria} maxLength={1200} />
      <p className="guide-copy text-sm">{t("خودتان به هر پاسخ از ۱ تا ۵ امتیاز بدهید.", "Score each response yourself from 1 to 5.")}</p>
      {labels.map(label => <fieldset key={label} className="flex flex-wrap gap-3">
        <legend className="mb-2 text-sm font-semibold break-all">{label}</legend>
        {SCORE_FIELDS.map(key => <label key={key} className="ai-field">{t("امتیاز", "Score")} {key.toUpperCase()}
          <input className="ai-input w-24" type="number" min={1} max={5} step={1} value={Object.hasOwn(scores, label) ? scores[label][key] : ""}
            onChange={event => {
              const { value, validity } = event.currentTarget;
              if (value && !validity.valid) return;
              setScores(old => ({ ...old, [label]: { ...(Object.hasOwn(old, label) ? old[label] : { a: "", b: "" }), [key]: value } }));
            }} />
        </label>)}
      </fieldset>)}
      <TextField compact label={t("یادداشت‌ها", "Notes")} value={notes} onChange={setNotes} maxLength={8000} />
    </div>
    {!!a.trim() && !!b.trim() && <Output t={t} label={t("گزارش مقایسه", "Review report")} text={report} filename="ai-response-review.md" />}
  </div>;
}

function OutputExtractor({ t }: { t: Translate }) {
  const [source, setSource] = useState("");
  const [result, setResult] = useState<ReturnType<typeof extractFiles>>();
  const [error, setError] = useState("");
  return <div className="space-y-4">
    <div className="guide-panel space-y-4">
      <TextField inputActions={t} label={t("پاسخ هوش مصنوعی", "AI response")} value={source} onChange={value => {
        setSource(value); setResult(undefined); setError("");
      }} />
      <button className="ai-button ai-primary" disabled={!source.trim()} onClick={() => {
        setError("");
        try { setResult(extractFiles(source)); }
        catch { setError(t("خروجی بلوک‌های زیادی دارد. متن را در چند نوبت وارد کنید.", "Too many blocks. Process the response in smaller parts.")); }
      }}>{t("استخراج فایل‌ها", "Extract files")}</button>
    </div>
    {error && <p role="alert" className="guide-panel">{error}</p>}
    {result && <>
      {result.invalidJson > 0 && <p role="status" className="guide-panel">{result.invalidJson} {t("بلوک JSON نامعتبر بود.", "invalid JSON block(s).")}</p>}
      {result.files.length === 0 && <p role="status" className="guide-panel">{t("بلوک کد، JSON معتبر یا جدول Markdown پیدا نشد.", "No fenced code, valid JSON, or Markdown tables found.")}</p>}
      {result.files.map((file, index) => {
        const ext = file.kind === "code" ? "md" : file.kind;
        const mime = file.kind === "json" ? "application/json" : file.kind === "csv" ? "text/csv;charset=utf-8" : undefined;
        return <Output key={index} t={t} label={`${file.kind === "code" ? t("بلوک کد", "Code block") : ext.toUpperCase()} ${index + 1}`}
          text={file.kind === "code" ? fence(file.text, file.language) : file.text} filename={`ai-output-${index + 1}.${ext}`} mime={mime} />;
      })}
      <Output t={t} label={t("پاسخ کامل", "Full response")} text={source} filename="ai-response.md" />
    </>}
  </div>;
}

const TEMPLATE_STORAGE = "qodeforge_prompt_templates_v1";
const TEMPLATE_EVENT = "qodeforge_prompt_templates_change";
const emptyTemplate: PromptTemplate = { name: "", goal: "", input: "", format: "" };
function subscribeTemplates(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener(TEMPLATE_EVENT, update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(TEMPLATE_EVENT, update);
  };
}
function templateSnapshot() {
  try { return localStorage.getItem(TEMPLATE_STORAGE) ?? "[]"; } catch { return "[]"; }
}
function decodeTemplates(raw: string): PromptTemplate[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((value): value is PromptTemplate =>
      value && typeof value.name === "string" && PROMPT_FIELDS.every(key => typeof value[key] === "string")
    ).slice(0, 30);
  } catch { return []; }
}

function PromptBuilder({ t }: { t: Translate }) {
  const raw = useSyncExternalStore(subscribeTemplates, templateSnapshot, () => "[]");
  const templates = decodeTemplates(raw);
  const [draft, setDraft] = useState<PromptTemplate>(emptyTemplate);
  const [editing, setEditing] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const labels = [t("هدف", "Goal"), t("ورودی", "Input"), t("قالب پاسخ", "Response format")];
  const variables = promptVariables(draft);
  const withinVariableLimit = variables.length <= 24;
  const prompt = withinVariableLimit ? fillPrompt(draft, values, labels) : "";
  const complete = variables.every(name => Object.hasOwn(values, name) && values[name].trim());
  function store(next: PromptTemplate[]) {
    try {
      localStorage.setItem(TEMPLATE_STORAGE, JSON.stringify(next));
      window.dispatchEvent(new Event(TEMPLATE_EVENT));
      return true;
    } catch {
      setStatus(t("ذخیره در مرورگر ممکن نبود.", "Browser storage is unavailable."));
      return false;
    }
  }
  function load(name: string) {
    setDraft(templates.find(template => template.name === name) ?? emptyTemplate);
    setEditing(name);
    setConfirmDelete(false);
    setValues({});
    setStatus("");
  }

  return <div className="space-y-4">
    <div className="guide-panel space-y-4">
      <AccessibleSelect fieldLabel={t("قالب‌های ذخیره‌شده", "Saved templates")} className="ai-input" value={editing} onChange={event => load(event.target.value)}>
        <option value="">{t("قالب جدید", "New template")}</option>
        {editing && !templates.some(item => item.name === editing) && <option value={editing}>{editing}</option>}
        {templates.map(template => <option key={template.name} value={template.name}>{template.name}</option>)}
      </AccessibleSelect>
      <label className="ai-field">{t("نام قالب", "Template name")}
        <input className="ai-input" value={draft.name} maxLength={80} onChange={event => setDraft({ ...draft, name: event.target.value })} />
      </label>
      {PROMPT_FIELDS.map((field, index) => <TextField key={field} compact label={labels[index]}
        value={draft[field]} inputActions={field === "input" ? t : undefined} maxLength={8000} onChange={value => setDraft({ ...draft, [field]: value })} />)}
      <p className="guide-copy text-sm">{t("برای فیلدهای قابل‌پرکردن از الگوی {{موضوع}} استفاده کنید. فقط قالب‌ها در این مرورگر ذخیره می‌شوند.", "Use placeholders such as {{topic}} for fillable fields. Only templates are saved in this browser.")}</p>
      <div className="flex flex-wrap gap-2">
        <button className="ai-button ai-primary" disabled={!draft.name.trim() || !withinVariableLimit || !PROMPT_FIELDS.some(field => draft[field].trim())} onClick={() => {
          const name = draft.name.trim();
          const others = decodeTemplates(templateSnapshot()).filter(item => item.name !== editing);
          if (others.some(item => item.name === name)) { setStatus(t("این نام قبلاً استفاده شده است.", "That name already exists.")); return; }
          if (others.length >= 30) { setStatus(t("حداکثر ۳۰ قالب می‌توانید ذخیره کنید.", "You can save up to 30 templates.")); return; }
          if (store([...others, { ...draft, name }])) { setEditing(name); setStatus(t("قالب ذخیره شد.", "Template saved.")); }
        }}>{t("ذخیره قالب", "Save template")}</button>
        {editing && <><button className="ai-button" onClick={() => load("")}>{t("قالب جدید", "New template")}</button>
          <button className="ai-button" aria-expanded={confirmDelete} onClick={() => setConfirmDelete(value => !value)}>{t("حذف قالب", "Delete template")}</button></>}
      </div>
      {confirmDelete && editing && <div className="flex flex-wrap items-center gap-2" role="group"
        aria-label={t("تأیید حذف قالب", "Confirm template deletion")}>
        <p className="text-sm">{t("این قالب حذف شود؟", "Delete this template?")}</p>
        <button type="button" className="ai-button" onClick={() => {
          if (store(decodeTemplates(templateSnapshot()).filter(item => item.name !== editing))) load("");
        }}>{t("حذف", "Delete")}</button>
        <button type="button" className="ai-button" onClick={() => setConfirmDelete(false)}>{t("انصراف", "Cancel")}</button>
      </div>}
      {status && <p role="status">{status}</p>}
    </div>
    {!withinVariableLimit && <p role="alert" className="guide-panel">{t("هر قالب حداکثر ۲۴ فیلد متغیر دارد.", "Each template supports up to 24 variable fields.")}</p>}
    {withinVariableLimit && variables.length > 0 && <div className="guide-panel space-y-4">
      {variables.map(name => <TextField compact key={name} label={name} value={Object.hasOwn(values, name) ? values[name] : ""}
        maxLength={8000} onChange={value => setValues(old => ({ ...old, [name]: value }))} />)}
    </div>}
    {prompt === null && <p role="alert" className="guide-panel">{t("پرامپت نهایی نباید بیشتر از ۲۰۰ هزار نویسه باشد.", "The final prompt must not exceed 200,000 characters.")}</p>}
    {prompt && (complete
      ? <Output t={t} label={t("پرامپت آماده", "Ready prompt")} text={prompt} filename="prompt.md" />
      : <p role="status" className="guide-panel">{t("برای دریافت پرامپت، همهٔ فیلدهای قالب را پر کنید.", "Fill all template fields to export the prompt.")}</p>)}
  </div>;
}
