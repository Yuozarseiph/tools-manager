# QodeForge

QodeForge is a bilingual collection of browser-based tools for files, images, documents, development and everyday tasks. See the current development documentation below for the latest interface and export behavior.

***
## License

QodeForge is proprietary software.

Personal, non-commercial use only.  
Copying, commercial use, redistribution, and reuse of the code or UI design are strictly prohibited.  
See the [LICENSE](./LICENSE) file for full terms.

##  Architecture Overview

QodeForge is built with the Next.js App Router (`app` directory) and uses a locale-aware route segment (`[locale]`) to support both Persian (RTL) and English (LTR) in a single codebase.[1][2]
Each tool has its own route under `/app/[locale]/tools/...` and a corresponding implementation in `src/components/tools`, plus a small i18n content JSON and hook to keep UI text separate from logic.[3]
Most tools are pure client-side utilities implemented as Client Components (`"use client"`), so they can freely use React hooks and browser APIs while still being statically prerendered at build time.[4][5]

***

##  Project & Tool Structure

At a high level, the project is organized like this (simplified):

- `app/[locale]/tools/<tool-slug>/page.tsx`  
  Route entry for each tool in the App Router.  
- `src/components/tools/<category>/<tool-slug>/`  
  Actual tool UI and logic (one main `*Tool.tsx` component, plus subcomponents if needed).  
- `src/components/tools/<category>/<tool-slug>/<tool-slug>.i18n.json`  
  Localized strings for that tool, typically shaped as `{ "fa": {...}, "en": {...} }`.  
- `src/components/tools/<category>/<tool-slug>/<tool-slug>.content.ts`  
  A small hook (`useXxxContent`) that reads the JSON and returns the right language based on `LanguageContext`.  
- `src/context/LanguageContext.tsx`  
  Provides current locale (`fa` / `en`) to all client components.  
- `src/hooks/useThemeColors.ts`  
  Centralized theming hook (dark/light mode, card/background/border classes).  

This separation lets you:  
- Keep routing (App Router) and layout concerns in `app`.  
- Keep visual logic and stateful code in `components/tools`.  
- Keep copy, descriptions, and UI labels in JSON, making it trivial to localize or tweak text without touching logic.

***

##  Anatomy of a Single Tool Module

A fully integrated tool usually consists of:

1. **Route file (App Router page):**  
   - Path: `app/[locale]/tools/<tool-slug>/page.tsx`  
   - Responsibilities:  
     - Export a default React component for the page.  
     - Render layout wrappers if needed and include the main `<XxxTool />` component from `src/components/tools/...`.  

2. **Tool component(s):**  
   - Path: `src/components/tools/<category>/<tool-slug>/<XxxTool>.tsx`  
   - Responsibilities:  
     - Marked `"use client"` at the top.  
     - Use `useThemeColors()` for consistent styling.  
     - Use `useLanguage()` or a dedicated `useXxxContent()` hook to pull localized texts.  
     - Implement actual logic (uploading files, text processing, drawing, etc.).  

3. **i18n content JSON:**  
   - Path: `src/components/tools/<category>/<tool-slug>/<tool-slug>.i18n.json`  
   - Shape (example pattern you already use for audio-editor / code-visualizer):  
     ```json
     {
       "fa": {
         "id": "my-tool",
         "category": "dev",
         "title": "عنوان فارسی",
         "description": "توضیح ابزار...",
         "features": ["...", "..."],
         "ui": { /* all UI strings */ }
       },
       "en": {
         "id": "my-tool",
         "category": "dev",
         "title": "My Tool",
         "description": "Description...",
         "features": ["...", "..."],
         "ui": { /* same keys as fa */ }
       }
     }
     ```
   - This mirrors the structure you used for `audio-editor` and `code-visualizer`, including a `ui` object with nested sections (tabs, header, actions, errors, etc.).[6]

4. **Content hook:**  
   - Path: `src/components/tools/<category>/<tool-slug>/<tool-slug>.content.ts`  
   - Typical shape:  
     ```ts
     "use client";

     import rawContent from "./my-tool.i18n.json";
     import { useLanguage } from "@/context/LanguageContext";

     export type MyToolContent = (typeof rawContent)["fa"]; // same structure for fa/en

     const CONTENT_BY_LOCALE = rawContent as Record<"fa" | "en", MyToolContent>;

     export function useMyToolContent(): MyToolContent {
       const { locale } = useLanguage();
       return CONTENT_BY_LOCALE[locale === "en" ? "en" : "fa"];
     }
     ```

This pattern keeps the code for all tools consistent and makes them easy to maintain and extend.

***

##  Step‑by‑Step: Adding a New Tool

Imagine you want to add a new tool called **“CSV to JSON”** under the **Dev Tools** category. The steps are:

1. **Create the route (App Router page):**  
   - File: `app/[locale]/tools/csv-to-json/page.tsx`  
   - Example:  
     ```tsx
     import CsvToJsonTool from "@/components/tools/dev/csv-to-json/CsvToJsonTool";

     export default function CsvToJsonPage() {
       return <CsvToJsonTool />;
     }
     ```

2. **Create the folder for the tool component:**  
   - Create: `src/components/tools/dev/csv-to-json/`  
   - Inside it, add `CsvToJsonTool.tsx` with `"use client"` at the top:  
     ```tsx
     "use client";

     import { useState } from "react";
     import { useThemeColors } from "@/hooks/useThemeColors";
     import { useLanguage } from "@/context/LanguageContext";
     import { useCsvToJsonContent, type CsvToJsonContent } from "./csv-to-json.content";

     export default function CsvToJsonTool() {
       const theme = useThemeColors();
       const content: CsvToJsonContent = useCsvToJsonContent();

       const [input, setInput] = useState("");
       const [output, setOutput] = useState<string | null>(null);
       const [error, setError] = useState<string | null>(null);

       const handleConvert = () => {
         try {
           setError(null);
           // your CSV parsing logic here
           const result = /* parse CSV → JSON string */;
           setOutput(result);
         } catch (e) {
           setError(content.ui.errors.parseFailed);
           setOutput(null);
         }
       };

       return (
         <div className={`rounded-2xl p-4 sm:p-6 ${theme.card} ${theme.border}`}>
           <h1 className={`text-lg font-semibold mb-2 ${theme.text}`}>
             {content.title}
           </h1>
           <p className={`text-sm mb-4 ${theme.textMuted}`}>
             {content.description}
           </p>

           {/* input textarea, button, output area using content.ui.* labels */}
         </div>
       );
     }
     ```

3. **Create the i18n JSON file:**  
   - File: `src/components/tools/dev/csv-to-json/csv-to-json.i18n.json`  
   - Example skeleton:  
     ```json
     {
       "fa": {
         "id": "csv-to-json",
         "category": "dev",
         "title": "تبدیل CSV به JSON",
         "description": "فایل یا متن CSV را به JSON ساخت‌یافته تبدیل کنید.",
         "features": [
           "چسباندن متن CSV در مرورگر",
           "پشتیبانی از جداکننده‌های مختلف",
           "عدم نیاز به آپلود روی سرور"
         ],
         "ui": {
           "header": {
             "title": "تبدیل CSV به JSON",
             "subtitle": "همه‌چیز روی مرورگر شما پردازش می‌شود."
           },
           "editor": {
             "inputLabel": "ورودی CSV",
             "outputLabel": "خروجی JSON",
             "placeholder": "CSV را اینجا پیست کنید...",
             "convertButton": "تبدیل",
             "clearButton": "پاک کردن"
           },
           "errors": {
             "parseFailed": "خطا در پردازش CSV. فرمت را بررسی کنید."
           }
         }
       },
       "en": {
         "id": "csv-to-json",
         "category": "dev",
         "title": "CSV to JSON",
         "description": "Convert CSV files or text into structured JSON.",
         "features": [
           "Paste CSV directly in the browser",
           "Supports different delimiters",
           "No server upload required"
         ],
         "ui": {
           "header": {
             "title": "CSV to JSON",
             "subtitle": "All processing happens locally in your browser."
           },
           "editor": {
             "inputLabel": "CSV input",
             "outputLabel": "JSON output",
             "placeholder": "Paste your CSV here...",
             "convertButton": "Convert",
             "clearButton": "Clear"
           },
           "errors": {
             "parseFailed": "Failed to parse CSV. Please check the format."
           }
         }
       }
     }
     ```

4. **Create the content hook for the tool:**  
   - File: `src/components/tools/dev/csv-to-json/csv-to-json.content.ts`  
   - Example:  
     ```ts
     "use client";

     import rawContent from "./csv-to-json.i18n.json";
     import { useLanguage } from "@/context/LanguageContext";

     export type CsvToJsonContent = (typeof rawContent)["fa"];

     const CONTENT_BY_LOCALE = rawContent as Record<"fa" | "en", CsvToJsonContent>;

     export function useCsvToJsonContent(): CsvToJsonContent {
       const { locale } = useLanguage();
       return CONTENT_BY_LOCALE[locale === "en" ? "en" : "fa"];
     }
     ```

5. **(Optional but recommended) Register the tool in your global data/metadata:**  
   - If you have a central tools/docs registry (for listing tools on `/tools`, `/docs`, or the homepage), add an entry for `csv-to-json` there:  
     - `id`, `slug`, `category`, `icon`, and a short `summary` in both languages.  
   - This keeps global navigation and documentation in sync with the actual tools.

6. **Run and test in dev & production:**  
   - `npm run dev` → test `/fa/tools/csv-to-json` and `/en/tools/csv-to-json`.  
   - `npm run build` → serve the exported `out/` over HTTP and verify locale routes and behavior; see [deployment instructions](docs/seo-and-accessibility.md).

***

##  i18n, Theming, and Client Components

- **i18n:** The `[locale]` segment in the App Router combined with `LanguageContext` ensures every tool reads the current locale and picks the right branch from its `*.i18n.json` file.[2]
- **Theming:** `useThemeColors()` returns Tailwind-compatible class names for background, text, border, primary/secondary, ensuring all tools look consistent in light and dark mode.  
- **Client components:** Any interactive tool (`useState`, file uploads, drag-and-drop, audio/video, etc.) must start with `"use client"` so React hooks and browser APIs are available while Next.js still statically prerenders the entry page.[5][4]

You can adapt the CSV example above to any new tool you add; just keep to this pattern (route → component → i18n JSON → content hook → optional registry entry) and the new tool will integrate cleanly with the rest of QodeForge.

[1](https://nextjs.org/docs/app)
[2](https://next-intl.dev/docs/routing/setup)
[3](https://nextjs.org/docs/app/getting-started/project-structure)
[4](https://www.wisp.blog/blog/should-i-avoid-using-hooks-in-nextjs)
[5](https://dev.to/abdullah-dev0/server-and-client-component-patterns-in-nextjs-201p)
[6](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)
[7](https://nextjs.org/docs/app/guides)
[8](https://github.com/pmndrs/zustand/discussions/2412)
[9](https://www.builder.io/blog/next-14-app-router)
[10](https://zenn.dev/shomtsm/articles/88742941e1dbe5)
[11](https://github.com/vercel/next.js/discussions/50146)
[12](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
[13](https://github.com/i18nexus/next-i18n-router)
[14](https://makerkit.dev/courses/nextjs-app-router/router)
[15](https://www.npmjs.com/package/next-i18n-router/v/4.1.0)
[16](https://stackoverflow.com/questions/79356417/how-to-organize-layouts-in-next-14-using-app-router-without-nesting)
[17](https://github.com/i18nexus/next-i18n-router/blob/main/README.md)
[18](https://stackoverflow.com/questions/76939269/does-next-js-always-require-use-client-to-be-able-to-use-a-hook)
[19](https://www.reddit.com/r/nextjs/comments/1brg5z7/world_class_next_14_app_router_open_source_full/)
[20](https://www.reddit.com/r/nextjs/comments/1ezamqy/using_react_hooks_with_nextjs_is_really_confusing/)
[21](https://dev.to/muhammad_usman_35b52e4f04/nextjs-14-app-router-building-modern-full-stack-applications-52ej)

##  Tool development conventions

When adding or updating a tool, use:

- A single route entry under `app/[locale]/tools`.
- A dedicated UI module in `src/components/tools`.
- Localized content stored outside the React component.
- No hardcoded UI strings inside tool logic.
- Consistent theming via `useThemeColors()`.
- Locale resolution exclusively through `LanguageContext`.

##  Future Expansion

The current architecture is designed to support:

- Tool versioning
- Tool marketplace
- Permission-based access
- Analytics per tool
- Auto-generated documentation
- Admin dashboard for managing tools & content

QodeForge is not just a collection of utilities — it is a scalable, modular platform for building and shipping browser-first tools with long-term maintainability in mind.

## Current development documentation — 27.0.0

Updated October 26, 2026. The active catalogue has 47 entries (45 internal tools and two external games); the IP lookup and system-info tools and the empty System category have been removed. The header is floating and translucent. Download filenames are chosen in the save dialog, and transfer/processing notices appear inline with the tool.

- [Current interface and export workflow](docs/current-interface-and-exports.md)
- [Shared controls and keyboard behavior](docs/panel-controls.md)
- [AI tools and processing](docs/ai-tools-and-processing.md)
- [SEO, locale routing and deployment checks](docs/seo-and-accessibility.md)
- [Persian technical report](CHANGELOG-27.0.0-TECHNICAL.fa.md)

The in-app documentation and both changelogs describe the same behavior. Version 27.0.0 remains in development; targeted local checks do not replace a successful production build or complete browser coverage.
