import { Node, Edge } from "@xyflow/react";

const generateId = () => Math.random().toString(36).substr(2, 9);

type BlockType =
  | "namespace"
  | "class"
  | "method"
  | "property"
  | "field"
  | "constructor"
  | "struct"
  | "interface"
  | "enum"
  | "delegate"
  | "event"
  | "if"
  | "else"
  | "elseif"
  | "loop"
  | "try"
  | "catch"
  | "finally"
  | "switch"
  | "case"
  | "using"
  | "lock"
  | "fixed"
  | "unsafe"
  | "checked"
  | "unchecked"
  | "expression"
  | "return"
  | "throw"
  | "await"
  | "yield"
  | "attribute"
  | "comment"
  | "region"
  | "virtual"    // اضافه شد
  | "abstract"   // اضافه شد
  | "unknown";

export const parseCSharpToGraph = (
  code: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // --- Utility Functions ---
  const isWhitespace = (char: string): boolean => /\s/.test(char);
  const isLetter = (char: string): boolean => /[a-zA-Z_]/.test(char);
  const isDigit = (char: string): boolean => /[0-9]/.test(char);
  const isOperator = (char: string): boolean => /[+\-*/%&|^~=<>!?:]/.test(char);

  // --- Node Creation with Enhanced Data ---
  const createNode = (
    label: string,
    nodeType: BlockType,
    depth: number,
    parentId?: string,
    metadata: {
      modifiers?: string[];
      returnType?: string;
      parameters?: string[];
      accessLevel?: "public" | "private" | "protected" | "internal";
      isStatic?: boolean;
      isAbstract?: boolean;
      isVirtual?: boolean;
      isOverride?: boolean;
      isSealed?: boolean;
      isAsync?: boolean;
      isPartial?: boolean;
      lineNumber?: number;
    } = {}
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
        displayLabel: label.length > 50 ? label.substring(0, 47) + "..." : label,
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
        animated: nodeType === "loop" || nodeType === "await" || nodeType === "yield",
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

  // --- Edge Styling ---
  const getEdgeColor = (type: BlockType): string => {
    switch (type) {
      case "return": return "#ef4444";
      case "throw": return "#dc2626";
      case "await": return "#3b82f6";
      case "yield": return "#8b5cf6";
      case "loop": return "#10b981";
      case "if":
      case "else":
      case "elseif": return "#f59e0b";
      case "try":
      case "catch":
      case "finally": return "#ec4899";
      case "switch":
      case "case": return "#f97316";
      case "using":
      case "lock":
      case "fixed": return "#6366f1";
      default: return "#94a3b8";
    }
  };

  const getEdgeWidth = (type: BlockType, depth: number): number => {
    const baseWidth = 1.5;
    const depthFactor = Math.max(0.5, 2 - depth * 0.2);
    return baseWidth * depthFactor;
  };

  const getEdgeDashed = (type: BlockType): string | undefined => {
    switch (type) {
      case "interface":
      case "abstract":  // حالا در BlockType وجود دارد
        return "5,5";
      case "virtual":   // حالا در BlockType وجود دارد
        return "3,3";
      default:
        return undefined;
    }
  };

  const getEdgeLabel = (type: BlockType, metadata: any): string | undefined => {
    if (metadata?.isAsync) return "async";
    if (metadata?.isStatic) return "static";
    if (metadata?.isOverride) return "override";
    if (metadata?.isVirtual) return "virtual";
    if (metadata?.isAbstract) return "abstract";
    return undefined;
  };

  // --- Advanced Type Detection ---
  const detectType = (header: string, context?: string): BlockType => {
    const h = header.trim();
    
    // Comments and Regions
    if (h.startsWith("//") || h.startsWith("/*") || h.startsWith("*")) return "comment";
    if (h.startsWith("#region")) return "region";
    if (h.startsWith("#endregion")) return "region";
    
    // Using directives
    if (h.startsWith("using ")) return "using";
    
    // Attributes
    if (h.startsWith("[") && h.endsWith("]")) return "attribute";
    
    // Namespace
    if (h.startsWith("namespace ")) return "namespace";
    
    // Type declarations
    if (h.includes(" class ")) return "class";
    if (h.includes(" interface ")) return "interface";
    if (h.includes(" struct ")) return "struct";
    if (h.includes(" enum ")) return "enum";
    if (h.includes(" delegate ")) return "delegate";
    
    // Members
    if (h.match(/\w+\s+\w+\s*\([^)]*\)\s*({|=>|;)/)) {
      if (h.includes(" get ") || h.includes(" set ") || h.includes("=>")) return "property";
      if (h.includes(" constructor ") || h.includes("ctor(")) return "constructor";
      return "method";
    }
    
    // Fields and properties (without parentheses)
    if (h.match(/\w+\s+\w+\s*[=;{]/) && !h.includes("(")) {
      if (h.includes("{ get; set; }") || h.includes("=>")) return "property";
      return "field";
    }
    
    // Events
    if (h.includes(" event ")) return "event";
    
    // Control flow
    if (h.startsWith("if(") || h.startsWith("if ")) return "if";
    if (h.startsWith("else if")) return "elseif";
    if (h.startsWith("else")) return "else";
    
    // Loops
    if (h.startsWith("for(") || h.startsWith("for ")) return "loop";
    if (h.startsWith("foreach(") || h.startsWith("foreach ")) return "loop";
    if (h.startsWith("while(") || h.startsWith("while ")) return "loop";
    if (h.startsWith("do")) return "loop";
    
    // Exception handling
    if (h.startsWith("try")) return "try";
    if (h.startsWith("catch")) return "catch";
    if (h.startsWith("finally")) return "finally";
    
    // Switch
    if (h.startsWith("switch")) return "switch";
    if (h.startsWith("case ") || h.includes(":") && context === "switch") return "case";
    
    // Resource management
    if (h.startsWith("using(") || h.startsWith("using ")) return "using";
    if (h.startsWith("lock")) return "lock";
    if (h.startsWith("fixed")) return "fixed";
    
    // Unsafe context
    if (h.startsWith("unsafe")) return "unsafe";
    
    // Checked/unchecked
    if (h.startsWith("checked")) return "checked";
    if (h.startsWith("unchecked")) return "unchecked";
    
    // Expressions
    if (h.includes("=") || h.includes("+=") || h.includes("-=") || 
        h.includes("*=") || h.includes("/=") || h.includes("++") || 
        h.includes("--")) return "expression";
    
    if (h.startsWith("return ")) return "return";
    if (h.startsWith("throw ")) return "throw";
    if (h.startsWith("await ")) return "await";
    if (h.startsWith("yield ")) return "yield";
    
    return "unknown";
  };

  // --- Parser State ---
  interface ParserState {
    position: number;
    depth: number;
    currentParent?: string;
    inRegion: boolean;
    regionName: string;
    context: string[];
  }

  // --- Token Scanner ---
  const scanToken = (code: string, state: ParserState): string => {
    let token = "";
    let char = code[state.position];
    
    // Skip whitespace
    while (state.position < code.length && isWhitespace(char)) {
      state.position++;
      char = code[state.position];
    }
    
    if (state.position >= code.length) return "";
    
    // String literal
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      token += char;
      state.position++;
      
      while (state.position < code.length && code[state.position] !== quote) {
        if (code[state.position] === '\\') {
          token += '\\';
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
    
    // Verbatim string
    if (char === '@' && code[state.position + 1] === '"') {
      token += '@"';
      state.position += 2;
      
      while (state.position < code.length) {
        if (code[state.position] === '"' && code[state.position + 1] === '"') {
          token += '""';
          state.position += 2;
        } else if (code[state.position] === '"') {
          token += '"';
          state.position++;
          break;
        } else {
          token += code[state.position];
          state.position++;
        }
      }
      return token;
    }
    
    // Comment
    if (char === '/' && code[state.position + 1] === '/') {
      while (state.position < code.length && code[state.position] !== '\n') {
        token += code[state.position];
        state.position++;
      }
      return token;
    }
    
    if (char === '/' && code[state.position + 1] === '*') {
      token += "/*";
      state.position += 2;
      
      while (state.position < code.length - 1 && 
             !(code[state.position] === '*' && code[state.position + 1] === '/')) {
        token += code[state.position];
        state.position++;
      }
      
      if (state.position < code.length - 1) {
        token += "*/";
        state.position += 2;
      }
      return token;
    }
    
    // Number
    if (isDigit(char) || (char === '.' && isDigit(code[state.position + 1]))) {
      while (state.position < code.length && 
             (isDigit(code[state.position]) || code[state.position] === '.' || 
              code[state.position].toLowerCase() === 'e' ||
              code[state.position] === '+' || code[state.position] === '-')) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }
    
    // Identifier or keyword
    if (isLetter(char)) {
      while (state.position < code.length && 
             (isLetter(code[state.position]) || isDigit(code[state.position]))) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }
    
    // Operator
    if (isOperator(char)) {
      while (state.position < code.length && isOperator(code[state.position])) {
        token += code[state.position];
        state.position++;
      }
      return token;
    }
    
    // Single character token
    token = char;
    state.position++;
    return token;
  };

  // --- Extract Modifiers and Metadata ---
  const extractMetadata = (tokens: string[]): any => {
    const metadata: any = {
      modifiers: [],
      isStatic: false,
      isAsync: false,
      isAbstract: false,
      isVirtual: false,
      isOverride: false,
      isSealed: false,
      isPartial: false,
      accessLevel: "private",
    };
    
    const accessModifiers = ["public", "private", "protected", "internal"];
    const otherModifiers = ["static", "async", "abstract", "virtual", "override", "sealed", "partial"];
    
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

  // --- Parse Method Signature ---
  const parseMethodSignature = (header: string): any => {
    const match = header.match(/(\w+)\s+(\w+)\s*\(([^)]*)\)/);
    if (!match) return null;
    
    const [, returnType, methodName, paramsStr] = match;
    const parameters = paramsStr.split(',').map(p => p.trim()).filter(p => p);
    
    return {
      returnType,
      methodName,
      parameters,
    };
  };

  // --- Main Parsing Function ---
  const parseBlock = (
    code: string,
    state: ParserState,
    parentId?: string
  ): void => {
    let currentParent = parentId;
    let statementBuffer: string[] = [];
    let tokens: string[] = [];
    
    const flushStatement = () => {
      if (statementBuffer.length === 0) return;
      
      const statement = statementBuffer.join(' ').trim();
      if (!statement) return;
      
      const type = detectType(statement, state.context[state.context.length - 1]);
      
      // Handle preprocessor directives
      if (statement.startsWith("#region")) {
        state.inRegion = true;
        state.regionName = statement.replace("#region", "").trim();
        statementBuffer = [];
        return;
      }
      
      if (statement.startsWith("#endregion")) {
        state.inRegion = false;
        state.regionName = "";
        statementBuffer = [];
        return;
      }
      
      // Extract metadata for complex declarations
      let metadata = {};
      if (type === "method" || type === "property" || type === "field") {
        metadata = extractMetadata(tokens.filter(t => 
          ["public", "private", "protected", "internal", 
           "static", "async", "abstract", "virtual", 
           "override", "sealed", "partial"].includes(t)));
        
        if (type === "method") {
          const sig = parseMethodSignature(statement);
          if (sig) {
            metadata = { ...metadata, ...sig };
          }
        }
      }
      
      // Create node for the statement
      if (state.inRegion) {
        // Group statements under region
        if (!state.regionName) {
          currentParent = createNode(
            state.regionName || "Region",
            "region",
            state.depth,
            currentParent
          );
        }
      }
      
      const nodeId = createNode(
        statement,
        type,
        state.depth,
        currentParent,
        metadata
      );
      
      // Update context for nested parsing
      if (["class", "struct", "interface", "namespace", "method"].includes(type)) {
        currentParent = nodeId;
      }
      
      statementBuffer = [];
      tokens = [];
    };
    
    while (state.position < code.length) {
      const token = scanToken(code, state);
      if (!token) continue;
      
      // Handle block boundaries
      if (token === "{") {
        flushStatement();
        
        // Find matching }
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
          // Parse nested block
          const nestedState: ParserState = {
            position: 0,
            depth: state.depth,
            currentParent,
            inRegion: state.inRegion,
            regionName: state.regionName,
            context: [...state.context, statementBuffer.join(' ').trim()],
          };
          
          parseBlock(blockContent, nestedState, currentParent);
        }
        
        state.depth--;
        continue;
      }
      
      // End of statement
      if (token === ";") {
        statementBuffer.push(token);
        flushStatement();
        continue;
      }
      
      // Handle lambda expressions
      if (token === "=>") {
        statementBuffer.push(token);
        // Lambda body might be simple expression or block
        continue;
      }
      
      // Add token to current statement
      if (token !== "\n" && token !== "\r") {
        statementBuffer.push(token);
        if (token.length > 1 || isLetter(token[0]) || isDigit(token[0])) {
          tokens.push(token);
        }
      }
    }
    
    // Flush any remaining statement
    flushStatement();
  };

  // --- Initial Cleanup ---
  const cleanCode = (input: string): string => {
    // Remove preprocessor directives except #region/#endregion
    let cleaned = input.replace(/^#(?!\s*(region|endregion))\w.*$/gm, '');
    
    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n');
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    
    return cleaned;
  };

  // --- Main Execution ---
  const cleanedCode = cleanCode(code);
  const initialState: ParserState = {
    position: 0,
    depth: 0,
    inRegion: false,
    regionName: "",
    context: [],
  };

  parseBlock(cleanedCode, initialState);

  return { nodes, edges };
};