"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FileUp } from "lucide-react";
import { useLanguage } from "@/providers/LanguageContext";
import { decodeText } from "@/lib/files/decode-text";
import { byteSize } from "@/lib/files/transfer";

export type ReadyFile = { file: File };
type Row = {
  id: number; file: File; loaded: number; status: "queued" | "reading" | "ready" | "cancelled" | "failed" | "invalid" | "skipped";
};
const TEXT_TYPES = /\.(txt|md|csv|json|xml|html?|log|svg)$/i;
const MAX_FILES = 300;

export function useFileTransfer({ multiple = false, validate, skipRead }: {
  multiple?: boolean; validate?: (file: File) => boolean; skipRead?: (file: File) => boolean;
} = {}) {
  const [rows, setRows] = useState<Row[]>([]);
  const nextId = useRef(0);
  const pending = useRef(new Map<number, Row>());
  const readers = useRef(new Map<number, ReadableStreamDefaultReader<Uint8Array>>());
  useEffect(() => {
    const active = readers.current;
    const waiting = pending.current;
    return () => {
      for (const reader of active.values()) void reader.cancel().catch(() => {});
      active.clear();
      waiting.clear();
    };
  }, []);

  function update(id: number, changes: Partial<Row>) {
    setRows(current => current.map(row => row.id === id ? { ...row, ...changes } : row));
  }

  function cancel(id: number) {
    const reader = readers.current.get(id);
    const wasQueued = pending.current.delete(id);
    if (reader) {
      readers.current.delete(id);
      void reader.cancel().catch(() => {});
    }
    if (reader || wasQueued) update(id, { status: "cancelled" });
    pump();
  }

  async function read(row: Row) {
    update(row.id, { status: "reading", loaded: 0 });
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      reader = row.file.stream().getReader();
      readers.current.set(row.id, reader);
      let loaded = 0;
      let lastUpdate = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (readers.current.get(row.id) !== reader) return;
        if (done) break;
        loaded += value.byteLength;
        const now = Date.now();
        if (now - lastUpdate >= 100) {
          update(row.id, { loaded });
          lastUpdate = now;
        }
      }
      update(row.id, { loaded, status: "ready" });
    } catch {
      if (!reader || readers.current.get(row.id) === reader) update(row.id, { status: "failed" });
    } finally {
      if (reader && readers.current.get(row.id) === reader) readers.current.delete(row.id);
      reader?.releaseLock();
      pump();
    }
  }

  function pump() {
    while (readers.current.size < 3 && pending.current.size) {
      const row = pending.current.values().next().value!;
      pending.current.delete(row.id);
      void read(row);
    }
  }

  function enqueue(row: Row) {
    pending.current.set(row.id, row);
    update(row.id, { status: "queued", loaded: 0 });
    pump();
  }

  function clear() {
    pending.current.clear();
    for (const id of readers.current.keys()) cancel(id);
    setRows([]);
  }

  function stage(files: FileList | File[], invalid: File[] = []) {
    if (!files.length && !invalid.length) return;
    if (!multiple) clear();
    const remaining = multiple ? Math.max(0, MAX_FILES - rows.filter(row => row.status !== "ready" && row.status !== "skipped").length) : 1;
    const added = [...Array.from(files, file => ({
      file, valid: validate?.(file) ?? true,
    })), ...invalid.map(file => ({ file, valid: false }))].slice(0, remaining)
      .map(({file, valid}): Row => ({ id: ++nextId.current, file, loaded: 0, status: !valid ? "invalid" : skipRead?.(file) ? "skipped" : "queued" }));
    setRows(current => {
      const active = current.some(row => row.status === "queued" || row.status === "reading");
      const retained = active ? current : current.filter(row => row.status !== "ready" && row.status !== "skipped");
      return [...retained, ...added];
    });
    added.filter(row => row.status === "queued").forEach(enqueue);
  }

  const dismissReady = useCallback((id: number) => {
    setRows(current => current.filter(row => row.id !== id || row.status !== "ready"));
  }, []);

  return {
    rows, stage, clear, dismissReady,
    cancel,
    remove: (id: number) => {
      cancel(id);
      setRows(current => current.filter(row => row.id !== id));
    },
    retry: enqueue,
  };
}

export function FileTransferRows({ transfer, onReady, disabled = false }: {
  transfer: ReturnType<typeof useFileTransfer>;
  onReady: (files: ReadyFile[]) => void;
  disabled?: boolean;
}) {
  const { locale } = useLanguage();
  const t = (fa: string, en: string) => locale === "fa" ? fa : en;
  const [preview, setPreview] = useState<number>();
  const [focused, setFocused] = useState<number>();
  const [hovered, setHovered] = useState<number>();
  const { rows, dismissReady } = transfer;
  const delivered = useRef(new Set<number>());
  useEffect(() => {
    const currentIds = new Set(rows.map(row => row.id));
    for (const id of delivered.current) if (!currentIds.has(id)) delivered.current.delete(id);
    if (disabled || rows.some(row => row.status === "reading" || row.status === "queued")) return;
    const ready = rows.filter(row => (row.status === "ready" || row.status === "skipped") && !delivered.current.has(row.id));
    if (!ready.length) return;
    ready.forEach(row => delivered.current.add(row.id));
    onReady(ready.map(row => ({ file: row.file })));
  }, [disabled, onReady, rows]);
  useEffect(() => {
    const duration = window.matchMedia?.("(width < 640px)").matches ? 1400 : 2800;
    const timers = rows
      .filter(row => row.status === "ready" && delivered.current.has(row.id) &&
        row.id !== preview && row.id !== focused && row.id !== hovered)
      .map(row => window.setTimeout(() => dismissReady(row.id), duration));
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [dismissReady, disabled, focused, hovered, preview, rows]);
  if (!rows.some(row => row.status !== "skipped")) return null;
  return <div className="file-transfer-list space-y-3">
    <ul className="space-y-2">
      {rows.filter(row => row.status !== "skipped").map(row => <li key={row.id} className="inline-transfer m-0"
        data-status={row.status === "failed" || row.status === "invalid" ? "error" : row.status}
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(row.id); }}
        onPointerLeave={() => setHovered(value => value === row.id ? undefined : value)}
        onFocus={() => setFocused(row.id)}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(value => value === row.id ? undefined : value);
        }}>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <bdi className="min-w-0 break-all font-semibold">{row.file.name}</bdi>
          <span dir="ltr">{byteSize(row.loaded)} / {byteSize(row.file.size)}</span>
        </div>
        <progress className="task-progress mt-2" max={Math.max(1, row.file.size)}
          value={row.status === "ready" ? Math.max(1, row.file.size) : row.loaded} aria-label={row.file.name} />
        <p className="mt-1 text-xs" role="status">{{
          queued: t("در صف", "Queued"),
          reading: t("در حال خواندن", "Reading"), ready: t("آماده", "Ready"),
          cancelled: t("لغو شد", "Cancelled"), failed: t("خواندن ناموفق بود", "Could not read the file"),
          skipped: "",
          invalid: t("نوع یا اندازهٔ فایل مجاز نیست", "File type or size is not supported"),
        }[row.status]}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(row.status === "reading" || row.status === "queued") && <button type="button" className="ai-button" onClick={() => transfer.cancel(row.id)}>{t("لغو", "Cancel")}</button>}
          {(row.status === "failed" || row.status === "cancelled") && <button type="button" className="ai-button"
            onClick={() => transfer.retry(row)}>{t("تلاش دوباره", "Retry")}</button>}
          {row.status === "ready" && <button type="button" className="ai-button" aria-expanded={preview === row.id}
            onClick={() => setPreview(preview === row.id ? undefined : row.id)}>{t("پیش‌نمایش", "Preview")}</button>}
          <button type="button" className="ai-button" disabled={disabled} onClick={() => transfer.remove(row.id)}>{row.status === "ready" ? t("بستن ردیف", "Dismiss") : t("حذف", "Remove")}</button>
        </div>
        {preview === row.id && <FilePreview row={row} />}
      </li>)}
    </ul>
  </div>;
}

function FilePreview({ row }: { row: Row }) {
  const { locale } = useLanguage();
  const type = row.file.type;
  // Do not embed active documents such as HTML or SVG from local files.
  const media = /^(?:image\/(?:png|jpeg|gif|webp|avif|bmp)|audio\/[\w.+-]+|video\/[\w.+-]+)$/.test(type);
  const [url, setUrl] = useState("");
  const [text, setText] = useState<string>();
  useEffect(() => {
    if (!TEXT_TYPES.test(row.file.name)) return;
    let active = true;
    void row.file.slice(0, 4096).arrayBuffer().then(buffer => { if (active) setText(decodeText(buffer)); }).catch(() => {});
    return () => { active = false; };
  }, [row.file]);
  useEffect(() => {
    if (!media) return;
    const objectUrl = URL.createObjectURL(row.file);
    const timer = setTimeout(() => setUrl(objectUrl), 0);
    return () => { clearTimeout(timer); URL.revokeObjectURL(objectUrl); };
  }, [media, row.file]);
  if (media && !url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  if (type.startsWith("image/") && media) return <img src={url} alt={row.file.name} className="mt-2 max-h-52 max-w-full object-contain" />;
  if (type.startsWith("audio/") && media) return <audio className="mt-2 w-full" src={url} controls preload="metadata" />;
  if (type.startsWith("video/") && media) return <video className="mt-2 max-h-52 max-w-full" src={url} controls preload="metadata" />;
  if (text !== undefined) return <pre dir="auto" className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-[var(--app-border)] p-3">{text}</pre>;
  return <p className="mt-2 text-sm">{locale === "fa" ? "پیش‌نمایش محتوای این قالب در دسترس نیست." : "Content preview is unavailable for this format."} <bdi>{row.file.name}</bdi></p>;
}

export default function FileTransfer({ accept, multiple, directory, disabled, validate, onReady, children, compact = false, pickerLabel }: {
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  disabled?: boolean;
  validate?: (file: File) => boolean;
  onReady: (files: ReadyFile[]) => void;
  children?: ReactNode;
  compact?: boolean;
  pickerLabel?: string;
}) {
  const id = useId();
  const { locale } = useLanguage();
  const t = (fa: string, en: string) => locale === "fa" ? fa : en;
  const transfer = useFileTransfer({ multiple: multiple || directory, validate });
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return <div className="space-y-3" data-activity-area="upload">
    <div data-file-control="drop" data-compact={compact || undefined} data-dragging={dragging || undefined} data-disabled={disabled || undefined}
      onDragOver={event => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = disabled ? "none" : "copy";
        setDragging(!disabled);
      }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={event => {
        if (!event.dataTransfer.files.length) return;
        event.preventDefault();
        setDragging(false);
        if (!disabled) transfer.stage(event.dataTransfer.files);
      }}>
      {!compact && <p className="mb-3 text-sm">{children ?? t("فایل را اینجا رها کنید یا انتخاب کنید.", "Drop a file here or choose one.")}</p>}
      <button type="button" className="ai-button" data-file-control="pick" disabled={disabled} onClick={() => input.current?.click()}>
        <FileUp size={17} aria-hidden="true" />
        {pickerLabel ?? (directory ? t("انتخاب پوشه", "Choose folder") : multiple ? t("انتخاب فایل‌ها", "Choose files") : t("انتخاب فایل", "Choose file"))}
      </button>
      <input ref={input} id={id} type="file" className="hidden" data-testid="file-upload" accept={accept}
        multiple={directory || multiple} {...(directory ? { webkitdirectory: "" } : {})} disabled={disabled}
        onChange={event => { if (event.currentTarget.files) transfer.stage(event.currentTarget.files); event.currentTarget.value = ""; }} />
    </div>
    <FileTransferRows transfer={transfer} onReady={onReady} disabled={disabled} />
  </div>;
}
