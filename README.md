```markdown
<div align="center">

# 🛠️ ToolsManager

**[translate:جعبه‌ابزار مدرن و همه‌کاره برای توسعه‌دهندگان و کاربران عادی]**  
**[translate:A Modern & All-in-One Toolkit for Developers and Everyday Users]**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[translate:مشاهده دمو] | [translate:Live Demo]
[https://tools-manager.vercel.app](https://tools-manager.vercel.app)

</div>

---

## 📖 [translate:معرفی پروژه] (Introduction)

**[translate:تولز منیجر]** [translate:مجموعه‌ای قدرتمند از ابزارهای وب‌محور است که با هدف ساده‌سازی کارهای روزمره طراحی شده است. از تبدیل فرمت‌های فایل و ویرایش تصاویر گرفته تا ابزارهای مخصوص برنامه‌نویسان (مثل Base64، JSON Formatter) و محاسبات کاربردی، همه در یک رابط کاربری مدرن، سریع و واکنش‌گرا گردآوری شده‌اند.]

**ToolsManager** is a powerful suite of web-based utilities designed to simplify daily tasks. From file conversion and image editing to developer-centric tools (like Base64, JSON Formatter) and utility calculations, everything is gathered in a modern, fast, and responsive interface.

---

## ✨ [translate:ویژگی‌های کلیدی] (Key Features)

<details open>
<summary>🇮🇷 <b>[translate:فارسی]</b></summary>

- **[translate:رابط کاربری مدرن و واکنش‌گرا]**: [translate:طراحی شده با Tailwind CSS برای نمایش عالی در موبایل و دسکتاپ.]
- **[translate:پشتیبانی کامل از تم تاریک و روشن]**: [translate:سوییچ خودکار و دستی بین حالت‌های Dark/Light.]
- **[translate:کاملاً دو‌زبانه]**: [translate:پشتیبانی هم‌زمان از زبان فارسی (RTL) و انگلیسی (LTR).]
- **[translate:پردازش سمت کلاینت]**: [translate:بسیاری از ابزارها (مانند تبدیل عکس و PDF) برای حفظ حریم خصوصی، فایل‌ها را در مرورگر پردازش می‌کنند.]
- **[translate:معماری ماژولار]**: [translate:افزودن ابزار جدید بسیار ساده است و هر ابزار استیت و لاجیک مستقل دارد.]
- **[translate:بهینه‌سازی شده برای SEO]**: [translate:استفاده از متاتگ‌های داینامیک و ساختار استاندارد Next.js.]

</details>

<details>
<summary>🇺🇸 <b>English</b></summary>

- **Modern & Responsive UI**: Built with Tailwind CSS for a seamless experience on mobile and desktop.
- **Full Dark/Light Mode Support**: Automatic and manual switching between themes.
- **Fully Bilingual**: Simultaneous support for Persian (RTL) and English (LTR).
- **Client-Side Processing**: Many tools (like Image & PDF converters) process files directly in the browser for privacy.
- **Modular Architecture**: Adding new tools is straightforward, with independent state and logic for each utility.
- **SEO Optimized**: Utilizes dynamic meta tags and Next.js standard practices.

</details>

---

## 🧰 [translate:لیست ابزارها] (Tools List)

| [translate:دسته‌بندی] (Category) | [translate:ابزارها] (Tools) |
| :--- | :--- |
| **[translate:توسعه‌دهنده] (Dev)** | JSON Formatter, Base64 Converter, Hash Generator, Code Visualizer, User Agent Parser |
| **[translate:تصویر] (Image)** | Image Compressor, Image Converter, Image Resizer, Color Picker, QR Generator |
| **[translate:اسناد] (Document)** | Word to PDF, Text to PDF, PDF Merger, Image to PDF, Excel Viewer/Editor |
| **[translate:متن و محتوا] (Text)** | Markdown Editor, Word Counter, Password Generator |
| **[translate:کاربردی] (Utility)** | Date Converter (Shamsi/Gregorian), Unit Converter, IP Checker, Audio Editor |

---

## 🚀 [translate:شروع کار] (Getting Started)

### [translate:پیش‌نیازها] (Prerequisites)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### [translate:نصب و راه‌اندازی] (Installation)

1. **[translate:کلون کردن مخزن] (Clone the repository):**
   ```
   git clone https://github.com/your-username/tools-manager.git
   cd tools-manager
   ```

2. **[translate:نصب وابستگی‌ها] (Install dependencies):**
   ```
   npm install
   # or
   yarn install
   ```

3. **[translate:اجرای سرور توسعه] (Run development server):**
   ```
   npm run dev
   # or
   yarn dev
   ```

4. **[translate:مشاهده در مرورگر] (Open in browser):**
   [translate:به آدرس] `http://localhost:3000` [translate:بروید.]
   Navigate to `http://localhost:3000`.

---

## 📂 [translate:ساختار پروژه] (Project Structure)

```
tools-manager/
├── app/                  # Next.js App Router (pages & layouts)
│   ├── [locale]/         # Internationalization routing (fa/en)
│   │   ├── tools/        # Individual tool pages
│   │   └── ...
├── components/           # Reusable UI components (Header, Footer, Inputs)
├── context/              # React Contexts (Theme, Language)
├── data/                 # Static data & tool configurations (JSONs)
├── hooks/                # Custom React Hooks
├── public/               # Static assets (images, fonts, icons)
└── utils/                # Helper functions & shared logic
```

---

## 🤝 [translate:مشارکت] (Contribution)

**[translate:ما از مشارکت شما استقبال می‌کنیم!]**  
[translate:اگر ایده‌ای برای ابزار جدید دارید یا باگی پیدا کردید، خوشحال می‌شویم کمک کنید.]

**We welcome your contributions!**  
If you have an idea for a new tool or found a bug, we'd love your help.

1. [translate:این مخزن را Fork کنید.] (Fork this repository.)
2. [translate:یک شاخه جدید بسازید.] (Create a new branch: `git checkout -b feature/AmazingTool`)
3. [translate:تغییرات خود را Commit کنید.] (Commit your changes: `git commit -m 'Add AmazingTool'`)
4. [translate:شاخه را Push کنید.] (Push to the branch: `git push origin feature/AmazingTool`)
5. [translate:یک Pull Request ثبت کنید.] (Open a Pull Request.)

---

## 📜 [translate:مجوز] (License)

[translate:این پروژه تحت مجوز MIT منتشر شده است.]  
This project is licensed under the MIT License.

---

<div align="center">

**Made with ❤️ by [Your Name / Team Name]**

[translate:حمایت مالی] | [Donate](https://reymit.ir/yuozarseiph)

</div>
```