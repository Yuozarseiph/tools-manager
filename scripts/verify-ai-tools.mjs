import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = readFileSync("src/lib/ai/ai-text.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {}; vm.runInNewContext(compiled, { exports });
const { cleanText, splitText, chatMarkdown, diffText, findSensitive, redact, fence, projectExclusion, isBinary } = exports;
assert.equal(cleanText("  كتاب  ي\r\n\r\n\r\n test  ", { whitespace: true, persian: true }), "کتاب ی\n\ntest");
assert.equal(cleanText("first\nline\n\nparagraph", { joinLines: true }), "first line\n\nparagraph");
const sample = "alpha\nbeta\n\n".repeat(200);
assert.equal(splitText(sample, { size: 100, overlap: 0 }).join(""), sample);
const overlapping = splitText("a".repeat(290), { size: 100, overlap: 20 });
assert.equal(overlapping.length, 4); assert.equal(overlapping[1].length, 100);
assert.throws(() => splitText("hello", { size: 10, overlap: 10 }));
assert.throws(() => splitText("a".repeat(10000), { size: 10, overlap: 0 }));
assert(splitText(String.fromCodePoint(0x1f600).repeat(50), { size: 11, overlap: 0 }).every(part => !/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(part)));
assert(chatMarkdown('[{"role":"user","content":"سلام"},{"role":"assistant","content":"درود"}]').includes("## assistant\n\nدرود"));
const chat = chatMarkdown('User: question\nAssistant: code\n```text\nUser: inside code\n```\nUser: next');
assert.equal((chat.match(/^## /gm) ?? []).length, 3); assert(chat.includes("User: inside code"));
assert.throws(() => chatMarkdown('{"other":[]}'));
assert.throws(() => chatMarkdown('[{"role":"user","content":42}]'));
assert(chatMarkdown('{"messages":[{"role":"user","content":[{"type":"text","text":"hello"}]}]}').includes("hello"));
for (const [a, b] of [["same\nold", "same\nnew"], ["a\nb\nc", "b\nc\nd"], ["", "new"], ["old", ""], ["same", "same"]]) {
  const result = diffText(a, b, {});
  assert.equal(result.filter(line => line.type !== "added").map(line => line.text).join("\n"), a);
  assert.equal(result.filter(line => line.type !== "removed").map(line => line.text).join("\n"), b);
}
assert.equal(diffText(" HELLO  WORLD ", "hello world", { ignoreSpace: true, ignoreCase: true })[0].type, "equal");
assert.throws(() => diffText("x\n".repeat(2001), "", {}));
const sensitive = "Email test@example.com Phone +98 912 123 4567 Key sk-abcdefghijklmnopqrstuv";
const matches = findSensitive(sensitive);
assert.equal(matches.length, 3);
const redacted = redact(sensitive, matches);
assert(redacted.includes("[EMAIL]")); assert(redacted.includes("[PHONE]")); assert(redacted.includes("[API_KEY]"));
assert.equal(redact(sensitive, []), sensitive);
assert.throws(() => redact("changed", matches));
assert.equal(findSensitive("-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----")[0].kind, "PRIVATE_KEY");
assert.equal(projectExclusion("app/.env.local"), "sensitive");
assert.equal(projectExclusion("keys/id_rsa"), "sensitive");
assert.equal(projectExclusion("node_modules/library/index.js"), "dependency");
assert.equal(projectExclusion("src/app.tsx"), null);
assert.equal(projectExclusion("public/image.png"), "unsupported");
assert(isBinary("abc\0def")); assert(!isBinary("فارسی\nEnglish"));
assert(fence("```js\ncode\n```", "md").startsWith("````md"));
console.log("AI tool checks passed: cleanup, chunk coverage/overlap/Unicode/limits, chat roles/JSON/code, diff reconstruction, redaction approval and project exclusions.");

const workflowExports = {};
const workflowSource = readFileSync("src/lib/ai/ai-workflows.ts", "utf8");
const workflowCompiled = ts.transpileModule(workflowSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInNewContext(workflowCompiled, {
  exports: workflowExports,
  require: name => {
    assert.equal(name, "./ai-text");
    return exports;
  },
});
const { compareResponses, extractFiles, fillPrompt, finishInput, prepareInput, promptVariables } = workflowExports;
const prepared = prepareInput("  كتاب  ي   user@example.com\n\n  " + "متن ".repeat(25), true);
assert(prepared.source.startsWith("کتاب ی user@example.com"));
assert.equal(prepared.matches.length, 1);
assert.equal(finishInput(prepared.source, []).text, prepared.source);
const finished = finishInput(prepared.source, prepared.matches, 10);
assert(!finished.text.includes("user@example.com"));
assert.equal(finished.chunks.join(""), finished.text);
assert(finished.chunks.every(chunk => chunk.length <= 30));
const boundary = "a".repeat(29) + "\n\ntext";
assert(finishInput(boundary, [], 10).chunks.every(chunk => chunk.length <= 30));
const review = compareResponses("same\nold", "same\nnew");
assert.equal(review.added, 1);
assert.equal(review.removed, 1);
assert.equal(review.lines.find(line => line.type === "added").text, "new");
assert.equal(review.lines.find(line => line.type === "removed").text, "old");
assert.throws(() => compareResponses("x\n".repeat(2000), "ok"), /DIFF_LIMIT/);
const rawJson = '{"precision":9007199254740993}';
assert.equal(extractFiles(rawJson).files[0].text, rawJson);
const extracted = extractFiles([
  "````javascript", "const note = '```';", "````",
  "| نام | مقدار |", "| --- | --- |", '| علی\\|رضا | -12 |', '| test | =1+2 |',
  "~~~json", "{broken}", "~~~", "```json", '{"ok":true}', "```",
].join("\n"));
assert.equal(extracted.invalidJson, 1);
assert.equal(extracted.files.map(file => file.kind).join(","), "code,csv,json");
assert.equal(extracted.files[1].text, "\uFEFF\"نام\",\"مقدار\"\r\n\"علی|رضا\",\"-12\"\r\n\"test\",\"'=1+2\"");
assert.equal(extractFiles("```js\n| ignore | this |\n| --- | --- |").files.length, 0);
assert.equal(extractFiles(("```txt\nx\n```\n").repeat(100)).files.length, 100);
assert.throws(() => extractFiles(("```txt\nx\n```\n").repeat(101)), /BLOCK_LIMIT/);
const template = { name: "Test", goal: "Review {{موضوع}}", input: "{{input}}", format: "{{موضوع}} in JSON" };
assert.equal(promptVariables(template).join(","), "موضوع,input");
const prompt = fillPrompt(template, { "موضوع": "{{input}}", input: "A" }, ["Goal", "Input", "Format"]);
assert.equal(prompt, "## Goal\n\nReview {{input}}\n\n## Input\n\nA\n\n## Format\n\n{{input}} in JSON");
assert.equal(fillPrompt({ ...template, goal: "{{input}}".repeat(40) }, {input: "x".repeat(8000)}, ["Goal","Input","Format"]), null);
console.log("AI workflow checks passed: approved redaction, chunk budgets, review diffs, safe CSV, exact JSON text, fenced blocks and bounded prompt templates.");
