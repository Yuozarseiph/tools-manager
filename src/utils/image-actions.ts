// utils/image-actions.ts

export type ImageFormat = 
  | 'image/jpeg' 
  | 'image/png' 
  | 'image/webp' 
  | 'image/gif'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/svg+xml'
  | 'image/avif';

export interface ConversionOptions {
  quality?: number; // 0-1 (default: 0.9)
  maxWidth?: number;
  maxHeight?: number;
}

export async function convertImage(
  file: File, 
  format: ImageFormat,
  options: ConversionOptions = {}
): Promise<Blob> {
  const { quality = 0.9, maxWidth, maxHeight } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;

      // ریسایز اگر لازم باشه
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // پس‌زمینه سفید برای فرمت‌های بدون شفافیت
      if (format === 'image/jpeg' || format === 'image/bmp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
          URL.revokeObjectURL(url);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}
export async function convertImages(
  files: File[],
  format: ImageFormat,
  options?: ConversionOptions
): Promise<{ original: File; converted: Blob; filename: string }[]> {
  return Promise.all(
    files.map(async (file) => {
      const convertedBlob = await convertImage(file, format, options);
      const ext = format.split('/')[1];
      const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + ext;
      
      return {
        original: file,
        converted: convertedBlob,
        filename: newName,
      };
    })
  );
}
