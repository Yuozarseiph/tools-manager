// data/docs.tsx
import { Book, FileText, Zap, ShieldCheck, MonitorSmartphone, CheckCircle2, AlertTriangle, HelpCircle, Cpu, Info, Lock, Terminal, Globe, BarChart3 } from 'lucide-react';
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
              وقتی شما یک فایل PDF را برای ادغام انتخاب می‌کنید، یا عکسی را برای فشرده‌سازی آپلود می‌کنید، این فایل <strong>هرگز</strong> از دستگاه شما خارج نمی‌شود. هیچ سروری در پشت صحنه وجود ندارد که فایل‌های شما را دریافت کند. تمام کدها در حافظه موقت مرورگر شما (RAM) اجرا می‌شوند و پس از بستن تب، همه چیز پاک می‌شود. این امن‌ترین روش ممکن برای کار با اسناد محرمانه سازمانی و شخصی است.
            </p>
          </div>

          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.card}`}>
            <h3 className={`font-bold text-xl flex items-center gap-3 mb-4 ${theme.accent}`}>
              <Cpu size={24} /> قدرت پردازش Native با WASM
            </h3>
            <p className={`text-sm leading-relaxed opacity-90 ${theme.textMuted}`}>
              جاوااسکریپت برای کارهای سنگین محدودیت دارد. به همین دلیل، ما برای پردازش‌های سنگین (مثل انکودینگ تصویر یا رمزنگاری)، از ماژول‌های <strong>WebAssembly</strong> استفاده می‌کنیم. این ماژول‌ها معمولاً با زبان‌هایی مثل C++ یا Rust نوشته شده‌اند و در مرورگر کامپایل می‌شوند تا سرعتی نزدیک به نرم‌افزارهای دسکتاپ را ارائه دهند.
            </p>
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-6 ${theme.text}`}>قابلیت نصب (PWA) و استفاده آفلاین</h2>
        <div className={`mb-8 p-6 border-l-4 ${theme.border} ${theme.card} border-l-blue-500`}>
          <p className={`mb-4 leading-relaxed ${theme.textMuted}`}>
            این وبسایت یک <strong>Progressive Web App</strong> کامل است. این یعنی تمام فایل‌های ضروری (HTML, CSS, JS و ماژول‌های WASM) در اولین بازدید، در حافظه Cache مرورگر شما ذخیره می‌شوند (Service Worker).
          </p>
          <p className={`leading-relaxed ${theme.textMuted}`}>
            نتیجه؟ اگر همین حالا اینترنت خود را قطع کنید و صفحه را رفرش کنید، سایت همچنان باز می‌شود و تمام ابزارها (حتی ادغام PDF و فشرده‌سازی عکس) بدون هیچ مشکلی کار می‌کنند. شما عملاً یک نرم‌افزار دسکتاپ دارید که در قالب وبسایت ارائه شده است.
          </p>
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
                <li>سند نهایی ذخیره و لینک دانلود تولید می‌شود.</li>
              </ol>
            </div>
            
            <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
              <h4 className={`font-bold mb-4 text-lg ${theme.text}`}>محدودیت‌ها و راهکارها:</h4>
              <ul className={`space-y-4 ${theme.textMuted}`}>
                <li className="flex gap-3">
                  <AlertTriangle className="shrink-0 text-yellow-500" size={20} />
                  <span><strong>فایل‌های رمزدار:</strong> اگر فایل PDF دارای User Password باشد، کتابخانه نمی‌تواند آن را بخواند. ابتدا باید با ابزارهای دیگر (یا رمز صحیح) قفل آن را باز کنید.</span>
                </li>
                <li className="flex gap-3">
                  <BarChart3 className="shrink-0 text-blue-500" size={20} />
                  <span><strong>مدیریت حافظه:</strong> ادغام ۱۰۰ فایل ۱۰ مگابایتی به حدود ۱ گیگابایت رم نیاز دارد. اگر مرورگر کرش کرد، فایل‌ها را در دسته‌های کوچکتر ادغام کنید.</span>
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
              رسم متن فارسی روی Canvas چالش‌برانگیز است چون مرورگرها گاهی حروف جدا (م، ن، ت) را به جای حروف چسبان رندر می‌کنند یا جهت متن را به هم می‌ریزند.
              <br/>
              موتور ما از الگوریتم‌های <strong>Bi-directional Text (BiDi)</strong> استفاده می‌کند تا مطمئن شود کلمات فارسی درست نمایش داده می‌شوند و ترکیب متن فارسی و انگلیسی (مثل: "سلام Hello") ساختار جمله را به هم نمی‌ریزد.
            </p>
            
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`}>
              <Info size={20} className="shrink-0 mt-1" />
              <div>
                <strong>نکته مهم برای فونت‌ها:</strong>
                <p className="text-sm mt-1 opacity-90">
                  در حال حاضر ابزار از فونت‌های پیش‌فرض سیستم (مثل Arial یا Segoe UI) استفاده می‌کند. اگر اعداد فارسی می‌خواهید، مطمئن شوید که تنظیمات ویندوز/سیستم‌عامل شما روی فرمت فارسی تنظیم شده باشد یا از مرورگری استفاده کنید که فونت‌های وب را به درستی جایگزین می‌کند.
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
                <li><strong>حذف متادیتا (EXIF):</strong> اطلاعاتی مثل مدل دوربین، موقعیت GPS و تاریخ عکس حذف می‌شوند (که هم حجم را کم می‌کند و هم حریم خصوصی را حفظ می‌کند).</li>
                <li><strong>کوانتیزاسیون رنگ:</strong> کاهش تعداد رنگ‌های غیرضروری که چشم انسان قادر به تشخیص آنها نیست.</li>
              </ul>
            </div>
            
            <div className={`w-full md:w-72 shrink-0 p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
              <h4 className={`font-bold mb-4 ${theme.text}`}>مشخصات پشتیبانی</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={theme.textMuted}>فرمت‌ها:</span>
                  <span className={`font-bold ${theme.text}`}>JPG, PNG, WebP</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textMuted}>حداکثر حجم:</span>
                  <span className={`font-bold ${theme.text}`}>نامحدود (Client-side)</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textMuted}>نرخ فشرده‌سازی:</span>
                  <span className={`font-bold ${theme.text}`}>تا ۸۰٪</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>استخراج رنگ (Color Picker)</h2>
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            ابزارهای انتخاب رنگ معمولی فقط یک "کد رنگ" به شما می‌دهند. ابزار ما یک <strong>آنالایزر تصویر</strong> است. 
            وقتی عکسی را آپلود می‌کنید، ما آن را روی یک <span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Canvas</span> مخفی رسم می‌کنیم و به دیتای خام پیکسل‌ها (<span className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Uint8ClampedArray</span>) دسترسی پیدا می‌کنیم.
          </p>
          
          <div className={`grid md:grid-cols-3 gap-4`}>
            <div className={`p-5 rounded-xl border ${theme.border} ${theme.card}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${theme.secondary}`}>
                <Zap size={20} />
              </div>
              <h4 className={`font-bold mb-2 ${theme.text}`}>ذره‌بین پیکسلی</h4>
              <p className={`text-sm ${theme.textMuted}`}>
                وقتی موس را حرکت می‌دهید، ما یک ناحیه ۱۱x۱۱ پیکسلی را بزرگنمایی می‌کنیم تا بتوانید دقیقاً همان پیکسلی که می‌خواهید را انتخاب کنید.
              </p>
            </div>
            
            <div className={`p-5 rounded-xl border ${theme.border} ${theme.card}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${theme.secondary}`}>
                <BarChart3 size={20} />
              </div>
              <h4 className={`font-bold mb-2 ${theme.text}`}>پالت رنگی غالب</h4>
              <p className={`text-sm ${theme.textMuted}`}>
                با استفاده از الگوریتم K-Means Clustering، تمام پیکسل‌های عکس آنالیز شده و ۵ رنگ اصلی که هویت بصری عکس را تشکیل می‌دهند استخراج می‌شوند.
              </p>
            </div>
            
            <div className={`p-5 rounded-xl border ${theme.border} ${theme.card}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${theme.secondary}`}>
                <Terminal size={20} />
              </div>
              <h4 className={`font-bold mb-2 ${theme.text}`}>تبدیل فرمت‌ها</h4>
              <p className={`text-sm ${theme.textMuted}`}>
                رنگ انتخابی همزمان به فرمت‌های HEX, RGB, HSL و CMYK (برای چاپ) تبدیل می‌شود.
              </p>
            </div>
          </div>
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
          
          <div className={`p-6 rounded-2xl bg-red-500/5 border border-red-500/20 mb-8`}>
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={20}/> چرا Math.random() خطرناک است؟
            </h4>
            <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
              بسیاری از سایت‌ها برای تولید رمز از تابع <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">Math.random()</span> جاوااسکریپت استفاده می‌کنیم. این تابع "شبه تصادفی" (Pseudo-random) است، یعنی اگر کسی الگوریتم و زمان تولید (Seed) را بداند، می‌تواند رمز بعدی را پیش‌بینی کند!
            </p>
          </div>

          <p className={`mb-4 text-lg leading-loose ${theme.textMuted}`}>
            ما در اینجا از API استاندارد مرورگر به نام 
            <span className={`font-mono font-bold mx-2 px-1 rounded bg-zinc-100 dark:bg-zinc-800 ${theme.accent}`}>window.crypto.getRandomValues()</span>
            استفاده می‌کنیم. این تابع مستقیماً به منبع آنتروپی سیستم عامل (مثل نویز حرارتی CPU یا حرکات موس) متصل است و اعدادی تولید می‌کند که <strong>به هیچ وجه</strong> قابل پیش‌بینی نیستند.
          </p>
        </section>

        <section>
          <h2 className={`text-3xl font-bold mb-6 ${theme.text}`}>مولد هش (Hash Generator)</h2>
          <p className={`mb-6 text-lg leading-loose ${theme.textMuted}`}>
            هشینگ فرآیند تبدیل متن به یک رشته با طول ثابت است که "اثر انگشت" دیجیتال آن متن محسوب می‌شود. حتی تغییر یک حرف در متن ورودی، کل هش خروجی را تغییر می‌دهد (Avalanche Effect).
          </p>
          
          <div className={`overflow-hidden rounded-2xl border ${theme.border}`}>
            <table className="w-full text-sm text-right">
              <thead className={`${theme.secondary}`}>
                <tr>
                  <th className={`p-4 font-bold ${theme.text}`}>الگوریتم</th>
                  <th className={`p-4 font-bold ${theme.text}`}>طول خروجی</th>
                  <th className={`p-4 font-bold ${theme.text}`}>امنیت</th>
                  <th className={`p-4 font-bold ${theme.text}`}>کاربرد توصیه شده</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.border} ${theme.card}`}> 
                <tr>
                  <td className={`p-4 font-mono font-bold ${theme.text}`}>MD5</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>128-bit</td>
                  <td className="p-4 text-red-500 font-bold">شکسته شده ❌</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>فقط برای چک‌سام فایل (غیر امنیتی)</td>
                </tr>
                <tr>
                  <td className={`p-4 font-mono font-bold ${theme.text}`}>SHA-1</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>160-bit</td>
                  <td className="p-4 text-orange-500 font-bold">ضعیف ⚠️</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>سیستم‌های قدیمی (Git قدیمی)</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-green-600 dark:text-green-400">SHA-256</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>256-bit</td>
                  <td className="p-4 text-green-600 dark:text-green-400 font-bold">بسیار امن ✅</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>بلاکچین، پسوردها، امضای دیجیتال</td>
                </tr>
                <tr>
                  <td className="p-4 font-mono font-bold text-green-600 dark:text-green-400">SHA-512</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>512-bit</td>
                  <td className="p-4 text-green-600 dark:text-green-400 font-bold">نظامی ✅✅</td>
                  <td className={`p-4 opacity-70 ${theme.textMuted}`}>کاربردهای فوق سری</td>
                </tr>
              </tbody>
            </table>
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
                نام شرکت اینترنتی شما (مثل مخابرات، شاتل، ایرانسل) از روی دیتابیس جهانی RIPE استخراج می‌شود. این نام معمولاً دقیق‌ترین راه برای تشخیص VPN است.
              </p>
            </div>
          </div>

          <div className={`mt-8 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20`}>
            <h4 className={`font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2`}>
              <Globe size={20}/> حریم خصوصی در GeoIP
            </h4>
            <p className={`text-sm leading-loose ${theme.textMuted}`}>
              توجه کنید که هیچ وبسایتی نمی‌تواند آدرس دقیق منزل شما را از روی IP پیدا کند. موقعیت نمایش داده شده معمولاً مربوط به <strong>مرکز مخابراتی</strong> یا <strong>دیتاسنتر ISP</strong> در شهر شماست. بنابراین اگر موقعیت شما را چند خیابان یا حتی یک شهر آنطرف‌تر نشان می‌دهد، کاملاً طبیعی است.
            </p>
          </div>
        </section>
      </>
    )
  }
];
