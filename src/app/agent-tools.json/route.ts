import { agentToolDefinitions } from "@/lib/agent-tools";
export const dynamic = "force-static";
export function GET() {
  return Response.json({ name: "QodeForge", execution: "browser-local", entryPoint: "window.QodeForgeTools.execute(name, input)",
    documentation: "https://qodeforge.ir/en/agents", tools: agentToolDefinitions });
}
