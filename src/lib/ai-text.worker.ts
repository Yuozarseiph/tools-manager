/// <reference lib="webworker" />
import { cleanText, splitText, chatMarkdown, diffText, findSensitive, redact, type TextOptions, type Match } from "./ai-text";
self.onmessage = (event: MessageEvent<{ mode: string; input: string; second: string; options: TextOptions; matches: Match[] }>) => {
  try {
    const { mode, input, second, options, matches } = event.data;
    if (input.length + second.length > 2000000) throw new Error("TEXT_LIMIT");
    const result = mode === "text-cleaner" ? cleanText(input, options) : mode === "text-chunker" ? splitText(input, options) : mode === "chat-to-markdown" ? chatMarkdown(input) : mode === "text-diff" ? diffText(input, second, options) : mode === "redact" ? redact(input, matches) : findSensitive(input);
    self.postMessage({ result });
  } catch (error) { self.postMessage({ error: error instanceof Error ? error.message : "PROCESSING_FAILED" }); }
};
