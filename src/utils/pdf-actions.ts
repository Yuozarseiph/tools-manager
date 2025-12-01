// utils/pdf-actions.ts
import { PDFDocument } from 'pdf-lib';

/**
 * دو یا چند فایل PDF را با هم ترکیب می‌کند
 * @param files آرایه‌ای از فایل‌های PDF ورودی
 * @returns فایل نهایی به صورت آرایه بایت (Uint8Array)
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  try {
    // 1. ایجاد یک داکیومنت PDF خالی جدید که قرار است فایل نهایی ما باشد
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      // 2. خواندن فایل ورودی به صورت بافر (ArrayBuffer)
      const fileBuffer = await file.arrayBuffer();
      
      // 3. بارگذاری فایل در حافظه کتابخانه pdf-lib
      const pdf = await PDFDocument.load(fileBuffer);
      
      // 4. کپی کردن تمام صفحات فایل فعلی
      // getPageIndices() لیستی از شماره صفحات (0, 1, 2, ...) را برمی‌گرداند
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      // 5. چسباندن تک‌تک صفحات کپی شده به فایل اصلی (mergedPdf)
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // 6. ذخیره و خروجی گرفتن فایل نهایی
    return await mergedPdf.save();
    
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('خطا در پردازش فایل‌ها. لطفاً مطمئن شوید فایل‌های PDF سالم هستند و رمزگذاری نشده‌اند.');
  }
}
