'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Send, Github, Twitter, Linkedin } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useState } from 'react';

export default function ContactPage() {
  const theme = useThemeColors();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // اینجا باید لاجیک ارسال ایمیل رو بنویسی (فعلاً شبیه‌سازی می‌کنیم)
    setTimeout(() => {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full pb-20">
        
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ستون اطلاعات */}
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl md:text-5xl font-black mb-6 ${theme.text}`}>تماس با ما 👋</h1>
              <p className={`text-lg leading-relaxed ${theme.textMuted}`}>
                سوالی دارید؟ پیشنهادی برای ابزار جدید دارید؟ یا فقط می‌خواهید سلام کنید؟ 
                ما همیشه خوشحال می‌شویم صدای شما را بشنویم.
              </p>
            </div>

            <div className="space-y-6">
              <ContactItem icon={Mail} title="ایمیل" value="hello@toolsmanager.ir" theme={theme} />
              <ContactItem icon={MapPin} title="آدرس" value="ایران، تهران، فضای ابری ☁️" theme={theme} />
            </div>

            <div className="pt-8 border-t border-dashed border-zinc-300 dark:border-zinc-700">
              <h3 className={`text-sm font-bold mb-4 ${theme.textMuted}`}>شبکه‌های اجتماعی</h3>
              <div className="flex gap-4">
                <SocialBtn icon={Github} href="https://github.com" theme={theme} />
                <SocialBtn icon={Twitter} href="https://twitter.com" theme={theme} />
                <SocialBtn icon={Linkedin} href="https://linkedin.com" theme={theme} />
              </div>
            </div>
          </div>

          {/* ستون فرم */}
          <div className={`p-8 rounded-3xl border shadow-xl ${theme.card} ${theme.border}`}>
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Send size={40} />
                </div>
                <h3 className={`text-2xl font-bold ${theme.text}`}>پیام شما ارسال شد!</h3>
                <p className={theme.textMuted}>به زودی با شما تماس خواهیم گرفت.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-blue-500 font-bold hover:underline"
                >
                  ارسال پیام جدید
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className={`text-xl font-bold mb-6 ${theme.text}`}>ارسال پیام</h3>
                
                <div className="space-y-2">
                  <label className={`text-sm font-bold ${theme.textMuted}`}>نام شما</label>
                  <input 
                    required
                    type="text" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder="مثلاً: علی علوی"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-bold ${theme.textMuted}`}>ایمیل</label>
                  <input 
                    required
                    type="email" 
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className={`w-full p-4 rounded-xl border outline-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder="example@mail.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-bold ${theme.textMuted}`}>پیام</label>
                  <textarea 
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    className={`w-full p-4 rounded-xl border outline-none resize-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={status === 'sending'}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 
                  ${status === 'sending' ? 'bg-zinc-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'}`}
                >
                  {status === 'sending' ? 'در حال ارسال...' : 'ارسال پیام'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, title, value, theme }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.secondary}`}>
        <Icon size={24} className={theme.accent} />
      </div>
      <div>
        <p className={`text-sm font-bold opacity-60 ${theme.textMuted}`}>{title}</p>
        <p className={`text-lg font-semibold ${theme.text}`}>{value}</p>
      </div>
    </div>
  );
}

function SocialBtn({ icon: Icon, href, theme }: any) {
  return (
    <a 
      href={href} 
      target="_blank"
      className={`p-3 rounded-xl border transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${theme.border} ${theme.textMuted} hover:text-blue-500`}
    >
      <Icon size={24} />
    </a>
  );
}
