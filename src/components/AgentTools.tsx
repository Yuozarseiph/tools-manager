"use client";
import { useEffect } from "react";
import { agentToolDefinitions, executeAgentTool } from "@/lib/agent-tools";
type ModelContext = { registerTool: (tool: unknown, options: { signal: AbortSignal }) => Promise<unknown> };
export default function AgentTools() {
  useEffect(() => {
    const controller = new AbortController();
    const browser = window as Window & { QodeForgeTools?: { execute: typeof executeAgentTool; definitions: typeof agentToolDefinitions } };
    browser.QodeForgeTools = { execute: executeAgentTool, definitions: agentToolDefinitions };
    const model = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (typeof model?.registerTool === "function") {
      for (const definition of agentToolDefinitions) {
        void model.registerTool({ ...definition, annotations: { readOnlyHint: true, consequentialHint: false, untrustedContentHint: true },
          execute: async (input: Record<string, unknown>) => JSON.stringify(await executeAgentTool(definition.name, input)),
        }, { signal: controller.signal }).catch(error => { if (!controller.signal.aborted) console.warn("WebMCP registration unavailable", error); });
      }
    }
    return () => { controller.abort(); delete browser.QodeForgeTools; };
  }, []);
  return null;
}
