// app/tools/(media)/audio-extractor/audio-extractor.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const audioExtractorContent = {
  fa: {
    id: "audio-extractor",
    category: "media",
    title: "استخراج صدا از ویدیو",
    description: "به راحتی فایل صوتی را از ویدیوهای خود جدا کنید و به فرمت‌های مختلف دانلود کنید.",
    features: [
      "استخراج صدا از فرمت‌های مختلف ویدیو",
      "خروجی در فرمت‌های MP3، WAV، OGG و M4A",
      "پردازش کامل در مرورگر بدون آپلود",
      "حفظ کیفیت صدای اصلی"
    ],
    ui: {
      upload: {
        dropTitle: "ویدیو خود را اینجا رها کنید",
        dropSubtitle: "یا کلیک کنید تا انتخاب کنید",
        supportedFormats: "فرمت‌های پشتیبانی: MP4, AVI, MOV, MKV, WEBM"
      },
      fileInfo: {
        fileName: "نام فایل:",
        fileSize: "حجم:",
        duration: "مدت زمان:"
      },
      formats: {
        title: "فرمت خروجی",
        mp3: "MP3",
        mp3Desc: "کیفیت خوب، حجم کم",
        wav: "WAV",
        wavDesc: "کیفیت بالا، بدون فشرده‌سازی",
        ogg: "OGG",
        oggDesc: "منبع باز، کیفیت خوب",
        m4a: "M4A",
        m4aDesc: "کیفیت عالی، فشرده‌سازی هوشمند"
      },
      quality: {
        title: "کیفیت صدا",
        low: "کم",
        medium: "متوسط",
        high: "بالا",
        bitrate: "بیت‌ریت:"
      },
      buttons: {
        extract: "استخراج صدا",
        extracting: "در حال استخراج...",
        download: "دانلود فایل صوتی",
        clear: "حذف فایل",
        cancel: "لغو"
      },
      status: {
        loading: "بارگذاری FFmpeg...",
        ready: "آماده برای استخراج",
        processing: "در حال پردازش...",
        completed: "استخراج با موفقیت انجام شد!",
        error: "خطا در استخراج صدا"
      },
      warning: {
        title: "⚠️ توجه مهم",
        description: "پردازش ویدیوهای بزرگ ممکن است چند دقیقه طول بکشد و مرورگر شما موقتاً کُند شود. لطفاً صبر کنید و پنجره را نبندید."
      },
      processing: {
        patience: "در حال پردازش... مرورگر ممکن است موقتاً کند شود، لطفاً صبور باشید."
      }
    },
    page: {
      title: "ابزار استخراج صدا از ویدیو",
      description: "فایل صوتی ویدیوهای خود را در مرورگر استخراج کنید بدون نیاز به آپلود."
    }
  },
  en: {
    id: "audio-extractor",
    category: "media",
    title: "Extract audio from video",
    description: "Easily extract audio tracks from your videos and download them in various formats.",
    features: [
      "Extract audio from various video formats",
      "Output in MP3, WAV, OGG, and M4A formats",
      "Complete browser processing without upload",
      "Preserve original audio quality"
    ],
    ui: {
      upload: {
        dropTitle: "Drop your video here",
        dropSubtitle: "or click to select",
        supportedFormats: "Supported: MP4, AVI, MOV, MKV, WEBM"
      },
      fileInfo: {
        fileName: "File name:",
        fileSize: "Size:",
        duration: "Duration:"
      },
      formats: {
        title: "Output format",
        mp3: "MP3",
        mp3Desc: "Good quality, small size",
        wav: "WAV",
        wavDesc: "High quality, uncompressed",
        ogg: "OGG",
        oggDesc: "Open source, good quality",
        m4a: "M4A",
        m4aDesc: "Excellent quality, smart compression"
      },
      quality: {
        title: "Audio quality",
        low: "Low",
        medium: "Medium",
        high: "High",
        bitrate: "Bitrate:"
      },
      buttons: {
        extract: "Extract audio",
        extracting: "Extracting...",
        download: "Download audio file",
        clear: "Remove file",
        cancel: "Cancel"
      },
      status: {
        loading: "Loading FFmpeg...",
        ready: "Ready to extract",
        processing: "Processing...",
        completed: "Extraction completed successfully!",
        error: "Error extracting audio"
      },
      warning: {
        title: "⚠️ Important Notice",
        description: "Processing large videos may take several minutes and your browser might temporarily slow down. Please be patient and don't close the window."
      },
      processing: {
        patience: "Processing... Your browser may temporarily slow down, please be patient."
      }
    },
    page: {
      title: "Audio extractor from video",
      description: "Extract audio from your videos in the browser without uploading."
    }
  }
};

export type AudioExtractorToolContent = typeof audioExtractorContent.fa;

export function useAudioExtractorContent() {
  const { locale } = useLanguage();
  return audioExtractorContent[locale];
}
