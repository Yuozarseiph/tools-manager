export const agentToolDefinitions = [
  { name: "qodeforge_word_count", description: "Count words and characters in supplied text locally. Does not read the page, save data or make network requests.",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"], additionalProperties: false } },
  { name: "qodeforge_base64", description: "Encode UTF-8 text to Base64 or decode Base64 to UTF-8 text locally.",
    inputSchema: { type: "object", properties: { text: { type: "string" }, action: { type: "string", enum: ["encode", "decode"] } }, required: ["text", "action"], additionalProperties: false } },
  { name: "qodeforge_hash", description: "Compute a SHA digest of supplied UTF-8 text locally using Web Crypto.",
    inputSchema: { type: "object", properties: { text: { type: "string" }, algorithm: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] } }, required: ["text", "algorithm"], additionalProperties: false } },
  { name: "qodeforge_convert_unit", description: "Convert a numeric value using QodeForge unit definitions. Supply category and unit keys from the unit converter, such as length, m, km.",
    inputSchema: { type: "object", properties: { value: { type: "number" }, category: { type: "string" }, from: { type: "string" }, to: { type: "string" } }, required: ["value", "category", "from", "to"], additionalProperties: false } },
] as const;

export async function executeAgentTool(name: string, input: Record<string, unknown>) {
  if (name !== "qodeforge_convert_unit" && typeof input.text !== "string") throw new Error("text must be a string");
  const text = input.text as string;
  switch (name) {
    case "qodeforge_word_count": return { words: text.trim() ? text.trim().split(/\s+/).length : 0, characters: text.length, charactersWithoutSpaces: text.replace(/\s/g, "").length };
    case "qodeforge_base64": {
      if (input.action === "encode") {
        const bytes = new TextEncoder().encode(text);
        let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
        return { result: btoa(binary) };
      }
      if (input.action !== "decode") throw new Error("action must be encode or decode");
      const binary = atob(text); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
      return { result: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
    }
    case "qodeforge_hash": {
      if (!["SHA-1", "SHA-256", "SHA-384", "SHA-512"].includes(String(input.algorithm))) throw new Error("Unsupported hash algorithm");
      const digest = await crypto.subtle.digest(String(input.algorithm), new TextEncoder().encode(text));
      return { result: [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("") };
    }
    case "qodeforge_convert_unit": {
      if (typeof input.value !== "number" || !Number.isFinite(input.value)) throw new Error("value must be a finite number");
      const { CATEGORIES, convert } = await import("@/components/tools/utility/unit-converter/units.data");
      const category = String(input.category); const from = String(input.from); const to = String(input.to);
      const definition = Object.hasOwn(CATEGORIES, category) ? CATEGORIES[category] : undefined;
      if (!definition || !Object.hasOwn(definition.units, from) || !Object.hasOwn(definition.units, to)) throw new Error("Unknown category or unit");
      const result = convert(input.value, category, from, to);
      if (result === null || !Number.isFinite(result)) throw new Error("Conversion failed");
      return { result, unit: to };
    }
    default: throw new Error("Unknown QodeForge tool");
  }
}
