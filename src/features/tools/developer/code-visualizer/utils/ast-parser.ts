import { Node, Edge } from "@xyflow/react";

const generateId = () => Math.random().toString(36).substr(2, 9);

type BlockType =
  | "function"
  | "class"
  | "method"
  | "constructor"
  | "if"
  | "else"
  | "for"
  | "while"
  | "do"
  | "try"
  | "catch"
  | "finally"
  | "switch"
  | "return"
  | "throw"
  | "await"
  | "variable"
  | "expression"
  | "code-block";

export const parseCodeToGraph = (
  code: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let currentParentId: string | null = null;
  const parentStack: string[] = [];

  const createNode = (
    label: string,
    nodeType: BlockType,
    depth: number
  ): string => {
    const id = generateId();

    nodes.push({
      id,
      data: {
        label,
        nodeType,
        depth: Math.max(0, depth - 1),
      },
      position: { x: 0, y: 0 },
      type: "custom",
    });

    if (currentParentId) {
      edges.push({
        id: `e-${currentParentId}-${id}`,
        source: currentParentId,
        target: id,
        type: "smoothstep",
        animated: ["for", "while", "do", "await"].includes(nodeType),
      });
    }

    return id;
  };
  const lines = code.split("\n");
  let depth = 0;
  let currentScope: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line || line.startsWith("//")) continue;
    const indentMatch = lines[i].match(/^(\s*)/);
    const indentSize = indentMatch ? indentMatch[1].length : 0;
    const newDepth = Math.floor(indentSize / 2);
    if (line.includes("{") && !line.includes("}")) {
      depth = newDepth + 1;
    } else if (line.includes("}")) {
      depth = Math.max(0, depth - 1);
    } else {
      depth = newDepth;
    }
    let nodeType: BlockType = "code-block";
    let cleanLabel = line;

    if (line.match(/^(async\s+)?function\s+\w+\s*\(/)) {
      nodeType = "function";
      const match = line.match(/(?:async\s+)?function\s+(\w+)/);
      cleanLabel = match ? match[1] : "function";
    } else if (line.match(/^(async\s+)?\w+\s*\([^)]*\)\s*{/)) {
      nodeType = "method";
      const match = line.match(/(?:async\s+)?(\w+)\s*\(/);
      cleanLabel = match ? match[1] : "method";
    } else if (line.match(/^class\s+\w+/)) {
      nodeType = "class";
      const match = line.match(/class\s+(\w+)/);
      cleanLabel = match ? match[1] : "class";
    } else if (line.match(/^constructor\s*\(/)) {
      nodeType = "constructor";
      cleanLabel = "constructor";
    } else if (line.match(/^if\s*\(/)) {
      nodeType = "if";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^else\s+if\s*\(/)) {
      nodeType = "else";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^else\s*{?/)) {
      nodeType = "else";
      cleanLabel = "else";
    } else if (line.match(/^for\s*\(/)) {
      nodeType = "for";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^while\s*\(/)) {
      nodeType = "while";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^do\s*{/)) {
      nodeType = "do";
      cleanLabel = "do";
    } else if (line.match(/^try\s*{/)) {
      nodeType = "try";
      cleanLabel = "try";
    } else if (line.match(/^catch\s*\(/)) {
      nodeType = "catch";
      cleanLabel = "catch";
    } else if (line.match(/^finally\s*{/)) {
      nodeType = "finally";
      cleanLabel = "finally";
    } else if (line.match(/^switch\s*\(/)) {
      nodeType = "switch";
      cleanLabel = "switch";
    } else if (line.match(/^return\s+/)) {
      nodeType = "return";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^throw\s+/)) {
      nodeType = "throw";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^await\s+/)) {
      nodeType = "await";
      cleanLabel = line.substring(0, 50);
    } else if (line.match(/^(const|let|var)\s+\w+/)) {
      nodeType = "variable";
      const match = line.match(/(?:const|let|var)\s+(\w+)/);
      cleanLabel = match ? match[1] : "variable";
    }
    const nodeId = createNode(cleanLabel, nodeType, depth);
    if (
      [
        "class",
        "function",
        "method",
        "constructor",
        "if",
        "for",
        "while",
        "do",
        "try",
        "switch",
      ].includes(nodeType)
    ) {
      parentStack.push(nodeId);
      currentParentId = nodeId;
    } else if (line.includes("}") && parentStack.length > 0) {
      parentStack.pop();
      currentParentId = parentStack[parentStack.length - 1] || null;
    }
  }

  return { nodes, edges };
};
