'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useThemeColors } from '@/hooks/useThemeColors';
import { parseCodeToGraph } from './utils/ast-parser';
import { parseCSharpToGraph } from './utils/csharp-parser';
import { getLayoutedElements, getTreeLayout } from './utils/graph-layout';
import CustomGraphNode from './CustomGraphNode';
import { Maximize2, Minimize2, RefreshCw, Code, Cpu, LayoutGrid } from 'lucide-react';

const sampleJavaScriptCode = `class ShoppingCart {
  constructor(items = []) {
    this.items = items;
    this.total = 0;
  }

  async addItem(item) {
    try {
      if (!item) {
        throw new Error('Item cannot be null');
      }
      
      this.items.push(item);
      await this.calculateTotal();
      
      return {
        success: true,
        message: 'Item added successfully'
      };
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  calculateTotal() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.total = this.items.reduce((sum, item) => sum + item.price, 0);
        resolve(this.total);
      }, 100);
    });
  }

  applyDiscount(discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
      return this.total;
    }
    
    const discount = this.total * (discountPercent / 100);
    return this.total - discount;
  }

  *getItemsByCategory(category) {
    for (const item of this.items) {
      if (item.category === category) {
        yield item;
      }
    }
  }
}`;

const sampleCSharpCode = `using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ECommerce
{
    public class ShoppingCart
    {
        private List<CartItem> items;
        
        public ShoppingCart()
        {
            items = new List<CartItem>();
        }
        
        public async Task AddItemAsync(CartItem item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));
            
            items.Add(item);
            await CalculateTotalAsync();
        }
        
        private async Task CalculateTotalAsync()
        {
            await Task.Delay(100);
        }
    }
}`;

export default function CodeVisualizerTool() {
  const theme = useThemeColors();
  const [code, setCode] = useState(sampleJavaScriptCode);
  const [language, setLanguage] = useState<'js' | 'csharp'>('js');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, depth: 0 });
  const [layoutMode, setLayoutMode] = useState<'hierarchical' | 'tree'>('hierarchical');
  const [compactMode, setCompactMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({
    custom: CustomGraphNode,
  }), []);

  const processGraph = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let result;
      
      if (language === 'js') {
        result = parseCodeToGraph(code);
      } else {
        result = parseCSharpToGraph(code);
      }
      
      const { nodes: rawNodes, edges: rawEdges } = result;
      
      if (rawNodes.length === 0) {
        setError('کدی برای نمایش وجود ندارد. لطفاً کد معتبری وارد کنید.');
        setNodes([]);
        setEdges([]);
        setStats({ nodes: 0, edges: 0, depth: 0 });
        return;
      }
      
      // محاسبه حداکثر عمق به صورت درست
      const maxDepth = rawNodes.reduce((max: number, node) => {
        const depth = node.data?.depth as number || 0;
        return Math.max(max, depth);
      }, 0);
      
      // Apply layout
      let layoutedNodes, layoutedEdges;
      const isDark = theme.name.includes('تاریک');
      
      switch (layoutMode) {
        case 'tree':
          ({ nodes: layoutedNodes, edges: layoutedEdges } = getTreeLayout(
            rawNodes, 
            rawEdges,
            undefined,
            isDark ? 'dark' : 'light',
            compactMode
          ));
          break;
        case 'hierarchical':
        default:
          ({ nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes, 
            rawEdges,
            {
              theme: isDark ? 'dark' : 'light',
              direction: 'TB',
              compactMode
            }
          ));
          break;
      }
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setStats({
        nodes: rawNodes.length,
        edges: rawEdges.length,
        depth: maxDepth
      });
      
    } catch (err: any) {
      setError(`خطا در پردازش کد: ${err.message}`);
      console.error('Parsing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [code, language, layoutMode, compactMode, theme.name, setNodes, setEdges]);

  useEffect(() => {
    if (!code.trim()) return;
    
    const timer = setTimeout(() => {
      processGraph();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [code, language, processGraph]);

  const handleLanguageChange = (newLanguage: 'js' | 'csharp') => {
    setLanguage(newLanguage);
    setCode(newLanguage === 'js' ? sampleJavaScriptCode : sampleCSharpCode);
    setError(null);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setFullscreen(false);
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50 p-4' : 'gap-6 min-h-[800px]'}`}>
      {/* Control Bar */}
      <div className={`rounded-xl border mb-4 ${theme.card} ${theme.border} ${fullscreen ? 'p-3' : 'p-6'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`${fullscreen ? 'text-xl' : 'text-2xl'} font-bold ${theme.text}`}>
              Visualizer Graph
            </h1>
            <p className={`mt-1 ${fullscreen ? 'text-xs' : 'text-sm'} ${theme.textMuted}`}>
              تجسم کدهای {language === 'js' ? 'JavaScript' : 'C#'} به صورت گراف تعاملی
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Language Selector */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => handleLanguageChange('js')}
                className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                  language === 'js' 
                    ? `${theme.card} shadow-sm ${theme.accent}` 
                    : `${theme.textMuted} hover:${theme.text}`
                }`}
              >
                JS
              </button>
              <button
                onClick={() => handleLanguageChange('csharp')}
                className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                  language === 'csharp' 
                    ? `${theme.card} shadow-sm ${theme.accent}` 
                    : `${theme.textMuted} hover:${theme.text}`
                }`}
              >
                C#
              </button>
            </div>
            
            {/* Layout Controls */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setLayoutMode('hierarchical')}
                className={`p-1.5 rounded-md transition-all ${
                  layoutMode === 'hierarchical' 
                    ? `${theme.card} ${theme.accent}` 
                    : theme.textMuted
                }`}
                title="Hierarchical Layout"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayoutMode('tree')}
                className={`p-1.5 rounded-md transition-all ${
                  layoutMode === 'tree' 
                    ? `${theme.card} ${theme.accent}` 
                    : theme.textMuted
                }`}
                title="Tree Layout"
              >
                <Cpu size={16} />
              </button>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={`p-1.5 rounded-md transition-all ${
                  compactMode 
                    ? `${theme.card} ${theme.accent}` 
                    : theme.textMuted
                }`}
                title="Compact Mode"
              >
                <Code size={16} />
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => setCode(language === 'js' ? sampleJavaScriptCode : sampleCSharpCode)}
              className={`p-2 rounded-lg border ${theme.border} ${theme.card} ${theme.text}`}
              title="Load Example"
            >
              مثال
            </button>
            
            <button
              onClick={processGraph}
              disabled={isProcessing}
              className={`p-2 rounded-lg ${theme.primary} flex items-center gap-2 disabled:opacity-50`}
              title="Refresh Graph"
            >
              <RefreshCw size={16} className={isProcessing ? 'animate-spin' : ''} />
              {!fullscreen && <span>بروزرسانی</span>}
            </button>
            
            <button
              onClick={handleFullscreen}
              className={`p-2 rounded-lg border ${theme.border} ${theme.card} ${theme.text}`}
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}>
            <div className={`text-xs ${theme.textMuted}`}>گره‌ها</div>
            <div className={`font-bold ${theme.text}`}>{stats.nodes}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}>
            <div className={`text-xs ${theme.textMuted}`}>یال‌ها</div>
            <div className={`font-bold ${theme.text}`}>{stats.edges}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}>
            <div className={`text-xs ${theme.textMuted}`}>عمق</div>
            <div className={`font-bold ${theme.text}`}>{stats.depth}</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}>
            <div className={`text-xs ${theme.textMuted}`}>وضعیت</div>
            <div className={`font-bold ${stats.nodes > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {isProcessing ? 'پردازش...' : stats.nodes > 0 ? 'آماده' : 'خالی'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col lg:flex-row gap-4 flex-1 ${fullscreen ? '' : 'min-h-[600px]'}`}>
        {/* Code Editor */}
        <div className={`${fullscreen ? 'lg:w-1/3' : 'lg:w-1/3'} rounded-xl border flex flex-col ${theme.card} ${theme.border}`}>
          <div className={`p-3 border-b flex justify-between items-center ${theme.border}`}>
            <h3 className={`font-bold ${theme.text}`}>
              <Code size={16} className="inline mr-2" />
              ویرایشگر کد
            </h3>
            <div className="flex items-center gap-2">
              <div className={`text-xs px-2 py-1 rounded ${theme.secondary}`}>
                {language === 'js' ? 'JS' : 'C#'}
              </div>
              <div className="text-xs text-gray-500">
                {code.split('\n').length} خط
              </div>
            </div>
          </div>

          {error && (
            <div className={`p-3 border-b bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`}>
              <div className="flex items-center gap-2">
                <div className="text-red-600 dark:text-red-400">⚠</div>
                <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
              </div>
            </div>
          )}

          <div className="relative flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              className={`w-full h-full p-4 font-mono text-sm resize-none outline-none bg-transparent ${theme.text} leading-relaxed`}
              spellCheck={false}
              placeholder={language === 'js' 
                ? "// کد JavaScript خود را اینجا قرار دهید..." 
                : "// کد C# خود را اینجا قرار دهید..."}
            />
            
            <div className={`absolute left-0 top-0 bottom-0 w-10 border-r ${theme.border} ${theme.bg} bg-opacity-50 overflow-hidden`}>
              {code.split('\n').map((_, i) => (
                <div 
                  key={i}
                  className={`text-right pr-3 text-xs ${theme.textMuted} leading-7`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <div className={`p-3 border-t ${theme.border} ${theme.bg} bg-opacity-50`}>
            <div className="text-xs flex items-center justify-between">
              <div className={theme.textMuted}>
                <span className="font-medium">نکته:</span> {language === 'js' 
                  ? 'کلاس‌ها، توابع، async/await' 
                  : 'کلاس‌ها، اینترفیس‌ها، async، LINQ'}
              </div>
              <div className={theme.textMuted}>
                خودکار: 500ms
              </div>
            </div>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className={`${fullscreen ? 'lg:w-2/3' : 'lg:w-2/3'} rounded-xl border overflow-hidden relative ${theme.bg} ${theme.border}`}>
          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-4 ${theme.text}`}>در حال ساخت گراف...</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4 opacity-50">📊</div>
                <h3 className={`text-xl font-bold mb-2 ${theme.text}`}>گرافی وجود ندارد</h3>
                <p className={`${theme.textMuted} max-w-md`}>
                  {error || 'کد خود را وارد کنید تا گراف آن نمایش داده شود'}
                </p>
              </div>
            </div>
          ) : null}
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ 
              padding: compactMode ? 0.1 : 0.2,
              duration: 400
            }}
            attributionPosition="bottom-left"
            minZoom={compactMode ? 0.2 : 0.1}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: {
                stroke: theme.accent,
                strokeWidth: compactMode ? 1.5 : 2,
              },
            }}
          >
            <Background 
              color={theme.name.includes('تاریک') ? '#4a5568' : '#e5e7eb'} 
              gap={compactMode ? 16 : 24} 
              size={1} 
              variant={BackgroundVariant.Dots}
            />
            <Controls 
              className={`${theme.card} backdrop-blur-md border ${theme.border} shadow-lg`}
              position="top-right"
              showInteractive={false}
            />
          </ReactFlow>
          
          {/* Graph Status */}
          <div className={`absolute bottom-3 left-3 px-3 py-2 rounded-lg backdrop-blur-sm ${theme.card} border ${theme.border} shadow-sm`}>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                nodes.length > 0 ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className={theme.text}>
                {nodes.length > 0 ? `${nodes.length} گره` : 'خالی'}
              </span>
              {nodes.length > 0 && (
                <span className={`text-xs ${theme.textMuted}`}>
                  • برای جابجایی کلیک و درگ کنید
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {!fullscreen && (
        <div className={`p-4 rounded-xl border ${theme.card} ${theme.border}`}>
          <h4 className={`font-bold mb-3 ${theme.text} flex items-center gap-2`}>
            <span>💡</span> نکات کاربردی
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg ${theme.bg}`}>
              <div className="font-medium mb-1 text-sm">کشیدن و رها کردن</div>
              <div className={`text-xs ${theme.textMuted}`}>
                گره‌ها را برای چیدمان بهتر جابجا کنید
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme.bg}`}>
              <div className="font-medium mb-1 text-sm">زوم</div>
              <div className={`text-xs ${theme.textMuted}`}>
                با چرخ اسکرول یا کنترل‌ها زوم کنید
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme.bg}`}>
              <div className="font-medium mb-1 text-sm">حالت فشرده</div>
              <div className={`text-xs ${theme.textMuted}`}>
                برای نمایش بیشتر گره‌ها فعال کنید
              </div>
            </div>
            <div className={`p-3 rounded-lg ${theme.bg}`}>
              <div className="font-medium mb-1 text-sm">تمام صفحه</div>
              <div className={`text-xs ${theme.textMuted}`}>
                برای تجربه بهتر از حالت تمام صفحه استفاده کنید
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}