import { TOOLS, type Tool } from "../tools";
import { toolsContent } from "../tools.content";
import rawDocs from "./docs.content.json";
import { supplementalDocs } from "./supplemental.docs";
import { hasNamedDownload, interfaceContent } from "./interface.content";
import type { RawDocItem } from "./docs.content";

/** Keep existing guide order, with exactly one entry per active catalogue tool. */
export function getDocumentationEntries(locale: "fa" | "en"): RawDocItem[] {
  const active = TOOLS.filter(tool => tool.status === "active");
  const guides = [...rawDocs[locale], ...supplementalDocs[locale]] as RawDocItem[];
  const seen = new Set<string>(), entries: RawDocItem[] = [];
  const add = (tool: Tool, doc?: RawDocItem) => {
    if (seen.has(tool.id)) return;
    seen.add(tool.id);
    const copy = toolsContent[locale].items[tool.id as keyof typeof toolsContent.fa.items];
    const entry: RawDocItem = {
      ...doc,
      id: tool.id, href: tool.href,
      category: tool.category === "powerpoint" ? "presentation" : tool.category,
      title: doc?.title ?? copy?.title ?? tool.id,
      description: doc?.description ?? copy?.description ?? "",
    };
    if (hasNamedDownload(tool.href.split("/").pop()!)) {
      entry.howItWorks = [...(entry.howItWorks ?? []), interfaceContent[locale].saveStep];
      entry.privacyNote = [entry.privacyNote, interfaceContent[locale].activityAnswer].filter(Boolean).join(" ");
    }
    entries.push(entry);
  };
  for (const doc of guides) {
    const tool = active.find(tool => tool.id === doc.id || tool.href === `/tools/${doc.id}`);
    if (tool) add(tool, doc);
  }
  active.forEach(tool => add(tool));
  return entries;
}
