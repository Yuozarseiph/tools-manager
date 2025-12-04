// components/docs/DocSection.tsx
import { ThemePalette } from '@/constants/themes';
import { DocSectionItem } from '@/types/docs';
import { ShieldCheck, Info, Cpu, CheckCircle2 } from 'lucide-react';

interface Props {
  data: DocSectionItem;
  theme: ThemePalette;
  index: number;
}

export default function DocSection({ data, theme, index }: Props) {
  return (
    <div id={data.id} className="scroll-mt-24 mb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-xl shadow-sm ${theme.secondary}`}>
          {index + 1}
        </span>
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block ${theme.bg} border ${theme.border} ${theme.textMuted}`}>
            {data.category}
          </span>
          <h2 className={`text-3xl font-bold ${theme.text}`}>{data.title}</h2>
        </div>
      </div>

      {/* Description */}
      <p className={`text-lg leading-loose mb-8 ${theme.textMuted}`}>
        {data.description}
      </p>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        
        {/* Features List */}
        <div className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
          <h4 className={`font-bold mb-4 text-lg flex items-center gap-2 ${theme.text}`}>
            <CheckCircle2 size={18} className="text-green-500" /> ویژگی‌های کلیدی
          </h4>
          <ul className={`space-y-3 ${theme.textMuted}`}>
            {data.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* How it works (if exists) */}
        {data.howItWorks && (
          <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
            <h4 className={`font-bold mb-4 text-lg flex items-center gap-2 ${theme.text}`}>
              <Cpu size={18} className="text-blue-500" /> عملکرد فنی
            </h4>
            <ol className={`space-y-3 list-decimal list-inside text-sm ${theme.textMuted}`}>
              {data.howItWorks.map((step, i) => (
                <li key={i} className="leading-relaxed pl-1 marker:font-bold marker:text-blue-500">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Technical / Privacy Notes */}
      <div className="space-y-4">
        {data.technicalNote && (
          <div className={`p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800`}>
            <h5 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <Info size={18} /> {data.technicalNote.title}
            </h5>
            <p className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed opacity-90">
              {data.technicalNote.content}
            </p>
          </div>
        )}

        {data.privacyNote && (
          <div className={`p-5 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800`}>
            <h5 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} /> حریم خصوصی
            </h5>
            <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed opacity-90">
              {data.privacyNote}
            </p>
          </div>
        )}
      </div>

      <div className={`h-px w-full mt-12 ${theme.border} bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent`} />
    </div>
  );
}
