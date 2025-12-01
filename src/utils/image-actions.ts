// utils/image-actions.ts

export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export async function convertImage(file: File, format: ImageFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // اگر فرمت JPG انتخاب شده، پس‌زمینه را سفید کن (چون JPG شفافیت ندارد)
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
          URL.revokeObjectURL(url); // پاکسازی حافظه
        },
        format,
        0.9 // کیفیت 90%
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}
