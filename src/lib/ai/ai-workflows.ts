import { cleanText, diffText, findSensitive, redact, splitText, type Match } from "./ai-text";

export const WORKFLOW_LIMIT = 200_000;
export const WORKFLOW_IDS = ["ai-input-preparer", "ai-response-review", "ai-output-extractor", "prompt-builder"] as const;
export type WorkflowId = typeof WORKFLOW_IDS[number];

export function prepareInput(text: string, clean: boolean) {
  const source = clean ? cleanText(text, { whitespace: true, persian: true }) : text;
  return { source, matches: findSensitive(source) };
}

export function finishInput(source: string, matches: Match[], budget?: number) {
  const text = redact(source, matches);
  return {
    text,
    estimatedTokens: estimateTokens(text),
    chunks: budget === undefined ? [] : splitText(text, { size: budget, overlap: 0, unit: "tokens" }),
  };
}

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 3);
}

export function compareResponses(before: string, after: string) {
  const lines = diffText(before, after, {});
  return {
    lines: lines.filter(line => line.type !== "equal"),
    added: lines.filter(line => line.type === "added").length,
    removed: lines.filter(line => line.type === "removed").length,
  };
}

export type PromptTemplate = { name: string; goal: string; input: string; format: string };
export const PROMPT_FIELDS = ["goal", "input", "format"] as const;
const variablePattern = new RegExp(String.raw`\{\{\s*([\p{L}_][\p{L}\p{N}_-]{0,47})\s*\}\}`, "gu");

export function promptVariables(template: PromptTemplate) {
  return [...new Set(PROMPT_FIELDS.flatMap(field =>
    [...template[field].matchAll(variablePattern)].map(match => match[1])
  ))];
}

export function fillPrompt(template: PromptTemplate, values: Record<string, string>, labels: readonly string[]) {
  let length = 0;
  let exceeded = false;
  const sections = PROMPT_FIELDS.flatMap((field, index) => {
    const value = template[field].replace(variablePattern, (placeholder, key: string) => {
      const replacement = Object.hasOwn(values, key) && values[key].trim() ? values[key] : placeholder;
      length += replacement.length;
      if (length <= WORKFLOW_LIMIT) return replacement;
      exceeded = true;
      return "";
    }).trim();
    return value ? [`## ${labels[index]}\n\n${value}`] : [];
  }).join("\n\n");
  return exceeded || sections.length > WORKFLOW_LIMIT ? null : sections;
}

export type ExtractedFile = { kind: "json" | "csv" | "code"; text: string; language?: string };
function validJson(text: string) {
  try { JSON.parse(text); return true; } catch { return false; }
}

function cells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/).map(cell => cell.replace(/\\\|/g, "|").trim());
}

function csvCell(cell: string) {
  // Spreadsheet programs can execute formula-like cells even when quoted.
  const numeric = /^[+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(cell);
  const safe = !numeric && /^[\s\uFEFF]*[=+\-@]/u.test(cell) ? "'" + cell : cell;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function extractFiles(source: string) {
  const input = source.trim();
  if (/^[\[{]/.test(input) && validJson(input)) {
    return { files: [{ kind: "json", text: input }] as ExtractedFile[], invalidJson: 0 };
  }
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const files: ExtractedFile[] = [];
  let invalidJson = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})\s*([^\s]*)/);
    if (opening) {
      const [, marker, language] = opening;
      const stop = new RegExp(`^ {0,3}${marker[0]}{${marker.length},}\\s*$`);
      const start = ++i;
      while (i < lines.length && !stop.test(lines[i])) i++;
      if (i === lines.length) break;
      const text = lines.slice(start, i).join("\n");
      if (language.toLowerCase() === "json") {
        if (validJson(text)) files.push({ kind: "json", text });
        else invalidJson++;
      } else if (!language && /^[\[{]/.test(text.trim()) && validJson(text)) {
        files.push({ kind: "json", text });
      } else if (text.trim()) {
        files.push({ kind: "code", language, text });
      }
    } else if (line.includes("|") && lines[i + 1]?.includes("|")) {
      const header = cells(line), delimiter = cells(lines[i + 1]);
      if (header.length < 2 || delimiter.length !== header.length || !delimiter.every(cell => /^:?-{3,}:?$/.test(cell))) continue;
      const rows = [header];
      i++;
      while (lines[i + 1]?.includes("|")) {
        const row = cells(lines[i + 1]);
        if (row.length !== header.length) break;
        rows.push(row);
        i++;
      }
      files.push({ kind: "csv", text: "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n") });
    }
    if (files.length > 100) throw new Error("BLOCK_LIMIT");
  }
  if (!files.length && !invalidJson && /^[\[{]/.test(input)) invalidJson = 1;
  return { files, invalidJson };
}
