/// <reference lib="webworker" />
export {};

import { PDFDocument } from "pdf-lib";

type MsgIn = { type: "merge"; files: File[] };

type MsgOut =
  | { type: "progress"; index: number; total: number }
  | { type: "done"; buffer: ArrayBuffer }
  | { type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

const yieldNow = () => new Promise<void>((r) => setTimeout(r, 0));

ctx.onmessage = async (ev: MessageEvent<MsgIn>) => {
  try {
    if (ev.data?.type !== "merge") return;

    const files = ev.data.files ?? [];
    const total = files.length;

    const merged = await PDFDocument.create();

    for (let i = 0; i < total; i += 1) {
      ctx.postMessage({ type: "progress", index: i + 1, total } as MsgOut);

      const bytes = await files[i].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      for (const p of pages) merged.addPage(p);

      if ((i + 1) % 3 === 0) await yieldNow();
    }

    const out = await merged.save();
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);

    ctx.postMessage({ type: "done", buffer: ab } as MsgOut, [ab]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Merge failed";
    ctx.postMessage({ type: "error", message: msg } as MsgOut);
  }
};
