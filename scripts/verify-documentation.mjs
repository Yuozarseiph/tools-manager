import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const nodeRequire=createRequire(import.meta.url), cache=new Map();
function load(file){
 const resolved=path.resolve(file);
 if(cache.has(resolved))return cache.get(resolved).exports;
 if(resolved.endsWith('.json'))return JSON.parse(readFileSync(resolved,'utf8'));
 const record={exports:{}};cache.set(resolved,record);
 const require=name=>{
  if(!name.startsWith('@/')&&!name.startsWith('.'))return nodeRequire(name);
  const base=name.startsWith('@/')?path.resolve('src',name.slice(2)):path.resolve(path.dirname(resolved),name);
  const target=[base,base+'.ts',base+'.tsx',base+'.json'].find(p=>existsSync(p));
  assert(target,`Missing documentation dependency ${name}`);return load(target);
 };
 const compiled=ts.transpileModule(readFileSync(resolved,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 vm.runInNewContext(compiled,{module:record,exports:record.exports,require,Set,Map,URL},{filename:resolved});return record.exports;
}
const fa=JSON.parse(readFileSync('src/content/changelog/falog.json','utf8'));
const en=JSON.parse(readFileSync('src/content/changelog/enlog.json','utf8'));
const { version } = load('package.json');
const lock = load('package-lock.json');
assert.equal(lock.version, version);
assert.equal(lock.packages[''].version, version);
const { downloadContent } = load('src/content/pages/download.content.ts');
for (const [locale, log] of [['fa', fa], ['en', en]]) {
 assert.equal(log[0].version, version);
 assert.equal(log[0].status, undefined);
 assert.equal(log.filter(entry => entry.version === version).length, 1);
 assert.equal(downloadContent[locale].cards.pwa.version, version);
 assert(!log[0].changes.some(group => group.category === 'note'));
}
assert.deepEqual(fa[0].changes.map(g=>[g.category,g.items.length]),en[0].changes.map(g=>[g.category,g.items.length]));
const date=new Date(en[0].date+' 12:00:00 UTC');assert(Number.isFinite(date.getTime()));
assert.equal(new Intl.DateTimeFormat('fa-IR',{calendar:'persian',year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Tehran'}).format(date),fa[0].date);
const {TOOLS}=load('src/config/tools.ts'), {guideData}=load('src/lib/seo/tool-guide.ts');
const {toolMarkdown}=load('src/lib/seo/tool-markdown.ts'), {interfaceContent,hasNamedDownload}=load('src/content/docs/interface.content.ts');
const {getDocumentationEntries}=load('src/content/docs/entries.ts');
assert.equal(TOOLS.length,51);assert(!TOOLS.some(t=>['ip-checker','user-agent'].includes(t.id)||t.category==='system'));
for(const locale of ['fa','en']) {
 const docs=getDocumentationEntries(locale);
 assert.equal(docs.length,TOOLS.length);assert.equal(new Set(docs.map(doc=>doc.id)).size,TOOLS.length);
 for(const tool of TOOLS) {
  const doc=docs.find(doc=>doc.id===tool.id);
  assert(doc?.title&&doc.description);assert.equal(doc.href,tool.href);
  if(hasNamedDownload(tool.href.split('/').pop())) assert(doc.howItWorks.includes(interfaceContent[locale].saveStep));
 }
}
let guides=0, exports=0;
for(const locale of ['fa','en'])for(const tool of TOOLS.filter(t=>t.href.startsWith('/tools/'))){
 const slug=tool.href.split('/').pop(), guide=guideData(tool,locale), md=toolMarkdown(slug,locale), content=interfaceContent[locale];
 assert(md.startsWith('# '));assert(guide.name&&guide.description);
 if(hasNamedDownload(slug)){
  assert(guide.steps.includes(content.saveStep),`${locale}/${slug}: missing save step`);
  assert(guide.faq.some(([q,a])=>q===content.saveQuestion&&a===content.saveAnswer));
  assert(md.includes(content.saveStep)&&md.includes(content.saveAnswer)&&md.includes(content.activityAnswer),`${locale}/${slug}: stale Markdown guide`);exports++;
 }else assert(!guide.faq.some(([q])=>q===content.saveQuestion),`${locale}/${slug}: unrelated filename instructions`);
 guides++;
}
const raw=JSON.parse(readFileSync('src/content/docs/docs.content.json','utf8'));
for(const locale of ['fa','en'])assert(!raw[locale].some(d=>['ip-checker','user-agent'].includes(d.id)));
console.log(`Documentation passed: matched bilingual 27.1.0 dates/categories, ${guides} Markdown guides, ${exports} localized export workflows and a ${TOOLS.length}-entry catalogue without retired tools.`);
