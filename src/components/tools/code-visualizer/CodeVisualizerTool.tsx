'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react'; // Node و Edge رو ایمپورت کن
import '@xyflow/react/dist/style.css';
import { useThemeColors } from '@/hooks/useThemeColors';
import { parseCodeToGraph } from './utils/ast-parser';
import { parseCSharpToGraph } from './utils/csharp-parser';
import { getLayoutedElements } from './utils/graph-layout';
import CustomGraphNode from './CustomGraphNode';

const initialCode = `class ShoppingCart {
  async checkout() {
    try {
      console.log("Start");
    } catch(err) {
      console.error(err);
    }
  }
}`;

export default function CodeVisualizerTool() {
  const theme = useThemeColors();
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState<'js' | 'csharp'>('js');
  
  // اینجا تایپ Node[] و Edge[] رو اضافه کن
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]); 
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({
    custom: CustomGraphNode,
  }), []);

  const processGraph = useCallback(() => {
    let result;
    
    if (language === 'js') {
      result = parseCodeToGraph(code);
    } else {
      result = parseCSharpToGraph(code);
    }
    
    const { nodes: rawNodes, edges: rawEdges } = result;
    
    if (rawNodes.length === 0) return;
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [code, language, setNodes, setEdges]);

  useEffect(() => {
    const timer = setTimeout(processGraph, 800);
    return () => clearTimeout(timer);
  }, [processGraph]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] lg:h-[800px]">
      
      {/* ادیتور */}
      <div className={`lg:col-span-1 rounded-xl border flex flex-col transition-colors duration-300 ${theme.card} ${theme.border}`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${theme.border}`}>
          <h3 className={`font-bold ${theme.text}`}>Code Editor</h3>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setLanguage('js')}
              className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                language === 'js' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => setLanguage('csharp')}
              className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                language === 'csharp' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-300' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              C# (Beta)
            </button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`w-full flex-1 p-4 font-mono text-xs sm:text-sm resize-none outline-none bg-transparent leading-relaxed ${theme.text}`}
          spellCheck={false}
          placeholder={language === 'js' ? "// Paste JS code..." : "// Paste C# code..."}
        />
      </div>

      {/* گراف */}
      <div className={`lg:col-span-2 rounded-xl border overflow-hidden shadow-inner relative transition-colors duration-300 ${theme.bg} ${theme.border}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color={theme.name.includes('تاریک') ? '#555' : '#ccc'} gap={24} size={1} />
          <Controls className="!bg-white/10 !backdrop-blur-md !border-white/20 !fill-current" />
        </ReactFlow>
      </div>
    </div>
  );
}
