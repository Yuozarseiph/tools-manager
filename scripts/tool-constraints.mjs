import fs from "node:fs";
import path from "node:path";
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const constraints={};
for(const file of walk("src/app/[locale]/tools").filter(file=>file.endsWith(".tsx"))) {
  const source=fs.readFileSync(file,"utf8");
  const component=source.match(/const \w+ = dynamic\(\(\) => import\("@\/([^"\n]+)"/);
  if(!component)continue;
  const target=`src/${component[1]}.tsx`;
  if(!fs.existsSync(target))continue;
  const text=fs.readFileSync(target,"utf8");const formats=[];
  for(const accept of text.matchAll(/accept="([^"]+)"|accept:\s*(\{[^}]+\})/gs)) {
    if(accept[1])formats.push(...accept[1].split(",").map(value=>value.trim()));
    else formats.push(...[...accept[2].matchAll(/"([^"\n]+)"/g)].map(match=>match[1]));
  }
  const maxFiles=text.match(/maxFiles:\s*(\d+)/);
  constraints[path.basename(path.dirname(file))]={acceptedFormats:[...new Set(formats)],...(maxFiles?{maxFiles:Number(maxFiles[1])}:{})};
}
fs.writeFileSync("src/data/tool-constraints.json",JSON.stringify(constraints,null,2)+"\n");
console.log(`[tool-constraints] recorded supported inputs for ${Object.keys(constraints).length} tools`);
