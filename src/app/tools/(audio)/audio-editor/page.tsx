// app/tools/(audio)/audio-editor/page.tsx
"use client";

import Link from "next/link";
import { ArrowRight, AudioLines } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import AudioTool from "@/components/tools/audio/AudioTool";

export default function AudioEditorPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" />
          بازگشت به خانه
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <AudioLines size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>
            ویرایش و پردازش صدا (بتا)
          </h1>
        </div>

        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          فایل صوتی خود را انتخاب کنید و به صورت محلی روی دستگاه خود آن را برش دهید،
          تنظیم کنید یا برای پردازش‌های بعدی آماده کنید. هیچ فایلی آپلود نمی‌شود و همه‌چیز
          فقط در مرورگر شما انجام می‌شود.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 w-full flex-1">
        <AudioTool />
      </div>
    </div>
  );
}
