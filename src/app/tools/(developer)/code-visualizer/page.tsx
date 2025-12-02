'use client';

import Link from 'next/link';
import { ArrowRight, GitGraph } from 'lucide-react'; // آیکون مناسب گراف
import { useThemeColors } from '@/hooks/useThemeColors';
import CodeVisualizerTool from '@/components/tools/code-visualizer/CodeVisualizerTool';

export default function CodeVisualizerPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-7xl mx-auto px-6 pt-10 w-full">
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <GitGraph size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>تصویرسازی کد (JS Flow)</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          کد جاوا اسکریپت خود را وارد کنید تا منطق و جریان اجرای آن را به صورت فلوچارت زنده مشاهده کنید.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 w-full flex-1">
        <CodeVisualizerTool />
      </div>
    </div>
  );
}
