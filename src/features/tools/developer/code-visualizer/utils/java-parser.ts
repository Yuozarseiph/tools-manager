// components/tools/developer/code-visualizer/utils/java-parser.ts
import { Node, Edge } from "@xyflow/react";

const generateId = () => Math.random().toString(36).substr(2, 9);

type BlockType =
  | "package"
  | "import"
  | "class"
  | "interface"
  | "enum"
  | "annotation"
  | "method"
  | "constructor"
  | "field"
  | "if"
  | "else"
  | "loop"
  | "try"
  | "catch"
  | "finally"
  | "switch"
  | "case"
  | "return"
  | "throw"
  | "synchronized"
  | "expression"
  | "comment"
  | "unknown"
  | "abstract";

export const parseJavaToGraph = (
  code: string,
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const isWhitespace = (char: string): boolean => /\s/.test(char);
  const isLetter = (char: string): boolean => /[a-zA-Z_]/.test(char);
  const isDigit = (char: string): boolean => /[0-9]/.test(char);
  const isOperator = (char: string): boolean => /[+\-*/%&|^~=<>!?:]/.test(char);

  const createNode = (
    label: string,
    nodeType: BlockType,
    depth: number,
    parentId?: string,
    metadata: {
      modifiers?: string[];
      returnType?: string;
      parameters?: string[];
      accessLevel?: "public" | "private" | "protected";
      isStatic?: boolean;
      isAbstract?: boolean;
      isFinal?: boolean;
      isSynchronized?: boolean;
      isNative?: boolean;
      isTransient?: boolean;
      isVolatile?: boolean;
      lineNumber?: number;
    } = {},
  ) => {
    const id = generateId();
    const node: Node = {
      id,
      data: {
        label,
        nodeType,
        depth,
        ...metadata,
        fullLabel: label,
        displayLabel:
          label.length > 50 ? label.substring(0, 47) + "..." : label,
      },
      position: { x: 0, y: 0 },
      type: "custom",
    };

    nodes.push(node);

    if (parentId) {
      const edge: Edge = {
        id: `e-${parentId}-${id}`,
        source: parentId,
        target: id,
        animated: nodeType === "loop" || nodeType === "synchronized",
        type: "smoothstep",
        style: {
          stroke: getEdgeColor(nodeType),
          strokeWidth: getEdgeWidth(nodeType, depth),
          strokeDasharray: getEdgeDashed(nodeType),
        },
        label: getEdgeLabel(nodeType, metadata),
      };
      edges.push(edge);
    }
    return id;
  };

  const getEdgeColor = (type: BlockType): string => {
    switch (type) {
      case "return":
        return "#ef4444";
      case "throw":
        return "#dc2626";
      case "loop":
        return "#10b981";
      case "if":
      case "else":
        return "#f59e0b";
      case "try":
      case "catch":
      case "finally":
        return "#ec4899";
      case "switch":
      case "case":
        return "#f97316";
      case "synchronized":
        return "#8b5cf6";
      case "package":
      case "import":
        return "#6366f1";
      default:
        return "#94a3b8";
    }
  };

  const getEdgeWidth = (type: BlockType, depth: number): number => {
    const baseWidth = 1.5;
    const depthFactor = Math.max(0.5, 2 - depth * 0.2);
    return baseWidth * depthFactor;
  };

  const getEdgeDashed = (type: BlockType): string | undefined => {
    if (type === "interface" || type === "abstract") return "5,5";
    return undefined;
  };

  const getEdgeLabel = (type: BlockType, metadata: any): string | undefined => {
    if (metadata?.isStatic) return "static";
    if (metadata?.isAbstract) return "abstract";
    if (metadata?.isFinal) return "final";
    if (metadata?.isSynchronized) return "synchronized";
    return undefined;
  };

  const detectType = (header: string, context?: string): BlockType => {
    const h = header.trim();

    if (h.startsWith("//") || h.startsWith("/*") || h.startsWith("*"))
      return "comment";
    if (h.startsWith("package ")) return "package";
    if (h.startsWith("import ")) return "import";
    if (h.startsWith("@")) return "annotation";

    if (h.includes(" class ")) return "class";
    if (h.includes(" interface ")) return "interface";
    if (h.includes(" enum ")) return "enum";

    if (h.match(/\w+\s+\w+\s*\([^)]*\)\s*({|;)/)) {
      if (h.includes("(") && !h.includes("=")) return "method";
    }
    if (h.includes("=") && !h.includes("(")) return "field";
    if (h.startsWith("if(") || h.startsWith("if ")) return "if";
    if (h.startsWith("else")) return "else";
    if (h.startsWith("for(") || h.startsWith("for ")) return "loop";
    if (h.startsWith("while(") || h.startsWith("while ")) return "loop";
    if (h.startsWith("do")) return "loop";
    if (h.startsWith("try")) return "try";
    if (h.startsWith("catch")) return "catch";
    if (h.startsWith("finally")) return "finally";
    if (h.startsWith("switch")) return "switch";
    if (h.startsWith("case ") || h.includes(":")) return "case";
    if (h.startsWith("return ")) return "return";
    if (h.startsWith("throw ")) return "throw";
    if (h.startsWith("synchronized")) return "synchronized";

    return "unknown";
  };

  const extractMetadata = (tokens: string[]): any => {
    const metadata: any = {
      modifiers: [],
      isStatic: false,
      isAbstract: false,
      isFinal: false,
      isSynchronized: false,
      isNative: false,
      isTransient: false,
      isVolatile: false,
      accessLevel: "package",
    };

    const accessModifiers = ["public", "private", "protected"];
    const otherModifiers = [
      "static",
      "abstract",
      "final",
      "synchronized",
      "native",
      "transient",
      "volatile",
    ];

    for (const token of tokens) {
      if (accessModifiers.includes(token)) {
        metadata.accessLevel = token;
        metadata.modifiers.push(token);
      } else if (otherModifiers.includes(token)) {
        metadata[`is${token.charAt(0).toUpperCase() + token.slice(1)}`] = true;
        metadata.modifiers.push(token);
      }
    }
    return metadata;
  };

  const parseMethodSignature = (header: string): any => {
    const match = header.match(/(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)/);
    if (!match) return null;
    const [, returnType, methodName, paramsStr] = match;
    const parameters = paramsStr
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p);
    return { returnType, methodName, parameters };
  };

  interface ParserState {
    position: number;
    depth: number;
    currentParent?: string;
    context: string[];
  }

  const scanToken = (code: string, state: ParserState): string => {
    let token = "";
    let char = code[state.position];

    while (state.position < code.length && isWhitespace(char)) {
      state.position++;
      char = code[state.position];
    }
    if (state.position >= code.length) return "";

    if (char === '"' || char === "'") {
      const quote = char;
      token += char;
      state.position++;
      while (state.position < code.length && code[state.position] !== quote) {
        if (code[state.position] === "\\") {
          token += "\\";
          state.position++;
        }
        token += code[state.position];
        state.position++;
      }
      if (state.position < code.length) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }

    if (char === "/" && code[state.position + 1] === "/") {
      while (state.position < code.length && code[state.position] !== "\n") {
        token += code[state.position];
        state.position++;
      }
      return token;
    }

    if (char === "/" && code[state.position + 1] === "*") {
      token += "/*";
      state.position += 2;
      while (
        state.position < code.length - 1 &&
        !(code[state.position] === "*" && code[state.position + 1] === "/")
      ) {
        token += code[state.position];
        state.position++;
      }
      if (state.position < code.length - 1) {
        token += "*/";
        state.position += 2;
      }
      return token;
    }

    if (isDigit(char) || (char === "." && isDigit(code[state.position + 1]))) {
      while (
        state.position < code.length &&
        (isDigit(code[state.position]) || code[state.position] === ".")
      ) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }

    if (isLetter(char) || char === "@" || char === "_") {
      while (
        state.position < code.length &&
        (isLetter(code[state.position]) ||
          isDigit(code[state.position]) ||
          code[state.position] === "_")
      ) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }

    if (isOperator(char)) {
      while (state.position < code.length && isOperator(code[state.position])) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }

    token = char;
    state.position++;
    return token;
  };

  const parseBlock = (
    code: string,
    state: ParserState,
    parentId?: string,
  ): void => {
    let currentParent = parentId;
    let statementBuffer: string[] = [];
    let tokens: string[] = [];
    let lastStatement = ""; // ذخیره آخرین statement برای استفاده در context

    const flushStatement = () => {
      if (statementBuffer.length === 0) return;
      const statement = statementBuffer.join(" ").trim();
      if (!statement) return;

      lastStatement = statement; // ذخیره برای استفاده بعدی

      const type = detectType(
        statement,
        state.context[state.context.length - 1],
      );
      let metadata = {};

      if (
        type === "method" ||
        type === "field" ||
        type === "class" ||
        type === "interface"
      ) {
        metadata = extractMetadata(tokens);
        if (type === "method") {
          const sig = parseMethodSignature(statement);
          if (sig) metadata = { ...metadata, ...sig };
        }
      }

      const nodeId = createNode(
        statement,
        type,
        state.depth,
        currentParent,
        metadata,
      );

      if (["class", "interface", "enum", "method"].includes(type)) {
        currentParent = nodeId;
      }

      statementBuffer = [];
      tokens = [];
    };

    while (state.position < code.length) {
      const token = scanToken(code, state);
      if (!token) continue;

      if (token === "{") {
        // قبل از flush کردن، statement فعلی رو ذخیره کن
        const currentStatement = statementBuffer.join(" ").trim();
        flushStatement();

        let balance = 1;
        const startPos = state.position;
        while (state.position < code.length && balance > 0) {
          const nextToken = scanToken(code, state);
          if (nextToken === "{") balance++;
          if (nextToken === "}") balance--;
        }
        const blockContent = code.substring(startPos, state.position - 1);
        state.depth++;
        if (currentParent) {
          const nestedState: ParserState = {
            position: 0,
            depth: state.depth,
            currentParent,
            context: [...state.context, currentStatement || lastStatement],
          };
          parseBlock(blockContent, nestedState, currentParent);
        }
        state.depth--;
        continue;
      }

      if (token === ";") {
        statementBuffer.push(token);
        flushStatement();
        continue;
      }

      if (token !== "\n" && token !== "\r") {
        statementBuffer.push(token);
        if (token.length > 1 || isLetter(token[0]) || isDigit(token[0])) {
          tokens.push(token);
        }
      }
    }
    flushStatement();
  };

  const cleanedCode = code.replace(/\r\n/g, "\n");
  const initialState: ParserState = { position: 0, depth: 0, context: [] };
  parseBlock(cleanedCode, initialState);

  return { nodes, edges };
};
