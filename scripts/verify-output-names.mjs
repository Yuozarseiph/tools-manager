import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const exports = {}, window = { location: { pathname: "/fa/tools/pdf-to-image" } };
vm.runInNewContext(ts.transpileModule(readFileSync("src/lib/output-name.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, window });
const { normaliseOutputName: name, outputFilename, configureOutputName, releaseOutputName } = exports;
assert.equal(name("", "original.pdf"), "original.pdf");
assert.equal(name("گزارش نهایی", "original.pdf"), "گزارش نهایی.pdf");
assert.equal(name("report.pdf", "original.pdf"), "report.pdf");
assert.equal(name("report.exe", "original.pdf"), "report.pdf");
assert.equal(name("report.PDF", "original.jpg"), "report.jpg");
assert.equal(name("release.v1", "original.docx"), "release.v1.docx");
assert.equal(name("NUL", "original.txt"), "_NUL.txt");
assert.equal(name("..", "original.pdf"), "output.pdf");
assert.equal(name("test", "old.png", "page-2"), "test-page-2.png");
assert(!/[<>:"/\\|?*\u0000-\u001f\u202a-\u202e]/.test(name("../unsafe\\name\u0000\u202e.exe", "old.pdf")));
assert.equal([...name("a".repeat(200), "old.txt")].length, 124);
const first = Symbol(), second = Symbol();
configureOutputName(window.location.pathname, "my-report", first);
assert.equal(outputFilename("old.pdf"), "my-report.pdf");
assert.equal(outputFilename("old.png", "page-3"), "my-report-page-3.png");
window.location.pathname += ".html";
assert.equal(outputFilename("old.pdf"), "my-report.pdf");
window.location.pathname = "/en/tools/qr-generator";
assert.equal(outputFilename("qr.png"), "qr.png");
configureOutputName(window.location.pathname, "new", second);
releaseOutputName(first);
assert.equal(outputFilename("qr.png"), "new.png");
releaseOutputName(second);
assert.equal(outputFilename("qr.png"), "qr.png");

function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.(?:tsx?|m?js|json|md|css|html|txt)$/.test(entry.name) ? [path.join(dir, entry.name)] : []); }
const sources = [...walk("src"), ...walk("scripts"), ...walk("docs"), "README.md"];
for (const file of sources) assert(!/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u20E3]/u.test(readFileSync(file, "utf8")), `Emoji literal in ${file}`);
let checked = 0;
for (const file of [...walk("src/components/tools"), "src/lib/transfer.ts"].filter(file => /\.tsx?$/.test(file))) {
 const source = readFileSync(file, "utf8"), ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
 function verify(node) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(node.left) && node.left.name.text === "download") {
   assert(/^(?:outputFilename|normaliseFileName)\(/.test(node.right.getText(ast)), `Unconfigured anchor export in ${file}`); checked++;
  }
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "download" && node.arguments[1]) {
   assert(node.arguments[1].getText(ast).startsWith("outputFilename("), `Unconfigured downloadjs export in ${file}`); checked++;
  }
  ts.forEachChild(node, verify);
 }
 verify(ast);
}
assert(readFileSync("src/components/tools/utility/qr-generator/QrGeneratorTool.tsx", "utf8").includes('anchor.download = outputFilename('));
assert(readFileSync("src/components/tools/excel-tools/excel-editor/ExcelEditorTool.tsx", "utf8").includes('void saveFile(new Blob([data]'));
assert(readFileSync("src/components/tools/pdf/text-to-pdf/TextToPdfTool.tsx", "utf8").includes('.getBlob((blob: Blob) => { void saveFile('));
assert(!readFileSync("src/components/seo/ToolGuide.tsx", "utf8").includes('OutputNameSettings'));
assert(readFileSync("src/components/SiteLayout.tsx", "utf8").includes('<ExportDialog />'));
for (const file of walk("src/components/tools").filter(file => /\.tsx?$/.test(file))) {
 const source = readFileSync(file, "utf8");
 assert(!/from\s+["']downloadjs["']/.test(source), `Export bypasses the save dialog: ${file}`);
 const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true), anchors = new Set();
 function find(node) {
  if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.name.text === "download") anchors.add(node.left.expression.getText(ast));
  ts.forEachChild(node, find);
 }
 function check(node) {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "click") assert(!anchors.has(node.expression.expression.getText(ast)), `Native download bypasses naming dialog: ${file}`);
  ts.forEachChild(node, check);
 }
 find(ast); check(ast);
}
console.log(`Output naming passed: ${checked} anchor/download paths, QR/XLSX/PDF integrations, Unicode/safe names, extensions, numbered batches and route isolation. No emoji literals in ${sources.length} owned source/document files.`);
