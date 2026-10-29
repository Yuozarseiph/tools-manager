import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const storage = new Map();
const window = { localStorage: { getItem: key => storage.get(key) ?? null }, location: { search: "" } };
function load(file, require = () => { throw new Error("Unexpected dependency"); }) {
 const exports = {};
 vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, { exports, require, window, navigator: { language: "en-US", languages: ["en-US"] }, URL, URLSearchParams }); return exports;
}
const detection = load("src/lib/locale-detection.ts"), paths = load("src/lib/localized-path.ts");
const navigation = load("src/lib/locale-preference.ts", name => { assert.equal(name, "./localized-path"); return paths; });
assert.equal(detection.getSavedLocale(), null);
storage.set("qodeforge_locale", "fa"); window.location.search = "?lang=en";
assert.equal(detection.detectInitialLocale(), "fa");
storage.set("qodeforge_locale", "invalid"); storage.set("tm_locale", "en");
assert.equal(detection.getSavedLocale(), "en");
assert.equal(navigation.preferredLocaleTarget("https://qodeforge.ir/en/tools/bank?tab=expenses&lang=en#results", "fa"), "https://qodeforge.ir/fa/tools/bank?tab=expenses#results");
assert.equal(navigation.preferredLocaleTarget("https://qodeforge.ir/fa/tools/bank", "en"), "https://qodeforge.ir/en/tools/bank");
assert.equal(navigation.preferredLocaleTarget("https://qodeforge.ir/fa/tools/bank", "fa"), null);
const fa = JSON.parse(readFileSync("src/data/changelog/falog.json", "utf8")), en = JSON.parse(readFileSync("src/data/changelog/enlog.json", "utf8"));
assert.equal(fa[0].version, "27.0.0"); assert.equal(en[0].version, "27.0.0");
assert.equal(fa[0].status, "development"); assert.equal(en[0].status, "development");
assert.equal(fa[0].changes.reduce((total, group) => total + group.items.length, 0), en[0].changes.reduce((total, group) => total + group.items.length, 0));
const css = readFileSync("src/app/globals.css", "utf8");
for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
 const maximum = rule[1].includes(".site-header") ? 20 : 8;
 for (const radius of rule[2].matchAll(/border-radius:\s*([\d.]+)(px|rem|%)\s*;/g)) assert(radius[2] !== "%" && Number(radius[1]) * (radius[2] === "rem" ? 16 : 1) <= maximum, `Oversized corner in ${rule[1].trim()}: ${radius[0]}`);
}
function tokens(dark) {
 const result = {};
 for (const match of css.matchAll(dark ? /:root\.dark\s*\{([^}]+)\}/g : /:root\s*\{([^}]+)\}/g)) for (const token of match[1].matchAll(/(--[\w-]+):\s*(#[a-f\d]{6})\s*;/gi)) result[token[1]] = token[2];
 return result;
}
function luminance(hex) { const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722; }
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
for (const dark of [false, true]) {
 const colors = tokens(dark);
 for (const foreground of ["--app-text", "--app-text-muted", "--app-accent"]) for (const background of ["--app-bg", "--app-card", "--app-input-bg"]) assert(contrast(colors[foreground], colors[background]) >= 4.5, `${foreground}/${background} contrast in ${dark ? "dark" : "light"}`);
 for (const button of ["--app-primary-bg", "--app-primary-hover"]) assert(contrast("#ffffff", colors[button]) >= 4.5, `${button} text contrast`);
}
assert(!readFileSync("src/components/SiteLayout.tsx", "utf8").includes("LanguageSuggestion"));
console.log("Interface passed: saved language preference, redirects/query/hash/no loop, bilingual 27.0.0 development log, compact panels/floating header and readable light/dark text/button contrast.");
