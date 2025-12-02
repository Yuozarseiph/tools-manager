import { parse } from '@babel/parser';
import { Node, Edge } from '@xyflow/react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseCodeToGraph = (code: string): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'asyncGenerators', 'classProperties']
    });

    const createNode = (label: string, nodeType: string, depth: number, parentId?: string, edgeLabel?: string) => {
      const id = generateId();
      nodes.push({
        id,
        data: { label, nodeType, depth },
        position: { x: 0, y: 0 },
        type: 'custom',
      });
      
      if (parentId) {
        edges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: nodeType === 'loop' || nodeType === 'async',
          type: 'smoothstep',
          label: edgeLabel,
          style: { stroke: nodeType === 'return' ? '#ef4444' : '#94a3b8', strokeWidth: 1.5 }
        });
      }
      return id;
    };

    const getRawSource = (node: any): string => {
      if (!node || typeof node.start !== 'number' || typeof node.end !== 'number') return '';
      let raw = code.slice(node.start, node.end);
      if (raw.trim().endsWith(';')) raw = raw.trim().slice(0, -1);
      return raw.trim();
    };

    const processChain = (nodesList: any[], parentId?: string, depth = 0): string | undefined => {
      let lastInChain = parentId;
      let simpleBuffer: string[] = [];

      const flushBuffer = () => {
        if (simpleBuffer.length > 0) {
          const label = simpleBuffer.join('\n');
          lastInChain = createNode(label, 'code-block', depth, lastInChain);
          simpleBuffer = [];
        }
      };

      for (const node of nodesList) {
        // نودهایی که باید شکسته شوند (واردشان شویم)
        // اضافه شدن ClassMethod و ClassPrivateMethod به لیست
        const isStructure = 
            node.type.includes('Statement') && node.type !== 'ExpressionStatement' ||
            node.type.includes('Declaration') || 
            node.type === 'ClassMethod' || 
            node.type === 'ClassPrivateMethod' ||
            node.type === 'MethodDefinition' ||
            (node.type === 'ExpressionStatement' && node.expression.type === 'AwaitExpression') ||
            (node.type === 'VariableDeclaration' && node.declarations.some((d: any) => d.init && d.init.type === 'AwaitExpression'));

        if (isStructure) {
          flushBuffer();
          const newId = processNode(node, lastInChain, depth);
          if (newId) lastInChain = newId;
        } else {
          simpleBuffer.push(getRawSource(node));
        }
      }
      flushBuffer();
      return lastInChain;
    };

    const processNode = (node: any, parentId?: string, depth = 0): string | undefined => {
      
      // 1. CLASS
      if (node.type === 'ClassDeclaration') {
         const name = node.id?.name || 'Anonymous Class';
         const id = createNode(`Class ${name}`, 'function', depth, parentId);
         processChain(node.body.body, id, depth + 1);
         return id;
      }

      // 2. METHODS & FUNCTIONS (Fix applied here)
      if (['MethodDefinition', 'ClassMethod', 'ClassPrivateMethod', 'FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
         let label = '';
         let isAsync = false;
         let bodyNodes = null;

         // Babel AST: ClassMethod has 'key', 'params', 'body' directly
         if (node.type === 'ClassMethod' || node.type === 'ClassPrivateMethod') {
            const key = node.key.name || getRawSource(node.key);
            const kind = node.kind === 'constructor' ? 'Constructor' : 'Method';
            isAsync = node.async;
            const params = node.params.map((p: any) => getRawSource(p)).join(', ');
            label = `${isAsync ? 'Async ' : ''}${kind}: ${key}(${params})`;
            bodyNodes = node.body.body; // ClassMethod has direct body
         }
         // Legacy AST: MethodDefinition has 'key', 'value' -> 'value' has 'body'
         else if (node.type === 'MethodDefinition') {
            const key = node.key.name || getRawSource(node.key);
            const kind = node.kind === 'constructor' ? 'Constructor' : 'Method';
            isAsync = node.value.async;
            const params = node.value.params.map((p: any) => getRawSource(p)).join(', ');
            label = `${isAsync ? 'Async ' : ''}${kind}: ${key}(${params})`;
            bodyNodes = node.value.body.body;
         }
         // Functions
         else {
            const name = node.id?.name || 'Fn';
            isAsync = node.async;
            label = `${isAsync ? 'Async ' : ''}Fn: ${name}(...)`;
            bodyNodes = node.body.type === 'BlockStatement' ? node.body.body : [node.body];
         }

         const id = createNode(label, isAsync ? 'async' : 'function', depth, parentId);
         
         if (bodyNodes) {
            processChain(bodyNodes, id, depth + 1);
         }
         return id;
      }

      // 3. IF
      if (node.type === 'IfStatement') {
         const condition = getRawSource(node.test);
         const id = createNode(`If (${condition})`, 'if', depth, parentId);
         
         const trueBody = node.consequent.type === 'BlockStatement' ? node.consequent.body : [node.consequent];
         processChain(trueBody, id, depth + 1);

         if (node.alternate) {
            const elseId = createNode('Else', 'if', depth, id);
            const falseBody = node.alternate.type === 'BlockStatement' ? node.alternate.body : [node.alternate];
            processChain(falseBody, elseId, depth + 1);
         }
         return id;
      }

      // 4. LOOPS
      if (node.type.includes('For') || node.type.includes('While')) {
         let label = getRawSource(node).split('{')[0].trim();
         const id = createNode(label, 'loop', depth, parentId);
         const body = node.body.type === 'BlockStatement' ? node.body.body : [node.body];
         processChain(body, id, depth + 1);
         return id;
      }

      // 5. TRY/CATCH
      if (node.type === 'TryStatement') {
         const id = createNode('Try', 'error', depth, parentId);
         processChain(node.block.body, id, depth + 1);

         if (node.handler) {
            const param = node.handler.param ? getRawSource(node.handler.param) : '';
            const cId = createNode(`Catch ${param ? `(${param})` : ''}`, 'error', depth, id);
            processChain(node.handler.body.body, cId, depth + 1);
         }
         return id;
      }

      // 6. SWITCH
      if (node.type === 'SwitchStatement') {
         const id = createNode(`Switch (${getRawSource(node.discriminant)})`, 'if', depth, parentId);
         for (const c of node.cases) {
            const label = c.test ? `Case ${getRawSource(c.test)}` : 'Default';
            const cId = createNode(label, 'default', depth + 1, id);
            processChain(c.consequent, cId, depth + 2);
         }
         return id;
      }

      // 7. BLOCK
      if (node.type === 'BlockStatement') {
         return processChain(node.body, parentId, depth);
      }

      // 8. LEAF NODES
      if (node.type === 'ReturnStatement') return createNode(`Return ${node.argument ? getRawSource(node.argument) : ''}`, 'return', depth, parentId);
      if (node.type === 'ThrowStatement') return createNode(`Throw ${getRawSource(node.argument)}`, 'error', depth, parentId);

      // Fallback
      return createNode(getRawSource(node), 'code-block', depth, parentId);
    };

    if (ast.program) {
       for (const node of ast.program.body) {
           if (node.type.includes('Declaration') || node.type.includes('Function')) {
               processNode(node, undefined, 0);
           }
       }
    }

  } catch (error) {}

  return { nodes, edges };
};
