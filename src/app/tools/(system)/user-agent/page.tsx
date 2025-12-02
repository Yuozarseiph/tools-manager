'use client';

import Link from 'next/link';
import { ArrowRight, MonitorSmartphone } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import UserAgentTool from '@/components/tools/UserAgentTool';

export default function UserAgentPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <MonitorSmartphone size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>اطلاعات سیستم و مرورگر</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          شناسایی دقیق سیستم عامل، نسخه مرورگر، نوع دستگاه (موبایل/دسکتاپ) و موتور پردازشی شما.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
        <UserAgentTool />
      </div>
    </div>
  );
}
