import { fence } from "./ai-text";
function safeHref(value: string) { return /^(?:https?:|mailto:|#|\/|\.\.?\/)/i.test(value) ? value.replace(/[()\s]/g, character => encodeURIComponent(character)) : ""; }
export function htmlMarkdown(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html");
  document.querySelectorAll("script,style,noscript,iframe,object,embed,svg,canvas,form,template,head").forEach(node => node.remove());
  const inline = (value: string) => value.replace(/([\\`*_[\]<>])/g, "\\$1");
  const walk = (node: Node, depth = 0): string => {
    if (node.nodeType === Node.TEXT_NODE) return inline((node.textContent ?? "").replace(/\s+/g, " "));
    if (!(node instanceof Element)) return "";
    const tag = node.tagName.toLowerCase();
    const children = () => Array.from(node.childNodes).map(child => walk(child, depth)).join("");
    if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag[1]))} ${children().trim()}\n\n`;
    if (tag === "pre") return `\n\n${fence(node.textContent ?? "", node.querySelector("code")?.className.match(/language-([\w+-]+)/)?.[1])}\n\n`;
    if (tag === "code") { const text = node.textContent ?? ""; const ticks = "`".repeat(Math.max(0, ...Array.from(text.matchAll(/`+/g), match => match[0].length)) + 1); return `${ticks} ${text} ${ticks}`; }
    if (tag === "strong" || tag === "b") return `**${children()}**`;
    if (tag === "em" || tag === "i") return `*${children()}*`;
    if (tag === "del" || tag === "s") return `~~${children()}~~`;
    if (tag === "br") return "\n";
    if (tag === "hr") return "\n\n---\n\n";
    if (tag === "a") { const text = children(); const href = safeHref(node.getAttribute("href") ?? ""); return href ? `[${text}](${href})` : text; }
    if (tag === "img") return node.getAttribute("alt") ? `[${inline(node.getAttribute("alt")!)}]` : "";
    if (tag === "ul" || tag === "ol") {
      let number = Number(node.getAttribute("start") ?? 1);
      return "\n" + Array.from(node.children).filter(child => child.tagName === "LI").map(child => `${"  ".repeat(depth)}${tag === "ol" ? `${number++}.` : "-"} ${Array.from(child.childNodes).map(item => walk(item, depth + 1)).join("").trim()}`).join("\n") + "\n";
    }
    if (tag === "blockquote") return `\n\n${children().trim().split("\n").map(line => `> ${line}`).join("\n")}\n\n`;
    if (tag === "table") {
      const rows = Array.from(node.querySelectorAll("tr")).filter(row => row.closest("table") === node).map(row => Array.from(row.children).map(cell => walk(cell).trim().replace(/\|/g, "\\|").replace(/\n/g, " ")));
      if (!rows.length) return "";
      const width = Math.max(...rows.map(row => row.length));
      const format = (row: string[]) => `| ${Array.from({ length: width }, (_, index) => row[index] ?? "").join(" | ")} |`;
      return `\n\n${format(rows[0])}\n${format(Array(width).fill("---"))}\n${rows.slice(1).map(format).join("\n")}\n\n`;
    }
    const value = children();
    return ["p", "div", "section", "article", "header", "footer", "tr"].includes(tag) ? `\n\n${value.trim()}\n\n` : value;
  };
  return Array.from(document.body.childNodes).map(node => walk(node)).join("").replace(/\n{3,}/g, "\n\n").trim();
}
