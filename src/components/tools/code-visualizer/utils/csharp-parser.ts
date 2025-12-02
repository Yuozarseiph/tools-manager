import { Node, Edge } from "@xyflow/react";

const generateId = () => Math.random().toString(36).substr(2, 9);

type BlockType =
  | "namespace"
  | "class"
  | "method"
  | "struct"
  | "interface"
  | "enum"
  | "if"
  | "loop"
  | "try"
  | "catch"
  | "finally"
  | "switch"
  | "unknown";

export const parseCSharpToGraph = (
  code: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // --- Helpers ---
  const createNode = (
    label: string,
    nodeType: string,
    depth: number,
    parentId?: string
  ) => {
    const id = generateId();
    nodes.push({
      id,
      data: { label, nodeType, depth },
      position: { x: 0, y: 0 },
      type: "custom",
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: nodeType === "loop" || nodeType === "async",
        type: "smoothstep",
        style: {
          stroke: nodeType === "return" ? "#ef4444" : "#94a3b8",
          strokeWidth: 1.5,
        },
      });
    }
    return id;
  };

  const detectType = (header: string): BlockType => {
    const h = header.trim();
    if (h.startsWith("namespace ")) return "namespace";
    if (h.includes("class ")) return "class";
    if (h.includes("interface ")) return "interface";
    if (h.includes("struct ")) return "struct";
    if (h.includes("enum ")) return "enum";
    if (h.startsWith("if") || h.startsWith("else if")) return "if";
    if (h.startsWith("else")) return "if";
    if (
      h.startsWith("for") ||
      h.startsWith("foreach") ||
      h.startsWith("while") ||
      h.startsWith("do")
    )
      return "loop";
    if (h.startsWith("try")) return "try";
    if (h.startsWith("catch")) return "catch";
    if (h.startsWith("finally")) return "finally";
    if (h.startsWith("switch")) return "switch";
    if (h.includes("(") && h.includes(")")) return "method";
    return "unknown";
  };

  const mapTypeToStyle = (t: BlockType): string => {
    switch (t) {
      case "class":
      case "struct":
      case "namespace":
        return "function";
      case "method":
        return "function"; // یا async اگر async داره
      case "if":
      case "switch":
        return "if";
      case "loop":
        return "loop";
      case "try":
      case "catch":
      case "finally":
        return "error";
      default:
        return "code-block";
    }
  };

  // --- Core Parsing Logic (Recursive Manual Parser) ---
  const processScope = (scopeCode: string, parentId?: string, depth = 0) => {
    let cursor = 0;
    let buffer = "";
    let lastInChain = parentId;
    let textBuffer: string[] = [];

    const flushText = () => {
      if (textBuffer.length > 0) {
        const label = textBuffer.join("\n").trim();
        if (label) {
          let style = "code-block";
          if (label.startsWith("return ")) style = "return";
          if (label.startsWith("throw ")) style = "error";
          lastInChain = createNode(label, style, depth, lastInChain);
        }
        textBuffer = [];
      }
    };

    while (cursor < scopeCode.length) {
      const char = scopeCode[cursor];

      // 1. String Handling
      if (char === '"' || char === "'") {
        const quote = char;
        buffer += char;
        cursor++;
        while (cursor < scopeCode.length && scopeCode[cursor] !== quote) {
          if (scopeCode[cursor] === "\\") {
            buffer += "\\";
            cursor++;
          }
          buffer += scopeCode[cursor];
          cursor++;
        }
        buffer += char;
        cursor++;
        continue;
      }

      // 2. Comment Handling
      if (char === "/" && scopeCode[cursor + 1] === "/") {
        while (cursor < scopeCode.length && scopeCode[cursor] !== "\n") {
          buffer += scopeCode[cursor];
          cursor++;
        }
        continue;
      }

      // 3. Block Start {
      if (char === "{") {
        flushText(); // هر متنی که تا الان جمع شده (مثل هدر تابع)

        const header = buffer.trim();
        buffer = "";

        // پیدا کردن جفت کروشه بسته }
        let balance = 1;
        let innerCursor = cursor + 1;
        let innerStart = innerCursor;

        while (innerCursor < scopeCode.length && balance > 0) {
          if (scopeCode[innerCursor] === "{") balance++;
          if (scopeCode[innerCursor] === "}") balance--;
          innerCursor++;
        }

        const innerBody = scopeCode.slice(innerStart, innerCursor - 1);
        const type = detectType(header);

        let cleanHeader = header;
        if (cleanHeader.length > 60)
          cleanHeader = cleanHeader.substring(0, 57) + "...";
        if (!cleanHeader) cleanHeader = "Block";

        // نود والد (کانتینر)
        const containerId = createNode(
          cleanHeader,
          mapTypeToStyle(type),
          depth,
          lastInChain
        );

        // ورود به داخل بلاک
        processScope(innerBody, containerId, depth + 1);

        lastInChain = containerId;
        cursor = innerCursor;
        continue;
      }

      // 4. End of Statement ;
      if (char === ";") {
        buffer += char;
        textBuffer.push(buffer.trim());
        buffer = "";
        cursor++;
        continue;
      }

      buffer += char;
      cursor++;
    }

    if (buffer.trim()) {
      textBuffer.push(buffer.trim());
    }
    flushText();
  };

  // حذف کامنت‌های چند خطی قبل از پردازش
  const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, "");
  processScope(cleanCode, undefined, 0);

  return { nodes, edges };
};
