# SEO, accessibility and agent integration

The site continues to use Next.js static export. Persian and English pages are generated under `/fa` and `/en`. Locale is established before rendering the document and the client providers, so exported HTML already has the matching content, `lang` and `dir`.

Active legacy URLs have static fallback pages with links to both languages. The exported Apache configuration provides HTTP 301 redirects, preserves explicit `?lang=en` selection and uses a real 404 error document. An explicit saved language choice redirects opposite-language routes to their counterpart; visitors without a saved choice can use either localized URL. The former language-suggestion prompt has been removed. Switching language navigates to the equivalent locale path and preserves other query parameters and fragments.

Each tool has independent metadata, an OG image, breadcrumbs, documentation, limitations, FAQs, related links, and WebApplication/FAQPage/HowTo/BreadcrumbList structured data. FAQ and HowTo markup describe the actual visible guide; their presence does not guarantee a search rich result. Tools marked `coming-soon` are excluded from the sitemap and receive `noindex` metadata. External mini-game URLs stay external.

`sitemap.xml`, `llms.txt`, and `llms-full.txt` derive their tool lists from `src/data/tools.ts`. Source/Git dates are collected by `scripts/page-dates.mjs`; build time is not substituted for a page's last modification. Input formats and file-selection limits are collected from the tool code by `scripts/tool-constraints.mjs`. The home page renders all tool links, and the documentation and changelog preserve their full text in the initial HTML.

Each tool has a static Markdown counterpart at `/{locale}/tools/{slug}.md`. The export includes Apache `Link: rel=alternate` headers and content negotiation for `Accept: text/markdown`. On other static hosts, use the explicit Markdown URLs and configure equivalent redirects, MIME types and 404 behavior; Apache headers are not applied by Next.js itself.

## Apache deployment and refreshes

Upload the contents of `out/`, including its three hidden configuration files:

- `out/.htaccess` goes at the website document root.
- `out/fa/tools/.htaccess` goes in `/fa/tools/`.
- `out/en/tools/.htaccess` goes in `/en/tools/`.

The versioned source is `scripts/static-host.htaccess`; `scripts/export-seo.mjs` inserts legacy redirects and regenerates all three files after each build. Root `.htaccess`, `fa.htaccess` and `en.htaccess` are also refreshed as local copies. The latter two must be renamed `.htaccess` when placed in their respective `tools/` folders. Do not add separate rewrite rules or `RewriteOptions Inherit` to the locale files: all routing and Markdown negotiation live in the root, and child files only set response headers.

Next.js exports both `tool-name.html` and a `tool-name/` directory containing OG images and navigation payloads. Root routing must check for the HTML file even if the request also matches a directory. `DirectorySlash Off` avoids directory redirects; both clean and trailing-slash page URLs resolve internally to the existing HTML. Existing assets pass through, missing pages remain 404, and `Vary: Accept` separates negotiated Markdown from HTML in caches. Keep `Options -Indexes` enabled.

After deploying, test a direct load and refresh, not only client-side navigation. For automated HTTP checks, point Apache 2.4 at `out/` with `AllowOverride All` and run `npm run verify-apache -- http://127.0.0.1:4186`. This checks all exported localized pages, repeated requests, trailing slashes, explicit HTML, both Markdown variants, alternate headers, assets, Next.js payloads, legacy redirects and unknown routes.

The privacy page documents exceptions to local processing: user-requested URL imports, model/engine downloads, EmailJS contact submissions and code-editor persistence. The IP lookup and system-info tools are no longer active. Browser memory release is controlled by the browser; immediate deletion is not promised.

Forms keep their original handlers and UI while receiving associated labels and stable file-upload/download test identifiers. Calculation inputs normalize Persian and Arabic digits. Upload zones expose keyboard button semantics. Dialog focus is trapped and restored, nested dialogs close independently, results use live regions, zoom remains enabled, and animation respects reduced-motion preferences. The default light muted text was adjusted after an automated contrast check found a header failure. Tool UI bundles load independently and tool links disable automatic prefetching.

Agent definitions are available at `/agent-tools.json` and documented at `/{locale}/agents`. `window.QodeForgeTools.execute(name, input)` supports word counts, UTF-8 Base64, SHA hashes and unit conversion. These functions only process supplied arguments; they neither read user files nor upload or persist data. Compatible browsers register the same functions with `document.modelContext.registerTool`, with feature detection and an AbortSignal for cleanup. [WebMCP API reference](https://developer.chrome.com/docs/ai/webmcp/imperative-api).

## Validation

Run `npm run build`, `npm run verify-seo` and `npx tsc --noEmit`. The SEO check validates every exported locale page, tool links, language, titles, descriptions, canonical/hreflang, main landmarks, JSON-LD, Markdown guides, OG dimensions, sitemap inclusion, robots and 404 `noindex`.

Earlier browser validation covered 40 internal tool routes and representative real operations: Unicode Base64, percentage calculation using Persian digits, PNG upload with Enter and resize/download (verified 100 × 100 output), local agent functions, home search/pinning, modal focus/Escape and mobile horizontal overflow. Automated axe checks for WCAG 2 A/AA and 2.1 AA passed the initial desktop views of all 40 tools in both light and dark themes (80 checks), plus the English light home, Persian dark home, Base64 and image resizer after upload. No JavaScript page errors were recorded in the functional run. These checks do not certify every interaction in every tool or measure production Core Web Vitals. Off-site listings and search engine indexing require publication and external services. This is an earlier validation record; it is not a fresh certification of the current 47-entry catalogue. Current targeted checks are recorded in [Current interface and file exports](current-interface-and-exports.md).
