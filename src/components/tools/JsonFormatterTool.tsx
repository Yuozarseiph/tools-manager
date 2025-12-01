// components/tools/JsonFormatterTool.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Trash2, Maximize2, Network, Code } from 'lucide-react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css'; // استایل‌های React Flow
import CustomJsonNode from './CustomJsonNode'; // نود سفارشی
import { getLayoutedElements } from '@/utils/json-to-graph'; // الگوریتم

const nodeTypes = { customJsonNode: CustomJsonNode };

export default function JsonFormatterTool() {
  const theme = useThemeColors();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [viewMode, setViewMode] = useState<'code' | 'graph'>('code'); // تب فعال

  // استیت‌های گراف
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // وقتی ورودی تغییر میکنه و معتبره، گراف رو آپدیت کن
  const updateGraph = (json: any) => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(json);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const formatJson = (jsonString: string) => {
    if (!jsonString.trim()) return;
    try {
      const parsed = JSON.parse(jsonString);
      setOutput(JSON.stringify(parsed, null, 2));
      updateGraph(parsed); // <--- آپدیت گراف
    } catch (err) {
      // خطا رو نشون نده تو گراف
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[650px]">
      
      {/* ستون چپ: ادیتور (همیشه هست) */}
      <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm ${theme.card} ${theme.border}`}>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); formatJson(e.target.value); }}
          placeholder="JSON خود را اینجا وارد کنید..."
          className={`flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm bg-transparent ${theme.text}`}
          spellCheck={false}
        />
      </div>

      {/* ستون راست: نمایشگر (تب‌دار) */}
      <div className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm relative ${theme.card} ${theme.border}`}>
        
        {/* نوار ابزار تب */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${theme.border} ${theme.bg}`}>
          <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
              ${viewMode === 'code' ? 'bg-white dark:bg-black shadow-sm' : 'opacity-50 hover:opacity-100'}`}
            >
              <Code size={14} /> کد (Code)
            </button>
            <button 
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
              ${viewMode === 'graph' ? 'bg-white dark:bg-black shadow-sm text-blue-600' : 'opacity-50 hover:opacity-100'}`}
            >
              <Network size={14} /> گراف (Visual)
            </button>
          </div>
        </div>

        {/* محتوای تب */}
        <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative">
          {viewMode === 'code' ? (
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: '1.5rem', height: '100%', fontSize: '14px' }}
              wrapLines={true}
            >
              {output || '{}'}
            </SyntaxHighlighter>
          ) : (
            <div className="h-full w-full bg-zinc-900">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
              >
                <Background color="#333" gap={20} />
                <Controls />
              </ReactFlow>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
