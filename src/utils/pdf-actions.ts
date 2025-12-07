// utils/pdf-actions.ts
import { PDFDocument } from 'pdf-lib';

/**
 * دو یا چند فایل PDF را با هم ترکیب می‌کند
 * @param files آرایه‌ای از فایل‌های PDF ورودی
 * @returns فایل نهایی به صورت آرایه بایت (Uint8Array)
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
    
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('خطا در پردازش فایل‌ها. لطفاً مطمئن شوید فایل‌های PDF سالم هستند و رمزگذاری نشده‌اند.');
  }
}
