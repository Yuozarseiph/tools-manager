import { marked } from "marked";
export type InputFormat = "auto" | "html" | "markdown";
export function presentationHtml(source: string, format: InputFormat) {
  const html = format === "html" || format === "auto" && /<(?:!doctype|html|body|head|style|h[1-6]|p|div|section|article|table|ul|ol|img|pre)\b/i.test(source);
  return html ? source : marked.parse(source, { async: false, gfm: true, breaks: false });
}
