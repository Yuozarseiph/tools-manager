import { TOOLS } from "@/config/tools";
import { toolMarkdown } from "@/lib/seo/tool-markdown";
export const dynamic = "force-static";
export function GET() {
  return new Response(["# QodeForge full tool guide", "", ...(["fa", "en"] as const).flatMap(locale => TOOLS.filter(tool => tool.status === "active" && tool.href.startsWith("/tools/")).map(tool => toolMarkdown(tool.href.split("/").pop()!, locale)))].join("\n\n---\n\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
