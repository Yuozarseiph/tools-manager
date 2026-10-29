import { saveFile } from "./file-export";
import { activityOrigin, type ActivityOrigin } from "./activity-origin";
export type Activity = { id: string; name: string; kind: "read" | "download" | "process" | "save"; done: number; total?: number; started: number; updated: number; status: "running" | "done" | "error" | "cancelled"; cancel?: () => void; detail?: string; origin?: ActivityOrigin };
const EVENT = "qodeforge-activity";
export const activityEvent = EVENT;
export function startActivity(name: string, kind: Activity["kind"], total?: number, cancel?: () => void, origin = activityOrigin()) {
  let state: Activity = { id: crypto.randomUUID(), name, kind, done: 0, total: total && total > 0 ? total : undefined, started: Date.now(), updated: Date.now(), status: "running", cancel, origin };
  let last = 0;
  const emit = (force = false) => { if (force || Date.now() - last > 120) { last = Date.now(); window.dispatchEvent(new CustomEvent(EVENT, { detail: { ...state } })); } };
  emit(true);
  return {
    progress(done: number, size?: number, detail?: string) { if (state.status !== "running") return; state = { ...state, done, total: size && size > 0 ? size : state.total, detail, updated: Date.now() }; emit(); },
    finish() { if (state.status !== "running") return; state = { ...state, status: "done", updated: Date.now(), cancel: undefined }; emit(true); },
    fail(error: unknown) { if (state.status !== "running") return; state = { ...state, status: error instanceof Error && error.name === "AbortError" ? "cancelled" : "error", updated: Date.now(), cancel: undefined }; emit(true); },
  };
}
export async function downloadBlob(url: string, name: string, signal?: AbortSignal, expectedSize?: number) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const task = startActivity(name, "download", expectedSize, abort);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawTotal = Number(response.headers.get("content-length"));
    const total = expectedSize && expectedSize > 0 ? expectedSize : response.headers.get("content-encoding") ? undefined : rawTotal > 0 ? rawTotal : undefined;
    const reader = response.body?.getReader();
    const parts: Uint8Array<ArrayBuffer>[] = []; let loaded = 0;
    if (!reader) { const blob = await response.blob(); task.progress(blob.size, blob.size); task.finish(); return blob; }
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      loaded += value.byteLength;
      if (loaded > 512 * 1024 * 1024) { await reader.cancel(); throw new Error("DOWNLOAD_TOO_LARGE"); }
      parts.push(value as Uint8Array<ArrayBuffer>); task.progress(loaded, total);
    }
    const blob = new Blob(parts, { type: response.headers.get("content-type") ?? "application/octet-stream" });
    task.progress(loaded, loaded); task.finish(); return blob;
  } catch (error) { task.fail(error); throw error; }
  finally { signal?.removeEventListener("abort", abort); }
}
export function readLocalFile(file: File, signal?: AbortSignal): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    if (signal?.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    signal?.addEventListener("abort", abort, { once: true });
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("READ_FAILED"));
    reader.onabort = () => reject(new DOMException("Cancelled", "AbortError"));
    reader.onloadend = () => signal?.removeEventListener("abort", abort);
    reader.readAsArrayBuffer(file);
  });
}
let runtimeManifest: Promise<Record<string, { size: number; hash: string }>> | undefined;
export async function downloadResource(url: string, name: string, signal?: AbortSignal) {
  // Cache public engine/model resources only; never use this for user input.
  let expectedSize: number | undefined;
  if (url.startsWith("/runtime/")) {
    try {
      runtimeManifest ??= fetch("/runtime/manifest.json", { cache: "no-store" }).then(response => { if (!response.ok) throw new Error("MANIFEST_UNAVAILABLE"); return response.json(); });
      const resource = (await runtimeManifest)[url];
      if (resource) { expectedSize = resource.size; url += `?v=${resource.hash}`; }
    } catch { runtimeManifest = undefined; }
  }
  let cache: Cache | undefined;
  try { cache = await caches.open("qodeforge-resources-v1"); const hit = await cache.match(url); if (hit) { signal?.throwIfAborted(); const blob = await hit.blob(); const task = startActivity(name, "download", blob.size); task.progress(blob.size, blob.size, "Cache"); task.finish(); return blob; } } catch (error) { if (signal?.aborted) throw error; }
  const blob = await downloadBlob(url, name, signal, expectedSize);
  try { await cache?.put(url, new Response(blob)); } catch { /* Storage quota may be unavailable. */ }
  return blob;
}
export function saveText(text: string, name: string, type = "text/markdown;charset=utf-8") {
  return saveFile(new Blob([text], { type }), name);
}
export function byteSize(bytes: number) { const units = ["B", "KB", "MB", "GB"]; let index = 0; while (bytes >= 1024 && index < 3) { bytes /= 1024; index++; } return `${bytes.toFixed(index ? 1 : 0)} ${units[index]}`; }

export function observeFileReads(label: string) {
  const methods = ["readAsArrayBuffer", "readAsText", "readAsDataURL", "readAsBinaryString"] as const;
    const originals = methods.map(method => FileReader.prototype[method]);
    methods.forEach((method, index) => {
      const original = originals[index];
      const wrapped = function(this: FileReader, blob: Blob, encoding?: string) {
        if (!(blob instanceof File)) return (original as (this: FileReader, data: Blob, encoding?: string) => void).call(this, blob, encoding);
        const task = startActivity(blob instanceof File ? blob.name : label, "read", blob.size, () => this.abort());
        const progress = (event: ProgressEvent<FileReader>) => task.progress(event.loaded, event.lengthComputable ? event.total : blob.size);
        const finish = () => { if (this.error) task.fail(this.error); else if (this.readyState === FileReader.DONE && this.result !== null) { task.progress(blob.size, blob.size); task.finish(); } else task.fail(new DOMException("Cancelled", "AbortError")); this.removeEventListener("progress", progress); };
        this.addEventListener("progress", progress); this.addEventListener("loadend", finish, { once: true });
        try { return (original as (this: FileReader, data: Blob, encoding?: string) => void).call(this, blob, encoding); }
        catch (error) { this.removeEventListener("progress", progress); this.removeEventListener("loadend", finish); task.fail(error); throw error; }
      };
      FileReader.prototype[method] = wrapped;
    });

  // Route File convenience methods through the same single native read, so
  // existing tools using file.text()/arrayBuffer() receive real byte progress.
  const bufferDescriptor = Object.getOwnPropertyDescriptor(File.prototype, "arrayBuffer");
  const textDescriptor = Object.getOwnPropertyDescriptor(File.prototype, "text");
  File.prototype.arrayBuffer = function(this: File) { return readLocalFile(this); };
  File.prototype.text = function(this: File) { return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.onabort = () => reject(new DOMException("Cancelled", "AbortError")); reader.readAsText(this); }); };
  return () => {
    methods.forEach((method, index) => { FileReader.prototype[method] = originals[index]; });
    if (bufferDescriptor) Object.defineProperty(File.prototype, "arrayBuffer", bufferDescriptor); else Reflect.deleteProperty(File.prototype, "arrayBuffer");
    if (textDescriptor) Object.defineProperty(File.prototype, "text", textDescriptor); else Reflect.deleteProperty(File.prototype, "text");
  };
}
