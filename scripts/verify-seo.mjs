import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url); const { parse }=require("parse5");
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const attrs=node=>Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
const text=node=>node.value??(node.childNodes??[]).map(text).join("");
function nodes(document,tag) { const result=[]; const visit=n=>{if(n.tagName===tag)result.push(n);for(const c of n.childNodes??[])visit(c);};visit(document);return result; }
const slugs=[...fs.readFileSync("src/config/tools.ts","utf8").matchAll(/href:\s*"\/tools\/([^"\n]+)"/g)].map(m=>m[1]);
let pages=0;
const indexable = new Set();
const titles = new Set();
const descriptions = new Set();
const site = "https://qodeforge.ir";
function alternates(route) {
 const suffix = route.replace(/^\/(fa|en)(?=\/|$)/, "");
 return { "fa-IR": `${site}/fa${suffix}`, "en-US": `${site}/en${suffix}`, "x-default": `${site}/fa${suffix}` };
}
for(const locale of ["fa","en"]) {
 const files=[`out/${locale}.html`, ...walk(`out/${locale}`).filter(file=>file.endsWith(".html"))];
 for(const file of files) {
  const html=fs.readFileSync(file,"utf8"); const doc=parse(html); const relative=file.replaceAll("\\","/").replace(/^out\//,"").replace(/\.html$/,"");
  assert.equal(attrs(nodes(doc,"html")[0]).lang,locale,file);
  assert.equal(attrs(nodes(doc,"html")[0]).dir,locale==="fa"?"rtl":"ltr",file);
  const title=text(nodes(doc,"title")[0]);
  assert(title.trim() && !titles.has(title), `${file}: empty or duplicate title ${title}`);
  titles.add(title);
  assert.equal((title.match(/QodeForge/g)??[]).length,1,`${file}: repeated brand`);
  const meta=nodes(doc,"meta").map(attrs); const description=meta.find(m=>m.name==="description");
  assert(description?.content.trim() && !descriptions.has(description.content), `${file}: empty or duplicate description`);
  descriptions.add(description.content);
  const links=nodes(doc,"link").map(attrs);const canonical=links.find(link=>link.rel==="canonical");
  assert.equal(links.filter(link=>link.rel==="canonical").length, 1, file);
  assert.equal(canonical?.href,`${site}/${relative}`,`${file}: canonical`);
  const languageLinks = links.filter(link => link.rel === "alternate" && link.hreflang);
  assert.equal(languageLinks.length, 3, file);
  assert.deepEqual(Object.fromEntries(languageLinks.map(link => [link.hreflang, link.href])), alternates(`/${relative}`), file);
  if (!meta.some(tag => tag.name === "robots" && /\bnoindex\b/i.test(tag.content))) indexable.add(canonical.href);
  const og = Object.fromEntries(meta.filter(tag => tag.property?.startsWith("og:")).map(tag => [tag.property, tag.content]));
  assert.equal(og["og:url"], canonical.href, file);
  assert.equal(og["og:title"], title, file);
  assert.equal(og["og:description"], description.content, file);
  const ogImage = new URL(og["og:image"]);
  assert.equal(ogImage.origin, site, file);
  assert(fs.statSync(`out${ogImage.pathname}`).isFile(), file);
  assert.equal(nodes(doc,"main").length,1,`${file}: main landmarks`);
  assert.equal(attrs(nodes(doc,"main")[0]).id,"main-content",file);
  const viewport=meta.find(m=>m.name==="viewport")?.content??"";assert(!/maximum-scale=1|user-scalable=no/.test(viewport),file);
  const h1=nodes(doc,"h1");assert(h1.length>0,`${file}: no SSR heading`);
  if(locale==="en")assert(!/[\u0600-\u06ff]/.test(text(h1[0])),`${file}: English heading contains Persian`);
  for(const script of nodes(doc,"script").filter(s=>attrs(s).type==="application/ld+json"))JSON.parse(text(script));
  for(const link of nodes(doc,"a").map(attrs)) {
   if(!link.href?.startsWith("/")||link.href.startsWith("//")||link.href.includes("#"))continue;
   const clean=decodeURIComponent(link.href.split("?")[0]).replace(/\/$/,"");
   if(clean.startsWith("/_next"))continue;
   assert([`out${clean}`,`out${clean}.html`,`out${clean}/index.html`].some(p=>fs.existsSync(p)),`${file}: broken link ${link.href}`);
  }
  pages++;
 }
 const home=parse(fs.readFileSync(`out/${locale}.html`,"utf8"));
 const hrefs=nodes(home,"a").map(node=>attrs(node).href);
 for(const slug of slugs)assert(hrefs.includes(`/${locale}/tools/${slug}`),`${locale}: missing home tool ${slug}`);
 for(const slug of slugs) {
  const prefix=`out/${locale}/tools/${slug}`;
  assert(fs.existsSync(`${prefix}.md`),`${prefix}: missing markdown`);
  const md=fs.readFileSync(`${prefix}.md`,"utf8");assert(md.startsWith("# ")&&md.includes(locale==="fa"?"پرسش‌های متداول":"FAQ"),prefix);
  const png=fs.readFileSync(`${prefix}/opengraph-image.png`);assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
  const doc=parse(fs.readFileSync(`${prefix}.html`,"utf8"));const schemas=nodes(doc,"script").filter(n=>attrs(n).type==="application/ld+json").flatMap(n=>{const s=JSON.parse(text(n));return s["@graph"]??[s];});
  for(const type of ["WebApplication","BreadcrumbList","FAQPage","HowTo"])assert(schemas.some(s=>s["@type"]===type),`${prefix}: missing ${type}`);
  assert(schemas.find(s=>s["@type"]==="WebApplication")?.offers?.price==="0",prefix);
 }
}
const sitemap = fs.readFileSync("out/sitemap.xml", "utf8");
const urls = new Set();
for (const [, entry] of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
 const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
 assert(indexable.has(loc) && !urls.has(loc), `Unexpected or duplicate sitemap URL: ${loc}`);
 urls.add(loc);
 const languages = [...entry.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/>/g)];
 assert.equal(languages.length, 3, loc);
 assert.deepEqual(Object.fromEntries(languages.map(([, lang, href]) => [lang, href])), alternates(new URL(loc).pathname), loc);
}
assert.deepEqual(urls, indexable, "The sitemap must cover every indexable canonical URL");
const llms=fs.readFileSync("out/llms.txt","utf8");for(const slug of slugs)assert(llms.includes(`/en/tools/${slug}`)&&llms.includes(`/fa/tools/${slug}`),slug);
assert(fs.readFileSync("out/404.html","utf8").includes('content="noindex'));
const robots = fs.readFileSync("out/robots.txt", "utf8");
assert(robots.includes("OAI-SearchBot"));
assert(robots.split(/\r?\n/).includes(`Sitemap: ${site}/sitemap.xml`));
console.log(`Verified ${pages} localized HTML pages, ${slugs.length*2} Markdown guides and OG images, full home links, metadata, JSON-LD, sitemap, robots and 404 noindex.`);
