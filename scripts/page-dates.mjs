import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
const root = process.cwd();
const walk = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : [path.join(folder, entry.name)]);
const files = walk(path.join(root, "src"));
const registry = readFileSync("src/data/tools.ts", "utf8");
const tools = [...registry.matchAll(/href:\s*"(\/tools\/[^"\n]+)"/g)].map(match => match[1]);
const categories = [...new Set([...registry.matchAll(/category:\s*"([^"\n]+)"/g)].map(match => `/tools/${match[1]}`))];
const dates = {};
for (const route of ["", "/about", "/contact", "/docs", "/changelog", "/privacy", "/download", "/agents", ...tools, ...categories]) {
  const slug = route.split("/").pop();
  const client = files.find(file => file.replaceAll("\\", "/").includes(`/app/[locale]/tools/`) && file.replaceAll("\\", "/").includes(`/${slug}/`) && /\.tsx$/.test(file) && readFileSync(file, "utf8").includes('dynamic(() => import("@/components/tools/'));
  const component = client ? readFileSync(client, "utf8").match(/import\("@\/(components\/tools\/[^"\n]+)"/)?.[1] : undefined;
  const componentFolder = component ? `/${path.posix.dirname(component)}/` : "";
  const relevant = files.filter(file => {
    const normalized = file.replaceAll("\\", "/");
    if (categories.includes(route) && (/\/app\/\[locale\]\/tools\/\[category\]\//.test(normalized) || /\/data\/tools(?:\.content)?\.ts$/.test(normalized))) return true;
    if (route.startsWith("/tools/") && (/\/src\/(components\/seo\/|lib\/tool-guide\.ts|data\/tools\.content\.ts|data\/docs\/)/.test(normalized) || (componentFolder && normalized.includes(componentFolder)))) return true;
    return !slug ? /\/src\/(app\/\[locale\]\/(page|Home|layout)\.tsx|components\/home\/)/.test(normalized) : normalized.includes(`/${slug}/`) || normalized.includes(`/pages/${slug}.content.ts`);
  });
  const relative = relevant.map(file => path.relative(root, file).replaceAll("\\", "/"));
  const original = route.startsWith("/tools/") ? "src/app/tools" : `src/app/${slug || "page.tsx"}`;
  let commitDate = "";
  try { commitDate = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...relative, original], { encoding: "utf8" }).trim(); } catch { /* no history */ }
  const dirty = execFileSync("git", ["status", "--porcelain", "--", ...relative], { encoding: "utf8" }).trim();
  const lastEdit = relevant.length ? Math.max(...relevant.map(file => statSync(file).mtimeMs)) : 0;
  const timestamp = dirty || !commitDate ? Math.max(lastEdit, Date.parse(commitDate) || 0) : Date.parse(commitDate);
  if (timestamp) dates[route] = new Date(timestamp).toISOString();
}
writeFileSync("src/data/page-updated.json", JSON.stringify(dates, null, 2) + "\n");
console.log(`[page-dates] recorded source modification dates for ${Object.keys(dates).length} routes`);
