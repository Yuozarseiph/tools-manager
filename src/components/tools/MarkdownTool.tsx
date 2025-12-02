'use client';

import { useState } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import ReactMarkdown from 'react-markdown';
import { Trash2, Copy, Check } from 'lucide-react';

const DEFAULT_MARKDOWN = `# سلام دنیا! 👋

این یک **متن ضخیم** و این یک *متن کج* است.

## لیست کارها:
- [x] ساخت ابزار مارک‌داون
- [ ] قهوه خوردن ☕
- [ ] دیپلوی کردن پروژه

### کد نمونه:
\`\`\`javascript
console.log('Hello Tools Manager!');
\`\`\`

> نقل قول: برنامه نویسی یعنی تفکر، نه تایپ کردن.
`;

export default function MarkdownTool() {
  const theme = useThemeColors();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
      
      {/* ویرایشگر (Editor) */}
      <div className={`flex flex-col rounded-3xl border shadow-sm overflow-hidden ${theme.card} ${theme.border}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.border} bg-zinc-50 dark:bg-zinc-900/50`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>ورودی (Markdown)</span>
          <div className="flex gap-2">
            <button onClick={() => setMarkdown('')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="پاک کردن">
              <Trash2 size={16} />
            </button>
            <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-500 bg-green-50' : 'text-zinc-400 hover:bg-zinc-100'}`} title="کپی متن">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className={`flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-transparent ${theme.text}`}
          placeholder="اینجا تایپ کنید..."
        />
      </div>

      {/* پیش‌نمایش (Preview) */}
      <div className={`flex flex-col rounded-3xl border shadow-sm overflow-hidden ${theme.card} ${theme.border}`}>
        <div className={`px-4 py-3 border-b ${theme.border} bg-zinc-50 dark:bg-zinc-900/50`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>پیش‌نمایش (Preview)</span>
        </div>
        
        <div className={`flex-1 w-full p-8 overflow-auto markdown-body ${theme.text}`}>
          {/* استایل‌دهی داخلی برای مارک‌داون */}
          <style jsx global>{`
            .markdown-body h1 { font-size: 2em; font-weight: 800; margin-bottom: 0.5em; }
            .markdown-body h2 { font-size: 1.5em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; }
            .markdown-body h3 { font-size: 1.25em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
            .markdown-body p { margin-bottom: 1em; line-height: 1.7; }
            .markdown-body ul { list-style-type: disc; padding-right: 1.5em; margin-bottom: 1em; }
            .markdown-body ol { list-style-type: decimal; padding-right: 1.5em; margin-bottom: 1em; }
            .markdown-body blockquote { border-right: 4px solid #ddd; padding-right: 1em; color: #666; font-style: italic; margin: 1em 0; }
            .markdown-body code { background: rgba(100,100,100,0.1); padding: 0.2em 0.4em; rounded: 4px; font-family: monospace; font-size: 0.9em; border-radius: 6px; }
            .markdown-body pre { background: #1e1e1e; color: #eee; padding: 1em; border-radius: 12px; overflow-x: auto; margin: 1em 0; direction: ltr; text-align: left; }
            .markdown-body pre code { background: transparent; padding: 0; color: inherit; }
            .markdown-body a { color: #3b82f6; text-decoration: underline; }
            .markdown-body hr { border: 0; border-top: 2px solid #eee; margin: 2em 0; }
            .markdown-body img { max-width: 100%; border-radius: 12px; }
            .markdown-body table { width: 100%; border-collapse: collapse; margin: 1em 0; }
            .markdown-body th, .markdown-body td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            .markdown-body th { background-color: rgba(0,0,0,0.05); font-weight: bold; }
          `}</style>
          
          <ReactMarkdown>{markdown}</ReactMarkdown>
          
        </div>
      </div>

    </div>
  );
}
