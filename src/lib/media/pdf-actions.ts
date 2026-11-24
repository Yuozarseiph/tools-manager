// utils/pdf-actions.ts
import { PDFDocument } from "pdf-lib";

export async function mergePDFs(
  files: File[],
  opts?: {
    onProgress?: (info: { index: number; total: number }) => void;
    yieldEvery?: number;
  }
): Promise<Uint8Array> {
  const onProgress = opts?.onProgress;
  const yieldEvery = opts?.yieldEvery ?? 3;

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i += 1) {
    onProgress?.({ index: i + 1, total: files.length });

    const bytes = await files[i].arrayBuffer();
    const pdf = await PDFDocument.load(bytes);

    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of copiedPages) mergedPdf.addPage(page);

    if ((i + 1) % yieldEvery === 0) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }

  return await mergedPdf.save();
}
