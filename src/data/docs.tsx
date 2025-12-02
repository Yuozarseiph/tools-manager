// data/docs.tsx
import { Book, FileText, Zap, ShieldCheck, MonitorSmartphone, CheckCircle2, AlertTriangle, HelpCircle, Cpu, Info, Lock, Terminal, Globe, BarChart3, Key, FileLock2 } from 'lucide-react';
import { ThemePalette } from '@/constants/themes';

export const getDocsData = (theme: ThemePalette) => [
  {
    id: 'intro',
    title: 'مقدمه و معماری',
    icon: Book,
    content: (
      <>
        <h1 className={`text-4xl font-black mb-8 ${theme.text}`}>معماری و فلسفه Tools Manager</h1>
        
        <div className={`mb-8 text-lg leading-loose ${theme.textMuted}`}>
          <p className="mb-4">
            خوش آمدید. <strong>Tools Manager</strong> صرفاً یک مجموعه ابزار نیست؛ بلکه تلاشی است برای بازتعریف نحوه تعامل کاربران با ابزارهای تحت وب. در دنیایی که اکثر سرویس‌ها داده‌های شما را به سرورهای ابری منتقل می‌کنند، ما رویکردی کاملاً متفاوت اتخاذ کرده‌ایم: <strong>Client-Side First</strong>.
          </p>
          <p>
            این پلتفرم با استفاده از جدیدترین تکنولوژی‌های وب (Next.js 14, React, WebAssembly) ساخته شده تا قدرتمندترین ابزارهای پردازشی را مستقیماً در مرورگر شما اجرا کند. این یعنی حذف کامل تاخیر شبکه و تضمین ۱۰۰٪ حریم خصوصی.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.card}`}>
            <h3 className={`font-bold text-xl flex items-center gap-3 mb-4 ${theme.accent}`}>
              <Lock size={24} /> حریم خصوصی مطلق (Zero-Knowledge)
            </h3>
            <p className={`text-sm leading-relaxed opacity-90 ${theme.textMuted}`}>
              وقتی شما یک فایل PDF را برای ادغام انتخاب می‌کنید، یا عکسی را برای فشرده‌سازی آپلود می‌کنید، این فایل <strong>هرگز</strong> از دستگاه شما خارج نمی‌شود. هیچ سروری در پشت صحنه وجود ندارد که فایل‌های شما را دریافت کند. تمام کدها در حافظه موقت مرورگر شما (RAM) اجرا می‌شوند و پس از بستن تب، همه چیز پاک می‌شود.
            </p>
          </div>

          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.card}`}>
            <h3 className={`font-bold text-xl flex items-center gap-3 mb-4 ${theme.accent}`}>
              <Cpu size={24} /> قدرت پردازش Native با WASM
            </h3>
            <p className={`text-sm leading-relaxed opacity-90 ${theme.textMuted}`}>
              جاوااسکریپت برای کارهای سنگین محدودیت دارد. به همین دلیل، ما برای پردازش‌های سنگین (مثل انکودینگ تصویر یا رمزنگاری)، از ماژول‌های <strong>WebAssembly</strong> استفاده می‌کنیم. این ماژول‌ها معمولاً با زبان‌هایی مثل C++ یا Rust نوشته شده‌اند و در مرورگر کامپایل می‌شوند.
            </p>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'pdf-tools',
    title: 'مدیریت اسناد PDF',
    icon: FileText,
    content: (
      <>
        <h1 className={`text-3xl font-black mb-8 ${theme.text}`}>مستندات فنی ابزارهای PDF</h1>
        
        <section className={`mb-16 pb-16 border-b ${theme.border}`}>
          <div className="flex items-center gap-4 mb-6">
            <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-xl ${theme.secondary}`}>1</span>
            <h2 className={`text-3xl font-bold ${theme.text}`}>ادغام فایل‌های PDF (Merge)</h2>
          </div>
          
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            ابزار ادغام PDF ما از کتابخانه مهندسی‌شده 
            <span className={`font-mono px-2 py-0.5 rounded mx-2 text-sm border ${theme.border} ${theme.bg}`}>pdf-lib</span> 
            استفاده می‌کند. این کتابخانه به جای رندر کردن فایل‌ها (که حافظه زیادی مصرف می‌کند)، ساختار داخلی فایل PDF (درخت اشیاء) را دستکاری می‌کند.
          </p>

          <div className={`grid lg:grid-cols-2 gap-8 mb-8`}>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
              <h4 className={`font-bold mb-4 text-lg ${theme.text}`}>نحوه عملکرد فنی:</h4>
              <ol className={`space-y-3 list-decimal list-inside ${theme.textMuted}`}>
                <li>فایل‌ها به صورت <span className="font-mono text-xs bg-black/5 dark:bg-white/10 px-1 rounded">ArrayBuffer</span> در حافظه بارگذاری می‌شوند.</li>
                <li>هدر و متادیتای هر فایل خوانده می‌شود تا تعداد صفحات و سایز آنها استخراج شود.</li>
                <li>یک سند PDF خالی جدید ایجاد می‌شود.</li>
                <li>صفحات فایل‌های ورودی صفحه به صفحه در سند جدید کپی می‌شوند (بدون افت کیفیت).</li>
              </ol>
            </div>
            
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
              <h4 className={`font-bold mb-4 text-lg ${theme.text}`}>محدودیت‌ها و راهکارها:</h4>
              <ul className={`space-y-4 ${theme.textMuted}`}>
                <li className="flex gap-3">
                  <AlertTriangle className="shrink-0 text-yellow-500" size={20} />
                  <span><strong>فایل‌های رمزدار:</strong> اگر فایل PDF دارای User Password باشد، کتابخانه نمی‌تواند آن را بخواند. ابتدا باید با ابزارهای دیگر (یا رمز صحیح) قفل آن را باز کنید.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-xl ${theme.secondary}`}>2</span>
            <h2 className={`text-3xl font-bold ${theme.text}`}>تبدیل متن به PDF</h2>
          </div>
          
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            برخلاف اکثر ابزارهای مشابه که از <span className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">window.print()</span> استفاده می‌کنند (که کنترل کمی روی خروجی دارد)، ما یک موتور رندرینگ اختصاصی بر پایه <span className={`font-bold ${theme.accent}`}>HTML5 Canvas</span> توسعه داده‌ایم.
          </p>

          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.card} mb-8`}>
            <h4 className={`font-bold mb-4 text-xl ${theme.text}`}>چالش زبان فارسی (RTL)</h4>
            <p className={`leading-loose mb-4 ${theme.textMuted}`}>
              رسم متن فارسی روی Canvas چالش‌برانگیز است. موتور ما از الگوریتم‌های <strong>Bi-directional Text (BiDi)</strong> استفاده می‌کند تا مطمئن شود کلمات فارسی درست نمایش داده می‌شوند.
            </p>
            
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`}>
              <Info size={20} className="shrink-0 mt-1" />
              <div>
                <strong>نکته مهم برای فونت‌ها:</strong>
                <p className="text-sm mt-1 opacity-90">
                  در حال حاضر ابزار از فونت‌های پیش‌فرض سیستم (مثل Arial یا Segoe UI) استفاده می‌کند. اگر اعداد فارسی می‌خواهید، مطمئن شوید که تنظیمات ویندوز/سیستم‌عامل شما روی فرمت فارسی تنظیم شده باشد.
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  },
  {
    id: 'image-tools',
    title: 'پردازش گرافیکی و تصویر',
    icon: Zap,
    content: (
      <>
        <h1 className={`text-3xl font-black mb-8 ${theme.text}`}>لابراتوار پردازش تصویر</h1>
        
        <section className={`mb-16 pb-16 border-b ${theme.border}`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>کمپرسور هوشمند تصاویر (Image Compression)</h2>
          
          <div className={`flex flex-col md:flex-row gap-8 mb-8`}>
            <div className="flex-1">
              <p className={`text-lg leading-loose mb-4 ${theme.textMuted}`}>
                این ابزار صرفاً سایز عکس را تغییر نمی‌دهد؛ بلکه ساختار باینری فایل را بازنویسی می‌کند. ما از الگوریتم 
                <span className={`font-mono px-2 mx-1 rounded text-sm bg-zinc-100 dark:bg-zinc-800`}>browser-image-compression</span> 
                استفاده می‌کنیم که ترکیبی از تکنیک‌های زیر است:
              </p>
              <ul className={`space-y-2 list-disc list-inside ${theme.textMuted}`}>
                <li><strong>کاهش رزولوشن هوشمند:</strong> اگر عکس بسیار بزرگ باشد (مثلاً ۴۰۰۰ پیکسل)، ابعاد آن به استاندارد وب (۱۹۲۰ پیکسل) کاهش می‌یابد.</li>
                <li><strong>حذف متادیتا (EXIF):</strong> اطلاعاتی مثل مدل دوربین، موقعیت GPS و تاریخ عکس حذف می‌شوند.</li>
                <li><strong>کوانتیزاسیون رنگ:</strong> کاهش تعداد رنگ‌های غیرضروری که چشم انسان قادر به تشخیص آنها نیست.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>استخراج رنگ (Color Picker)</h2>
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            ابزار ما یک <strong>آنالایزر تصویر</strong> است. وقتی عکسی را آپلود می‌کنید، ما آن را روی یک <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Canvas</span> مخفی رسم می‌کنیم و به دیتای خام پیکسل‌ها دسترسی پیدا می‌کنیم.
          </p>
        </section>
      </>
    )
  },
  {
    id: 'security',
    title: 'امنیت و کریپتوگرافی',
    icon: ShieldCheck,
    content: (
      <>
        <h1 className={`text-3xl font-black mb-8 ${theme.text}`}>ابزارهای امنیت سایبری</h1>
        
        <section className={`mb-16 pb-16 border-b ${theme.border}`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>پسورد ساز امن (Secure Password Generator)</h2>
          
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            <strong>چرا انتخاب یک پسورد امن اهمیت دارد؟</strong><br/>
            پسورد اولین و مهم‌ترین لایه دفاعی هر حساب کاربری است. انتخاب یک پسورد ضعیف می‌تواند منجر به دسترسی غیرمجاز، سرقت اطلاعات، و حتی نفوذ کامل به حساب‌های حساس شود. ابزار «پسوردساز امن» این سایت طراحی شده تا رمزهایی تولید کند که در برابر حملات رایج مانند Brute Force، Dictionary Attack و Guessing مقاوم باشند.
          </p>

          <div className={`p-6 rounded-2xl bg-red-500/5 border border-red-500/20 mb-8`}>
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20}/> چرا استفاده از Math.random() خطرناک است؟
            </h4>
            <p className={`text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
              بسیاری از وب‌سایت‌ها برای تولید اعداد تصادفی از تابع <span className="font-mono px-1">Math.random()</span> در جاوااسکریپت استفاده می‌کنند. این تابع در واقع شبه‌تصادفی (Pseudo-Random) است، یعنی خروجی آن بر اساس الگوریتم‌های قابل پیش‌بینی تولید می‌شود.
            </p>
            <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
              اگر مهاجم به الگوریتم تولید دسترسی داشته باشد یا بتواند زمان تولید رمز (Seed) را تشخیص دهد، در این صورت قادر خواهد بود الگوها را تحلیل کرده و رمزهای بعدی را با احتمال بالا حدس بزند.
            </p>
          </div>

          <div className={`grid md:grid-cols-2 gap-6 mb-8`}>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
                <CheckCircle2 className="text-green-500" /> راهکار ما چیست؟
              </h4>
              <p className={`text-sm leading-loose ${theme.textMuted}`}>
                در این ابزار از API استاندارد مرورگر به نام:
                <br/>
                <span className={`font-mono text-xs block my-2 p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-center ${theme.accent}`}>window.crypto.getRandomValues()</span>
                استفاده می‌شود. این API مستقیماً به منابع آنتروپی سطح سیستم‌عامل متصل است؛ منابعی مانند:
              </p>
              <ul className={`text-sm list-disc list-inside mt-2 space-y-1 opacity-80 ${theme.textMuted}`}>
                <li>نویز سخت‌افزاری پردازنده</li>
                <li>تغییرات سطح ولتاژ</li>
                <li>حرکت فیزیکی موس</li>
                <li>وضعیت درایورها و سخت‌افزارها</li>
              </ul>
            </div>

            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
               <h4 className={`font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
                <Key className="text-blue-500" /> ویژگی‌های پسورد تولیدی
              </h4>
              <ul className={`text-sm space-y-2 ${theme.textMuted}`}>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> طول بالا و قابل تنظیم</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ترکیب همزمان حروف (بزرگ/کوچک)، اعداد و نمادها</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> توزیع یکنواخت کاراکترها</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> بدون الگوی تکرار قابل تشخیص</li>
              </ul>
            </div>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${theme.border}`}>
            <div className={`p-4 text-center font-bold border-b ${theme.secondary} ${theme.border}`}>
              جدول سنجش آنتروپی (سطح امنیت)
            </div>
            <div className="grid grid-cols-2 divide-x divide-x-reverse">
              <div className="p-4 text-center bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-l border-zinc-200 dark:border-zinc-800">
                <div className="font-bold text-lg">کمتر از 60 بیت</div>
                <div className="text-sm opacity-80">ضعیف</div>
              </div>
              <div className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400">
                <div className="font-bold text-lg">60 تا 80 بیت</div>
                <div className="text-sm opacity-80">قابل قبول</div>
              </div>
              <div className="p-4 text-center bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-l border-zinc-200 dark:border-zinc-800 border-t">
                <div className="font-bold text-lg">80 تا 110 بیت</div>
                <div className="text-sm opacity-80">بسیار قوی</div>
              </div>
              <div className="p-4 text-center bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-t border-zinc-200 dark:border-zinc-800">
                <div className="font-bold text-lg">بالاتر از 110</div>
                <div className="text-sm opacity-80">سطح نظامی</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>مولد هش (Hash Generator)</h2>
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            <strong>هش چیست؟</strong><br/>
            هشینگ فرآیند تبدیل یک متن ورودی به خروجی با طول ثابت است که به آن "اثر انگشت دیجیتال" داده می‌شود.
            اگر تنها یک کاراکتر از ورودی تغییر کند، خروجی هش به‌طور کامل تغییر می‌کند. این پدیده به نام <strong>Avalanche Effect</strong> شناخته می‌شود.
          </p>
          
          <div className={`overflow-hidden rounded-2xl border mb-8 ${theme.border}`}>
            <table className="w-full text-sm text-right">
              <thead className={`${theme.secondary}`}>
                <tr>
                  <th className={`p-4 font-bold ${theme.text}`}>الگوریتم</th>
                  <th className={`p-4 font-bold ${theme.text}`}>طول خروجی</th>
                  <th className={`p-4 font-bold ${theme.text}`}>وضعیت امنیت</th>
                  <th className={`p-4 font-bold ${theme.text}`}>کاربرد پیشنهادی</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.border} ${theme.card}`}>
                <tr>
                  <td className={`p-4 font-mono font-bold ${theme.text}`}>MD5</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>128 بیت</td>
                  <td className="p-4 text-red-500 font-bold">شکسته شده ❌</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>فقط بررسی سلامت فایل</td>
                </tr>
                <tr>
                  <td className={`p-4 font-mono font-bold ${theme.text}`}>SHA-1</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>160 بیت</td>
                  <td className="p-4 text-orange-500 font-bold">ضعیف ⚠️</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>سیستم‌های قدیمی</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-green-600 dark:text-green-400">SHA-256</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>256 بیت</td>
                  <td className="p-4 text-green-600 dark:text-green-400 font-bold">بسیار امن ✅</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>بلاکچین، پسورد، API</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-green-600 dark:text-green-400">SHA-512</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>512 بیت</td>
                  <td className="p-4 text-green-600 dark:text-green-400 font-bold">امنیت سطح نظامی ✅✅</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>سامانه‌های حساس</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={`grid md:grid-cols-2 gap-6`}>
            <div className={`p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800`}>
               <h5 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                 <FileLock2 size={18} /> هش ≠ رمزنگاری
               </h5>
               <p className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed opacity-90">
                 توجه داشته باشید هش کردن با رمزنگاری متفاوت است. هش <strong>قابل بازگشت نیست</strong> اما رمزنگاری قابل رمزگشایی است. بنابراین هش برای ذخیره رمز و اعتبارسنجی فوق‌امن است.
               </p>
            </div>
            <div className={`p-5 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800`}>
               <h5 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                 <ShieldCheck size={18} /> حریم خصوصی کاربران
               </h5>
               <ul className="text-sm text-green-900 dark:text-green-100 space-y-1 opacity-90">
                 <li>✅ تمام پردازش‌ها در مرورگر شما انجام می‌شود</li>
                 <li>✅ هیچ داده‌ای به سرور ارسال نمی‌گردد</li>
                 <li>✅ هیچ رمزی ذخیره نمی‌شود و لاگ برداشته نمی‌شود</li>
               </ul>
            </div>
          </div>

        </section>
      </>
    )
  },
  {
    id: 'system',
    title: 'اطلاعات سیستم و شبکه',
    icon: MonitorSmartphone,
    content: (
      <>
        <h1 className={`text-3xl font-black mb-8 ${theme.text}`}>تحلیل شبکه و سخت‌افزار</h1>
        
        <section className={`mb-16`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>آی‌پی و موقعیت یابی (GeoIP)</h2>
          
          <p className={`mb-8 text-lg leading-loose ${theme.textMuted}`}>
            اینترنت یک شبکه جهانی از روترهاست. هر دستگاهی که به اینترنت وصل می‌شود یک آدرس IP منحصر به فرد دارد. ابزار ما با اتصال به چندین API معتبر (برای اطمینان از صحت داده)، اطلاعات زیر را استخراج می‌کند:
          </p>

          <div className={`grid md:grid-cols-2 gap-6`}>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
              <h4 className={`font-bold mb-2 ${theme.text}`}>IPv4 vs IPv6</h4>
              <p className={`text-sm ${theme.textMuted}`}>
                اکثر کاربران هنوز از IPv4 (مثل 192.168.1.1) استفاده می‌کنند، اما اگر ISP شما مدرن باشد، ممکن است آدرس طولانی IPv6 را هم ببینید. ما هر دو را تشخیص می‌دهیم.
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
              <h4 className={`font-bold mb-2 ${theme.text}`}>ISP (سرویس‌دهنده)</h4>
              <p className={`text-sm ${theme.textMuted}`}>
                نام شرکت اینترنتی شما (مثل مخابرات، شاتل، ایرانسل) از روی دیتابیس جهانی RIPE استخراج می‌شود.
              </p>
            </div>
          </div>

          <div className={`mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20`}>
            <h4 className={`font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2`}>
              <Globe size={20}/> حریم خصوصی در GeoIP
            </h4>
            <p className={`text-sm leading-loose ${theme.textMuted}`}>
              توجه کنید که هیچ وبسایتی نمی‌تواند آدرس دقیق منزل شما را از روی IP پیدا کند. موقعیت نمایش داده شده معمولاً مربوط به <strong>مرکز مخابراتی</strong> یا <strong>دیتاسنتر ISP</strong> در شهر شماست.
            </p>
          </div>
        </section>
      </>
    )
  }
];
