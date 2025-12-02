// app/privacy/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Database, UserX, ServerOff, Cookie, Lock, History, Mail, CheckCircle2 } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function PrivacyPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg} transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto px-6 pt-10 w-full pb-20">
        
        {/* دکمه بازگشت */}
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-12 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* هدر اصلی */}
          <div className="text-center mb-16">
            <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 shadow-xl ${theme.border} ${theme.secondary}`}>
              <ShieldCheck size={48} className={theme.accent} />
            </div>
            <h1 className={`text-3xl md:text-5xl font-black mb-6 tracking-tight ${theme.text}`}>سیاست حفظ حریم خصوصی</h1>
            <p className={`text-lg leading-relaxed max-w-3xl mx-auto ${theme.textMuted}`}>
              در <strong>Tools Manager</strong>، حفاظت از حریم خصوصی شما یک قابلیت اضافی نیست؛ بلکه اصل بنیادین طراحی این پلتفرم است. ما متعهد به شفافیت کامل در نحوه برخورد با داده‌ها هستیم.
            </p>
            <div className={`inline-block mt-6 px-4 py-1.5 rounded-full text-xs font-bold border ${theme.border} ${theme.secondary} ${theme.textMuted}`}>
              آخرین بروزرسانی: ۱۲ آذر ۱۴۰۴
            </div>
          </div>

          {/* باکس اصل شماره یک (بسیار مهم) */}
          <div className={`relative overflow-hidden p-8 md:p-10 rounded-3xl border-2 ${theme.border} ${theme.card} group hover:shadow-2xl hover:shadow-${theme.accent}/10 transition-all duration-500`}>
            {/* افکت نوری پس‌زمینه که با تم تغییر میکند */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 blur-3xl ${theme.primary}`}></div>
            
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 relative z-10 ${theme.text}`}>
              <div className={`p-2 rounded-lg ${theme.secondary}`}>
                <ServerOff size={24} className={theme.accent} />
              </div>
              اصل شماره یک: پردازش محلی و بدون سرور
            </h2>
            
            <p className={`text-lg leading-loose mb-8 relative z-10 ${theme.textMuted}`}>
              Tools Manager هیچ سرور بک‌اند (Back-end) برای پردازش، ذخیره یا تحلیل فایل‌های کاربران ندارد. برخلاف بسیاری از سرویس‌های آنلاین که اطلاعات کاربران را به سرورهای خود منتقل می‌کنند، در اینجا:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 relative z-10">
              <CheckItem text="فایل‌های شما هرگز آپلود نمی‌شوند" theme={theme} />
              <CheckItem text="هیچ داده‌ای از دستگاه شما خارج نمی‌شود" theme={theme} />
              <CheckItem text="تمام پردازش‌ها ۱۰۰٪ در مرورگر شماست" theme={theme} />
              <CheckItem text="فقط از CPU و RAM شما استفاده می‌شود" theme={theme} />
            </div>
          </div>

          {/* بخش چه اطلاعاتی جمع‌آوری نمی‌شود */}
          <div className="grid md:grid-cols-2 gap-6">
            <PrivacyCard 
              icon={Database} 
              title="هیچ فایلی ذخیره نمی‌شود" 
              theme={theme}
            >
              فایل‌های شما (PDF، تصویر، متن و...) تنها به‌صورت موقت در حافظه رم (RAM) مرورگر پردازش شده و بلافاصله پس از پایان عملیات، از حافظه پاک می‌شوند. هیچ نسخه‌ای ذخیره، آرشیو یا منتقل نمی‌گردد.
            </PrivacyCard>

            <PrivacyCard 
              icon={UserX} 
              title="هیچ حساب کاربری وجود ندارد" 
              theme={theme}
            >
              <div className="space-y-3">
                <p className={theme.textMuted}>برای استفاده از ابزارهای ما:</p>
                <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                  <li className="flex items-center gap-2 opacity-80">• ثبت‌نام لازم نیست</li>
                  <li className="flex items-center gap-2 opacity-80">• ایمیل درخواست نمی‌شود</li>
                  <li className="flex items-center gap-2 opacity-80">• رمز عبور وجود ندارد</li>
                </ul>
                <p className={`pt-2 text-sm font-bold ${theme.accent}`}>شما کاملاً ناشناس هستید.</p>
              </div>
            </PrivacyCard>
          </div>

          {/* کوکی‌ها و حافظه محلی */}
          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.card}`}>
            <h2 className={`text-2xl font-bold mb-8 flex items-center gap-3 ${theme.text}`}>
              <Cookie size={26} className={theme.textMuted} /> کوکی‌ها و Local Storage
            </h2>
            
            <div className="space-y-8 divide-y divide-dashed dark:divide-zinc-800 divide-zinc-200">
              <div className="pb-8">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme.text}`}>
                  عدم استفاده از کوکی‌های ردیاب
                </h3>
                <p className={`leading-relaxed ${theme.textMuted}`}>
                  ما از کوکی‌ها برای رهگیری کاربران، تحلیل رفتار، پروفایل‌سازی یا تبلیغات استفاده <strong>نمی‌کنیم</strong>.
                </p>
              </div>

              <div className="pt-8">
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme.text}`}>
                  استفاده محدود از Local Storage
                </h3>
                <p className={`leading-relaxed mb-4 ${theme.textMuted}`}>
                  تنها داده‌ای که به‌صورت محلی ذخیره می‌شود مربوط به <strong>تنظیمات ظاهری سایت</strong> است:
                </p>
                
                {/* باکس تو در تو - هماهنگ با تم */}
                <div className={`p-5 rounded-2xl border ${theme.border} ${theme.secondary}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-white dark:bg-black/20 shadow-sm`}>
                       <History size={20} className={theme.text}/>
                    </div>
                    <div>
                      <strong className={`block text-base mb-1 ${theme.text}`}>انتخاب تم (Theme)</strong>
                      <p className={`text-sm opacity-80 leading-relaxed ${theme.textMuted}`}>
                        برای حفظ تجربه کاربری بهتر، تم انتخابی شما در حافظه مرورگر ذخیره می‌شود تا در مراجعه‌های بعدی همان ظاهر نمایش داده شود. این داده اطلاعات شخصی نیست و به هیچ سروری ارسال نمی‌شود.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* امنیت داده‌ها - باکس ویژه */}
          <div className={`p-8 rounded-3xl border relative overflow-hidden ${theme.border} ${theme.card}`}>
            {/* استفاده از گرادینت تم برای پس‌زمینه */}
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-r ${theme.gradient}`}></div>
            
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 relative z-10 ${theme.text}`}>
              <Lock size={26} className={theme.accent} /> امنیت داده‌ها
            </h2>
            
            <p className={`leading-loose mb-8 relative z-10 ${theme.textMuted}`}>
              با توجه به عدم وجود سرور ذخیره‌سازی، معماری ما عمداً به گونه‌ای انتخاب شده تا ریسک نشت اطلاعات به صفر نزدیک شود:
            </p>
            
            <div className="grid sm:grid-cols-3 gap-4 relative z-10">
              <SecurityStat label="پایگاه داده برای نفوذ" value="0" theme={theme} />
              <SecurityStat label="اطلاعات برای سرقت" value="0" theme={theme} />
              <SecurityStat label="داده برای فروش" value="0" theme={theme} />
            </div>
            
            <p className={`mt-8 text-center font-bold text-lg relative z-10 ${theme.accent}`}>
              "اگر داده‌ای نداریم، چیزی هم فاش نمی‌شود."
            </p>
          </div>

          {/* فوتر بخش حریم خصوصی */}
          <div className={`grid md:grid-cols-2 gap-8 border-t border-dashed pt-10 ${theme.border}`}>
            <div>
               <h3 className={`font-bold mb-3 ${theme.text}`}>تغییرات در سیاست حریم خصوصی</h3>
               <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                 در صورت تغییر این سیاست، تاریخ بروزرسانی تغییر خواهد کرد و نسخه جدید در همین صفحه منتشر می‌شود. استفاده مستمر از سایت به‌منزله پذیرش آخرین نسخه است.
               </p>
            </div>
            <div>
               <h3 className={`font-bold mb-3 ${theme.text}`}>تماس با ما</h3>
               <p className={`text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                 در صورت داشتن هرگونه سؤال درباره حریم خصوصی، می‌توانید از بخش تماس با ما با پشتیبانی در ارتباط باشید.
               </p>
               <Link href="/contact" className={`inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${theme.primary} hover:brightness-110 shadow-lg shadow-${theme.accent}/20`}>
                 <Mail size={16} /> تماس با پشتیبانی
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- کامپوننت‌های داخلی برای تمیزی کد ---

function CheckItem({ text, theme }: { text: string, theme: any }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${theme.border} bg-white/50 dark:bg-black/20`}>
      <CheckCircle2 size={18} className={theme.accent} />
      <span className={`text-sm font-medium ${theme.text}`}>{text}</span>
    </div>
  );
}

function PrivacyCard({ icon: Icon, title, children, theme }: any) {
  return (
    <div className={`p-6 rounded-2xl border flex flex-col h-full transition-colors duration-300 ${theme.border} ${theme.card}`}>
      <div className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center ${theme.secondary}`}>
        <Icon size={24} className={theme.accent} />
      </div>
      <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>{title}</h3>
      <div className={`text-sm leading-loose flex-1 ${theme.textMuted}`}>
        {children}
      </div>
    </div>
  );
}

function SecurityStat({ label, value, theme }: any) {
  return (
    <div className={`p-4 rounded-2xl text-center border ${theme.border} ${theme.bg}`}>
      <div className={`font-black text-3xl mb-1 ${theme.text}`}>{value}</div>
      <div className={`text-xs font-medium opacity-70 ${theme.textMuted}`}>{label}</div>
    </div>
  );
}
