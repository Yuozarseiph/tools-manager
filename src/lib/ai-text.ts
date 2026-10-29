export type TextOptions = { whitespace?: boolean; persian?: boolean; joinLines?: boolean; size?: number; overlap?: number; unit?: "characters" | "tokens"; ignoreSpace?: boolean; ignoreCase?: boolean };
export type Match = { start: number; end: number; value: string; kind: "EMAIL" | "PHONE" | "API_KEY" | "PRIVATE_KEY" };
export type DiffLine = { type: "equal" | "added" | "removed"; text: string };
export function fence(text: string, language = "") {
  const longest = Array.from(text.matchAll(/`+/g)).reduce((max, match) => Math.max(max, match[0].length), 2);
  const delimiter = "`".repeat(longest + 1);
  return `${delimiter}${language.replace(/[^\w+-]/g, "")}\n${text}\n${delimiter}`;
}
export function cleanText(input: string, options: TextOptions) {
  let text = input.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  if (options.persian) text = text.replace(/ي/g, "ی").replace(/ك/g, "ک");
  if (options.whitespace) text = text.split("\n").map(line => line.replace(/[\t \u00a0]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (options.joinLines) text = text.replace(/([^\n])\n(?=[^\n])/g, "$1 ");
  return text;
}
export function splitText(input: string, options: TextOptions) {
  const multiplier = options.unit === "tokens" ? 3 : 1;
  const size = Math.floor(Number(options.size) * multiplier);
  const overlap = Math.floor(Number(options.overlap) * multiplier);
  if (!Number.isFinite(size) || size < 10 || size > 200000 || !Number.isFinite(overlap) || overlap < 0 || overlap >= size) throw new Error("INVALID_CHUNK_SIZE");
  const chunks: string[] = [];
  let start = 0;
  while (start < input.length) {
    if (chunks.length >= 500) throw new Error("TOO_MANY_CHUNKS");
    let end = Math.min(start + size, input.length);
    if (end < input.length) {
      const boundary = input.lastIndexOf("\n\n", end);
      if (boundary > start + size * .65) end = boundary + 2;
      if (/[\uDC00-\uDFFF]/.test(input[end])) end--;
    }
    chunks.push(input.slice(start, end));
    if (end >= input.length) break;
    let next = Math.max(start + 1, end - overlap);
    if (/[\uDC00-\uDFFF]/.test(input[next])) next--;
    start = Math.max(start + 1, next);
  }
  return chunks;
}
export function chatMarkdown(input: string) {
  let messages: { role: string; content: string }[] = [];
  if (/^[\[{]/.test(input.trim())) {
    let parsed;
    try { parsed = JSON.parse(input); } catch { throw new Error("INVALID_CHAT"); }
    const entries = Array.isArray(parsed) ? parsed : parsed.messages;
    if (!Array.isArray(entries)) throw new Error("INVALID_CHAT");
    messages = entries.map(message => {
      if (!message || typeof message.role !== "string") throw new Error("INVALID_CHAT");
      const content = typeof message.content === "string" ? message.content : Array.isArray(message.content) ? message.content.filter((part: { type?: string }) => part?.type === "text").map((part: { text?: string }) => part.text ?? "").join("\n") : null;
      if (content === null) throw new Error("INVALID_CHAT");
      return { role: message.role.replace(/[\r\n#]/g, ""), content };
    });
  } else {
    let current = { role: "Conversation", content: "" }; let inFence = false; let marker = "";
    for (const line of input.replace(/\r\n?/g, "\n").split("\n")) {
      const code = line.match(/^\s*(`{3,}|~{3,})/);
      if (code && (!inFence || code[1][0] === marker[0] && code[1].length >= marker.length)) { inFence = !inFence; marker = code[1]; }
      const role = !inFence && line.match(/^\s*(user|assistant|system|human|کاربر|دستیار|سیستم)\s*[:：]\s*(.*)$/i);
      if (role) {
        if (current.content.trim()) messages.push(current);
        current = { role: role[1], content: role[2] };
      } else current.content += `${current.content ? "\n" : ""}${line}`;
    }
    if (current.content.trim()) messages.push(current);
  }
  if (!messages.length) throw new Error("INVALID_CHAT");
  return messages.map(message => `## ${message.role}\n\n${message.content.trim()}`).join("\n\n---\n\n");
}
export function diffText(before: string, after: string, options: TextOptions): DiffLine[] {
  const a = before.replace(/\r\n?/g, "\n").split("\n"), b = after.replace(/\r\n?/g, "\n").split("\n");
  if (a.length > 2000 || b.length > 2000) throw new Error("DIFF_LIMIT");
  const normalize = (line: string) => { let value = options.ignoreSpace ? line.trim().replace(/\s+/g, " ") : line; if (options.ignoreCase) value = value.toLowerCase(); return value; };
  const aa = a.map(normalize), bb = b.map(normalize), width = b.length + 1;
  const dp = new Uint16Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i * width + j] = aa[i] === bb[j] ? 1 + dp[(i + 1) * width + j + 1] : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
  const result: DiffLine[] = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && aa[i] === bb[j]) { result.push({ type: "equal", text: b[j++] }); i++; }
    else if (j < b.length && (i >= a.length || dp[i * width + j + 1] > dp[(i + 1) * width + j])) result.push({ type: "added", text: b[j++] });
    else result.push({ type: "removed", text: a[i++] });
  }
  return result;
}
export function findSensitive(input: string): Match[] {
  const rules: [Match["kind"], RegExp][] = [
    ["PRIVATE_KEY", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ["EMAIL", /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+/gi],
    ["API_KEY", /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{30,})\b/g],
    ["PHONE", /(?<![\w۰-۹٠-٩])\+?[0-9۰-۹٠-٩][0-9۰-۹٠-٩ ()-]{7,22}[0-9۰-۹٠-٩](?![\w۰-۹٠-٩])/g],
  ];
  const matches: Match[] = [];
  for (const [kind, pattern] of rules) for (const match of input.matchAll(pattern)) {
    if (kind === "PHONE") { const digits = match[0].replace(/[^0-9۰-۹٠-٩]/g, ""); if (digits.length < 10 || digits.length > 15) continue; }
    matches.push({ start: match.index!, end: match.index! + match[0].length, value: match[0], kind });
    if (matches.length > 10000) throw new Error("TOO_MANY_MATCHES");
  }
  const chosen: Match[] = [];
  for (const match of matches.sort((a, b) => a.start - b.start || b.end - a.end)) if (!chosen.length || chosen.at(-1)!.end <= match.start) chosen.push(match);
  return chosen;
}
export function redact(input: string, matches: Match[]) {
  let result = input;
  for (const match of [...matches].sort((a, b) => b.start - a.start)) {
    if (input.slice(match.start, match.end) !== match.value) throw new Error("STALE_MATCHES");
    result = result.slice(0, match.start) + `[${match.kind}]` + result.slice(match.end);
  }
  return result;
}
const textExtensions = /\.(?:txt|md|mdx|js|jsx|ts|tsx|mjs|cjs|json|html?|css|scss|sass|less|py|rb|rs|go|java|c|h|cpp|hpp|cs|php|sql|ya?ml|toml|xml|sh|ps1|bat|vue|svelte|swift|kt|dart|ini|conf|csv|tsv|r)$/i;
export function projectExclusion(path: string): "sensitive" | "dependency" | "unsupported" | null {
  const segments = path.replace(/\\/g, "/").split("/");
  if (segments.some(part => /^(?:\.env(?:\..*)?|id_(?:rsa|ed25519|ecdsa)|credentials(?:\..*)?|secrets?(?:\..*)?)$/i.test(part)) || /\.(?:pem|key|p12|pfx|keystore)$/i.test(path)) return "sensitive";
  if (segments.some(part => /^(?:node_modules|\.git|\.next|dist|build|coverage|vendor|venv|\.venv|__pycache__)$/i.test(part)) || /(?:package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i.test(path)) return "dependency";
  return textExtensions.test(path) || /(?:^|\/)(?:Dockerfile|Makefile|LICENSE|\.gitignore)$/i.test(path) ? null : "unsupported";
}
export function isBinary(text: string) { return text.includes("\0") || (text.match(/[\u0001-\u0008\u000E-\u001F\uFFFD]/g)?.length ?? 0) > Math.max(3, text.length * .01); }
export function projectTree(paths: string[]) {
  type Branch = { [name: string]: Branch };
  const root: Branch = Object.create(null);
  for (const path of paths) { let branch = root; for (const name of path.split("/").filter(Boolean)) { if (!Object.hasOwn(branch, name)) branch[name] = Object.create(null); branch = branch[name]; } }
  const lines: string[] = [];
  const visit = (branch: Branch, prefix: string) => { const names = Object.keys(branch).sort(); names.forEach((name, index) => { const last = index === names.length - 1; lines.push(`${prefix}${last ? "└── " : "├── "}${name}`); visit(branch[name], `${prefix}${last ? "    " : "│   "}`); }); };
  visit(root, ""); return lines.join("\n");
}
