import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const source = readFileSync("src/data/tools.ts", "utf8");
const slugs = [...source.matchAll(/href:\s*"\/tools\/([^"\n]+)"/g)].map(match => match[1]);
const legacy = ["about", "contact", "privacy", "download", "changelog", "docs", ...slugs.map(slug => `tools/${slug}`)];
const pattern = legacy.join("|");
const redirect = `\n# Preserve indexed legacy URLs with permanent redirects. No location detection.\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteCond %{QUERY_STRING} (^|&)lang=en(&|$) [NC]\nRewriteRule ^(${pattern})/?$ /en/$1 [R=301,L]\nRewriteCond %{QUERY_STRING} (^|&)lang=en(&|$) [NC]\nRewriteRule ^$ /en [R=301,L]\nRewriteRule ^(${pattern})/?$ /fa/$1 [R=301,L]\nRewriteRule ^$ /fa [R=301,L]\n</IfModule>\n`;
const base = readFileSync(existsSync(".htaccess") ? ".htaccess" : "scripts/static-host.htaccess", "utf8");
writeFileSync("out/.htaccess", redirect + base + '\nAddType text/markdown .md\n');
for (const locale of ["fa", "en"]) {
  const folder = `out/${locale}/tools`;
  mkdirSync(folder, { recursive: true });
  const headers = slugs.map(slug => `<Files "${slug}.html">\nHeader set Link "<https://qodeforge.ir/${locale}/tools/${slug}.md>; rel=alternate; type=text/markdown"\n</Files>`).join("\n");
  writeFileSync(`${folder}/.htaccess`, `<IfModule mod_headers.c>\n${headers}\n</IfModule>\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteCond %{HTTP_ACCEPT} text/markdown [NC]\nRewriteRule ^(${slugs.join("|")})(?:\\.html)?/?$ /${locale}/tools/$1.md [L]\n</IfModule>\n`);
}
console.log("[export-seo] wrote legacy 301s, Markdown content negotiation and alternate Link headers");
