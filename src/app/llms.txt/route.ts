import { TOOLS } from "@/data/tools";
import { toolInfo } from "@/lib/tool-guide";
export const dynamic = "force-static";
export function GET() {
  const text = ["# QodeForge", "", "> Free tools in Persian and English. Processing and network exceptions are documented per tool.", "",
    "Privacy: https://qodeforge.ir/en/privacy", "Full guide: https://qodeforge.ir/llms-full.txt", "",
    "Browser tool schemas: https://qodeforge.ir/agent-tools.json", "Agent guide: https://qodeforge.ir/en/agents", "",
    ...(["fa", "en"] as const).flatMap(locale => [locale === "fa" ? "## ابزارهای فارسی" : "## English tools", "",
      ...TOOLS.filter(tool => tool.status === "active").map(tool => `- [${toolInfo(tool, locale).name}](${tool.href.startsWith("/") ? `https://qodeforge.ir/${locale}${tool.href}` : tool.href}): ${toolInfo(tool, locale).description}`), ""]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
