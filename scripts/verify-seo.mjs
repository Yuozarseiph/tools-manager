import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url); const { parse }=require("parse5");
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const attrs=node=>Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
const text=node=>node.value??(node.childNodes??[]).map(text).join("");
function nodes(document,tag) { const result=[]; const visit=n=>{if(n.tagName===tag)result.push(n);for(const c of n.childNodes??[])visit(c);};visit(document);return result; }
const slugs=[...fs.readFileSync("src/data/tools.ts","utf8").matchAll(/href:\s*"\/tools\/([^"\n]+)"/g)].map(m=>m[1]);
let pages=0;
for(const locale of ["fa","en"]) {
 const files=[`out/${locale}.html`, ...walk(`out/${locale}`).filter(file=>file.endsWith(".html"))];
 for(const file of files) {
  const html=fs.readFileSync(file,"utf8"); const doc=parse(html); const relative=file.replaceAll("\\","/").replace(/^out\//,"").replace(/\.html$/,"");
  assert.equal(attrs(nodes(doc,"html")[0]).lang,locale,file);
  assert.equal(attrs(nodes(doc,"html")[0]).dir,locale==="fa"?"rtl":"ltr",file);
  const title=text(nodes(doc,"title")[0]);assert(title.length<=60,`${file}: title length ${title.length}`);
  assert.equal((title.match(/QodeForge/g)??[]).length,1,`${file}: repeated brand`);
  const meta=nodes(doc,"meta").map(attrs); const description=meta.find(m=>m.name==="description");
  assert(description?.content.length>0&&description.content.length<=160,`${file}: description`);
  const links=nodes(doc,"link").map(attrs);const canonical=links.find(link=>link.rel==="canonical");
  assert.equal(canonical?.href,`https://qodeforge.ir/${relative}`,`${file}: canonical`);
  assert(links.some(link=>link.hreflang==="en-US"&&!link.href.includes("?lang=")),file);
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
const sitemap=fs.readFileSync("out/sitemap.xml","utf8");assert(!sitemap.includes("?lang="));assert(!sitemap.includes("/fahttps"));
for(const slug of slugs)for(const locale of ["fa","en"])assert(sitemap.includes(`https://qodeforge.ir/${locale}/tools/${slug}</loc>`),slug);
const llms=fs.readFileSync("out/llms.txt","utf8");for(const slug of slugs)assert(llms.includes(`/en/tools/${slug}`)&&llms.includes(`/fa/tools/${slug}`),slug);
assert(fs.readFileSync("out/404.html","utf8").includes('content="noindex'));
assert(fs.readFileSync("out/robots.txt","utf8").includes("OAI-SearchBot"));
console.log(`Verified ${pages} localized HTML pages, ${slugs.length*2} Markdown guides and OG images, full home links, metadata, JSON-LD, sitemap, robots and 404 noindex.`);
