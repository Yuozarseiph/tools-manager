// Run against an Apache DocumentRoot pointing to out/, with AllowOverride All.
// Example: npm run verify-apache -- http://127.0.0.1:4186
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:4186");
const slugs = [...readFileSync("src/data/tools.ts", "utf8").matchAll(/href:\s*"\/tools\/([^"\n]+)"/g)].map(match => match[1]);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);
let requests = 0;
async function get(route, accept = "text/html") {
  requests++;
  return fetch(new URL(route, base), { headers: { Accept: accept }, redirect: "manual" });
}
async function checkFile(route, file, accept, type) {
  const response = await get(route, accept);
  assert.equal(response.status, 200, `${route} (${accept}): ${response.status}`);
  assert(response.headers.get("content-type")?.startsWith(type), `${route}: MIME type`);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(file), `${route}: wrong content`);
  return response;
}
for (const locale of ["fa", "en"]) {
  for (const file of [`out/${locale}.html`, ...walk(`out/${locale}`).filter(file => file.endsWith(".html"))]) {
    const route = file.slice(3, -5);
    // Repeat the clean URL to cover a fresh navigation followed by refresh.
    for (const suffix of ["", "", "/", ".html"]) {
      const response = await checkFile(route + suffix, file, "text/html", "text/html");
      if (slugs.some(slug => route === `/${locale}/tools/${slug}`)) {
        assert(response.headers.get("link")?.includes(`${route}.md`), `${route}: alternate Link`);
        assert(response.headers.get("vary")?.toLowerCase().includes("accept"), `${route}: Vary Accept`);
      }
    }
  }
  for (const slug of slugs) {
    const route = `/${locale}/tools/${slug}`;
    for (const suffix of ["", "/", ".html", ".md"]) {
      const response = await checkFile(route + suffix, `out${route}.md`, "text/markdown", "text/markdown");
      assert(response.headers.get("vary")?.toLowerCase().includes("accept"), `${route}: Markdown Vary`);
    }
    await checkFile(`${route}/opengraph-image.png`, `out${route}/opengraph-image.png`, "image/png", "image/png");
    await checkFile(`${route}/__next._full.txt`, `out${route}/__next._full.txt`, "*/*", "text/plain");
  }
  for (const route of ["about", "contact", "privacy", "download", "changelog", "docs", ...slugs.map(slug => `tools/${slug}`), ""]) {
    for (const suffix of ["", "/"]) {
      const from = `/${route}${route ? suffix : ""}${locale === "en" ? "?lang=en" : ""}`;
      const response = await get(from);
      assert.equal(response.status, 301, `${from}: legacy redirect`);
      const target = new URL(response.headers.get("location"), base);
      assert.equal(target.pathname, `/${locale}${route ? `/${route}` : ""}`, `${from}: redirect target`);
      await response.arrayBuffer();
    }
  }
  for (const accept of ["text/html", "text/markdown"]) {
    const missing = await get(`/${locale}/tools/does-not-exist`, accept);
    assert.equal(missing.status, 404, "Unknown route must remain a real 404");
    assert.deepEqual(Buffer.from(await missing.arrayBuffer()), readFileSync("out/404.html"));
  }
}
console.log(`Apache passed ${requests} HTTP checks: direct loads/refreshes, trailing slashes, HTML, Markdown, assets, navigation payloads, redirects and 404s.`);
