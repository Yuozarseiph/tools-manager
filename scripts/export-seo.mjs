import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const source = readFileSync("src/data/tools.ts", "utf8");
const slugs = [...source.matchAll(/href:\s*"\/tools\/([^"\n]+)"/g)].map(match => match[1]);
const legacy = ["about", "contact", "privacy", "download", "changelog", "docs", ...slugs.map(slug => `tools/${slug}`)];
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = legacy.map(escapeRegex).join("|");
const redirect = `# Preserve legacy URLs and explicit English selection.
  RewriteCond %{QUERY_STRING} (^|&)lang=en(&|$) [NC]
  RewriteRule ^(${pattern})/?$ /en/$1 [R=301,L]
  RewriteCond %{QUERY_STRING} (^|&)lang=en(&|$) [NC]
  RewriteRule ^$ /en [R=301,L]
  RewriteRule ^(${pattern})/?$ /fa/$1 [R=301,L]
  RewriteRule ^$ /fa [R=301,L]`;

// Always use the versioned template, not an ignored, possibly stale root file.
const template = readFileSync("scripts/static-host.htaccess", "utf8");
const root = template.replace("# QODEFORGE_LEGACY_REDIRECTS", () => redirect);
mkdirSync("out", { recursive: true });
writeFileSync("out/.htaccess", root);
writeFileSync(".htaccess", root);

for (const locale of ["fa", "en"]) {
  const folder = `out/${locale}/tools`;
  mkdirSync(folder, { recursive: true });
  const headers = slugs.map(slug => `<Files "${slug}.html">\n  Header set Link "<https://qodeforge.ir/${locale}/tools/${slug}.md>; rel=alternate; type=text/markdown"\n</Files>`).join("\n");
  // Do not enable mod_rewrite here: a child ruleset overrides root routing.
  const child = `# QodeForge /${locale}/tools/.htaccess\n# Routing and Markdown negotiation are handled by the root .htaccess.\n<IfModule mod_headers.c>\n<FilesMatch "\\.(html|md)$">\n  Header merge Vary Accept\n</FilesMatch>\n${headers}\n</IfModule>\n`;
  writeFileSync(`${folder}/.htaccess`, child);
  writeFileSync(`${locale}.htaccess`, child);
}
console.log("[export-seo] generated root routing and header-only fa/en tool configurations");
