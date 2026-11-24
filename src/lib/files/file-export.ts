import { activityOrigin, type ActivityOrigin } from "./activity-origin";
import { normaliseOutputName } from "./output-name";

export type ExportRequest = {
  id: string;
  blob?: Blob;
  suggestedName: string;
  origin: ActivityOrigin;
  error?: string;
  resolve: (saved: boolean) => void;
};
type ExportHandler = (request: ExportRequest) => void;
let handler: ExportHandler | undefined;
const waiting: ExportRequest[] = [];

export function onFileExport(receive: ExportHandler) {
  handler = receive;
  waiting.splice(0).forEach(receive);
  return () => { if (handler === receive) handler = undefined; };
}

/** Hold the prepared file in memory; a native download starts only on confirmation. */
export async function saveFile(data: Blob | BlobPart, suggestedName: string, mime?: string): Promise<boolean> {
  const origin = activityOrigin();
  let blob: Blob | undefined, error: string | undefined;
  try {
    if (data instanceof Blob) blob = data;
    else if (typeof data === "string" && /^(?:blob:|data:|https?:\/\/)/i.test(data)) {
      // Resolve existing object URLs immediately, before the caller revokes them.
      const response = await fetch(data);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      blob = await response.blob();
    } else blob = new Blob([data], { type: mime ?? "application/octet-stream" });
  } catch (cause) { error = cause instanceof Error ? cause.message : "EXPORT_FAILED"; }
  return new Promise(resolve => {
    const request: ExportRequest = { id: crypto.randomUUID(), blob, suggestedName: normaliseOutputName("", suggestedName), origin, error, resolve };
    if (handler) handler(request); else waiting.push(request);
  });
}

export function downloadExport(request: ExportRequest, requestedName: string) {
  if (!request.blob) return;
  const filename = normaliseOutputName(requestedName, request.suggestedName);
  const url = URL.createObjectURL(request.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return filename;
}
