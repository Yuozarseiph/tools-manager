// app/docs/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { getDocsData } from '@/data/docs';

export default function DocsPage() {
  const theme = useThemeColors();
  const docsData = getDocsData(theme);
  const [activeTab, setActiveTab] = useState(docsData[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeContent = docsData.find(s => s.id === activeTab)?.content;

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className={`lg:hidden flex items-center justify-between p-4 border-b sticky top-0 z-30 backdrop-blur-xl ${theme.bg}/90 ${theme.border}`}>
        <span className={`font-bold ${theme.text}`}>راهنما و مستندات</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-lg ${theme.secondary}`}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
                <aside className={`
          /* Mobile Styles */
          fixed inset-0 z-20 pt-20 px-6 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          
          /* Desktop Styles (Override Mobile) */
          lg:translate-x-0 lg:static lg:z-0 lg:pt-6 lg:w-80 lg:block lg:border-l 
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto
          
          /* Shared Styles */
          ${theme.bg} ${theme.border}
        `}>
          
          <Link href="/" className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
            <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
          </Link>

          <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${theme.textMuted}`}>فهرست مطالب</h3>
          
          <nav className="space-y-2">
            {docsData.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveTab(section.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right
                ${activeTab === section.id 
                  ? `${theme.primary} shadow-lg shadow-${theme.accent}/20` 
                  : `${theme.text} hover:bg-zinc-100 dark:hover:bg-zinc-800/50`
                }`}
              >
                <section.icon size={18} />
                {section.title}
              </button>
            ))}
          </nav>

          <div className={`mt-10 pt-6 border-t border-dashed ${theme.border}`}>
            <p className={`text-xs leading-relaxed opacity-60 ${theme.textMuted}`}>
              نسخه: 1.0.0 (Beta)
              <br />
              آخرین بروزرسانی: آذر ۱۴۰۴
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-6 lg:p-16 pb-20">
          <div className={`max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme.text}`}>
            {activeContent}
          </div>

          {/* Footer Links */}
          <div className={`max-w-3xl mx-auto mt-20 pt-10 border-t flex flex-col sm:flex-row gap-4 justify-between items-center ${theme.border}`}>
            <p className={`text-sm ${theme.textMuted}`}>هنوز سوال دارید؟</p>
            <Link href="/contact" className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${theme.secondary} hover:opacity-80`}>
              ارسال تیکت پشتیبانی
            </Link>
          </div>
        </main>

      </div>
    </div>
  );
}
