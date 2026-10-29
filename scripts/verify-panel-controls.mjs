import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import ts from "typescript";

const require = createRequire(import.meta.url);
const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost", pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, Node: window.Node, getComputedStyle: window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true });
class ResizeObserver { observe() {} disconnect() {} }
window.HTMLElement.prototype.scrollIntoView = () => {};
const React = require("react"), { createRoot } = require("react-dom/client"), { act } = React, h = React.createElement;
const cache = new Map(); let testLocale = "en";
function load(file) {
 const absolute = path.resolve(file);
 if (cache.has(absolute)) return cache.get(absolute);
 const exports = {}; cache.set(absolute, exports);
 const compiled = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
 const localRequire = name => {
  if (name === "@/context/LanguageContext") return { useLanguage: () => ({ locale: testLocale }) };
  if (name.startsWith(".") || name.startsWith("@/")) {
   const base = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(path.dirname(absolute), name);
   const candidate = [base, `${base}.ts`, `${base}.tsx`].find(file => existsSync(file));
   if (candidate) return load(candidate);
  }
  return require(name);
 };
 vm.runInNewContext(compiled, { exports, require: localRequire, window, document: window.document, HTMLInputElement: window.HTMLInputElement, Node: window.Node, Event: window.Event, CustomEvent: window.CustomEvent, ResizeObserver, getComputedStyle: window.getComputedStyle, requestAnimationFrame: window.requestAnimationFrame.bind(window), setTimeout, clearTimeout, console }, { filename: absolute });
 return exports;
}
const PanelSelect = load("src/components/ui/PanelSelect.tsx").default;
const PanelSpecialInput = load("src/components/ui/PanelSpecialInput.tsx").default;
const helpers = load("src/lib/panel-controls.ts");
assert.equal(helpers.normaliseHex("#AbC"), "#aabbcc");
assert.equal(helpers.normaliseHex("not-a-color"), null);
assert.equal(helpers.rgbHex(helpers.rgbChannels("#16a34a")), "#16a34a");
assert.equal(helpers.parseDate("2024-02-29")?.getDate(), 29);
assert.equal(helpers.parseDate("2023-02-29"), null);
const days = helpers.calendarDays(new Date(2024, 1, 1), 6);
assert.equal(days.length, 42); assert.equal(days[0].getDay(), 6);
assert(days.some(date => helpers.dateValue(date) === "2024-02-29"));
assert.equal(JSON.stringify(helpers.calendarParts(new Date(2026, 9, 17, 12), "persian")), JSON.stringify({ year: 1405, month: 7, day: 25 }));
assert.equal(helpers.dateValue(helpers.calendarMonth(new Date(2025, 2, 20, 12), 1, "persian")), "2025-03-21");
assert(helpers.calendarDays(new Date(2025, 2, 1), 6, "persian").some(date => helpers.dateValue(date) === "2025-03-20" && helpers.calendarParts(date, "persian").day === 30));

const selectRef = React.createRef(); let changes = 0;
function Harness() {
 const [format, setFormat] = React.useState(""), [color, setColor] = React.useState("#2563eb"), [date, setDate] = React.useState("2024-02-29");
 return h("form", null,
  h(PanelSelect, { id: "format", "aria-label": "Format", name: "format", ref: selectRef, required: true, value: format, onChange: event => { changes++; setFormat(event.target.value); } }, h("option", { value: "" }, "Choose"), h("option", { value: "blocked", disabled: true }, "Disabled"), h("option", { value: "html" }, "HTML"), h("option", { value: "md" }, "Markdown")),
  h(PanelSpecialInput, { id: "color", "aria-label": "Color", type: "color", name: "color", value: color, onChange: event => setColor(event.target.value) }),
  h(PanelSpecialInput, { id: "date", "aria-label": "Date", type: "date", name: "date", value: date, min: "2024-02-01", max: "2024-03-31", onChange: event => setDate(event.target.value) }));
}
const root = createRoot(document.getElementById("root"));
await act(async () => root.render(h(Harness)));
const byId = id => document.getElementById(id);
assert.equal(selectRef.current.tagName, "SELECT");
await act(async () => { assert.equal(document.querySelector("form").checkValidity(), false); });
assert.equal(document.activeElement, byId("format"));
await act(async () => byId("format").click());
assert(document.querySelector('[role="listbox"]'));
await act(async () => document.querySelector('[role="option"][aria-disabled="true"]').click());
assert.equal(changes, 0); assert.equal(selectRef.current.value, "");
await act(async () => byId("format").dispatchEvent(new window.KeyboardEvent("keydown", { key: "End", bubbles: true })));
await act(async () => byId("format").dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
assert.equal(selectRef.current.value, "md"); assert.equal(changes, 1); assert(document.querySelector('[role="listbox"]').closest('[inert][aria-hidden="true"]'));
// Rapid reopening must cancel the old exit timer and preserve keyboard access.
await act(async () => byId("format").click());
await act(async () => { await new Promise(resolve => setTimeout(resolve, 160)); });
assert.equal(byId("format").getAttribute("aria-expanded"), "true");
assert(!document.querySelector('[role="listbox"]').closest('[inert]'));
await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
assert.equal(document.activeElement, byId("format"));
await act(async () => { await new Promise(resolve => setTimeout(resolve, 160)); });
assert(!document.querySelector('[role="listbox"]'));
assert.equal(new window.FormData(document.querySelector("form")).get("format"), "md");
await act(async () => byId("color").click());
await act(async () => document.querySelector('[aria-label="#16a34a"]').click());
assert.equal(document.querySelector('input[type="color"]').value, "#16a34a");
assert.equal(new window.FormData(document.querySelector("form")).get("color"), "#16a34a");
await act(async () => document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
await act(async () => { await new Promise(resolve => setTimeout(resolve, 160)); });
await act(async () => byId("date").click());
assert(document.querySelector('[role="dialog"]'));
await act(async () => document.querySelector('[data-date="2024-02-29"]').dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
assert.equal(document.activeElement.dataset.date, "2024-03-07");
await act(async () => document.activeElement.click());
assert.equal(new window.FormData(document.querySelector("form")).get("date"), "2024-03-07");
assert.equal(document.activeElement, byId("date"));
testLocale = "fa";
await act(async () => root.render(h(Harness)));
await act(async () => byId("date").click());
assert(document.querySelector('[role="dialog"]').textContent.includes("اسفند"));
assert.equal(document.querySelector('[data-date="2024-03-07"]').textContent, "۱۷");
await act(async () => document.querySelector('[data-date="2024-03-07"]').dispatchEvent(new window.KeyboardEvent("keydown", { key: "PageDown", bubbles: true })));
assert(document.querySelector('[role="dialog"]').textContent.includes("فروردین"));
await act(async () => document.querySelector('[data-date="2024-03-20"]').click());
assert.equal(new window.FormData(document.querySelector("form")).get("date"), "2024-03-20");
await act(async () => root.unmount());

function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.tsx$/.test(entry.name) ? [path.join(dir, entry.name)] : []); }
for (const file of walk("src")) if (!file.endsWith("PanelSelect.tsx")) assert(!/<select(?:\s|>)/.test(readFileSync(file, "utf8")), `Unstyled native select in ${file}`);
console.log("Panel controls passed: keyboard selection, disabled options, native React change events, refs, required validation, form values, color updates, leap-year calendar/keyboard and no visible native selects.");
