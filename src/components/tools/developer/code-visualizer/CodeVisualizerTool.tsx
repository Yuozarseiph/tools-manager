// components/tools/developer/code-visualizer/CodeVisualizerTool.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Code,
  Cpu,
  LayoutGrid,
  Smartphone,
  Monitor,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { parseCodeToGraph } from "./utils/ast-parser";
import { parseCSharpToGraph } from "./utils/csharp-parser";
import { getLayoutedElements, getTreeLayout } from "./utils/graph-layout";
import CustomGraphNode from "./CustomGraphNode";

import {
  useCodeVisualizerContent,
  type CodeVisualizerToolContent,
} from "./code-visualizer.content";

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

type LayoutMode = "hierarchical" | "tree";

export default function CodeVisualizerTool() {
  const theme = useThemeColors();
  const content: CodeVisualizerToolContent = useCodeVisualizerContent();

  const [code, setCode] = useState(sampleJavaScriptCode);
  const [language, setLanguage] = useState<"js" | "csharp">("js");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    nodes: 0,
    edges: 0,
    depth: 0,
  });
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("hierarchical");
  const [compactMode, setCompactMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showGraph, setShowGraph] = useState(true);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({ custom: CustomGraphNode }), []);

  // تشخیص موبایل
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowEditor(true);
        setShowGraph(false);
        setCompactMode(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const processGraph = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let result;

      if (language === "js") {
        result = parseCodeToGraph(code);
      } else {
        result = parseCSharpToGraph(code);
      }

      const { nodes: rawNodes, edges: rawEdges } = result;

      if (rawNodes.length === 0) {
        setError(content.ui.graph.emptyDescription);
        setNodes([]);
        setEdges([]);
        setStats({ nodes: 0, edges: 0, depth: 0 });
        return;
      }

      const maxDepth = rawNodes.reduce((max: number, node: Node) => {
        const depth = (node.data?.depth as number) || 0;
        return Math.max(max, depth);
      }, 0);

      let layoutedNodes, layoutedEdges;
      const isDark = theme.name.includes("تاریک");

      switch (layoutMode) {
        case "tree":
          ({ nodes: layoutedNodes, edges: layoutedEdges } = getTreeLayout(
            rawNodes,
            rawEdges,
            undefined,
            isDark ? "dark" : "light",
            compactMode || isMobile
          ));
          break;
        case "hierarchical":
        default:
          ({ nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            rawNodes,
            rawEdges,
            {
              theme: isDark ? "dark" : "light",
              direction: "TB",
              compactMode: compactMode || isMobile,
            }
          ));
          break;
      }

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setStats({
        nodes: rawNodes.length,
        edges: rawEdges.length,
        depth: maxDepth,
      });
    } catch (err: any) {
      setError(err?.message || "");
      console.error("Parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [
    code,
    language,
    layoutMode,
    compactMode,
    theme.name,
    isMobile,
    setNodes,
    setEdges,
    content.ui.graph.emptyDescription,
  ]);

  useEffect(() => {
    if (!code.trim()) return;

    const timer = setTimeout(() => {
      processGraph();
    }, 500);

    return () => clearTimeout(timer);
  }, [code, language, processGraph]);

  const handleLanguageChange = (newLanguage: "js" | "csharp") => {
    setLanguage(newLanguage);
    setCode(newLanguage === "js" ? sampleJavaScriptCode : sampleCSharpCode);
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

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleView = () => {
    if (isMobile) {
      if (showEditor && !showGraph) {
        setShowEditor(false);
        setShowGraph(true);
      } else if (!showEditor && showGraph) {
        setShowEditor(true);
        setShowGraph(false);
      } else {
        setShowEditor(true);
        setShowGraph(true);
      }
    }
  };

  const subtitle =
    language === "js"
      ? content.ui.header.subtitleJs
      : content.ui.header.subtitleCsharp;

  const statusLabelDesktop = isProcessing
    ? content.ui.stats.statusProcessing
    : stats.nodes > 0
    ? content.ui.stats.statusReady
    : content.ui.stats.statusEmpty;

  const statusLabelMobile = isProcessing
    ? content.ui.stats.statusProcessing
    : stats.nodes > 0
    ? `${content.ui.stats.summaryPrefix}${stats.nodes} ${content.ui.stats.summaryNodesSuffix}، ${stats.edges} ${content.ui.stats.summaryEdgesSuffix}`
    : content.ui.stats.statusPromptMobile;

  return (
    <div
      className={`flex flex-col ${
        fullscreen
          ? "fixed inset-0 z-50 p-4"
          : "gap-4 md:gap-6 min-h-[calc(100vh-120px)]"
      }`}
    >
      {/* نوار کنترل بالا */}
      <div
        className={`rounded-xl border mb-2 md:mb-4 ${theme.card} ${
          theme.border
        } ${fullscreen ? "p-2 md:p-3" : "p-3 md:p-6"}`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div className="w-full md:w-auto">
            <div className="flex justify-between items-center md:block">
              <h1
                className={`${
                  fullscreen ? "text-lg md:text-xl" : "text-lg md:text-2xl"
                } font-bold ${theme.text}`}
              >
                {content.ui.header.title}
              </h1>
              {isMobile && (
                <button
                  onClick={toggleView}
                  className={`md:hidden p-1.5 rounded-lg ${
                    showEditor && !showGraph
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : !showEditor && showGraph
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {showEditor && !showGraph ? (
                    <Smartphone size={16} />
                  ) : !showEditor && showGraph ? (
                    <Monitor size={16} />
                  ) : (
                    <Code size={16} />
                  )}
                </button>
              )}
            </div>
            <p
              className={`mt-1 ${
                fullscreen ? "text-xs" : "text-xs md:text-sm"
              } ${theme.textMuted}`}
            >
              {subtitle}
            </p>
          </div>

          {/* Controls Container */}
          <div className="w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Language + Layout */}
              <div className="flex flex-wrap gap-2">
                {/* Language Selector */}
                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    onClick={() => handleLanguageChange("js")}
                    className={`px-2 md:px-3 py-1.5 rounded-md transition-all text-xs md:text-sm ${
                      language === "js"
                        ? `${theme.card} shadow-sm ${theme.accent}`
                        : `${theme.textMuted} hover:${theme.text}`
                    }`}
                  >
                    {content.ui.languageToggle.js}
                  </button>
                  <button
                    onClick={() => handleLanguageChange("csharp")}
                    className={`px-2 md:px-3 py-1.5 rounded-md transition-all text-xs md:text-sm ${
                      language === "csharp"
                        ? `${theme.card} shadow-sm ${theme.accent}`
                        : `${theme.textMuted} hover:${theme.text}`
                    }`}
                  >
                    {content.ui.languageToggle.csharp}
                  </button>
                </div>

                {/* Layout Controls */}
                {(showGraph || !isMobile) && (
                  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                      onClick={() => setLayoutMode("hierarchical")}
                      className={`p-1 md:p-1.5 rounded-md transition-all ${
                        layoutMode === "hierarchical"
                          ? `${theme.card} ${theme.accent}`
                          : theme.textMuted
                      }`}
                      title={content.ui.layout.hierarchical}
                    >
                      <LayoutGrid size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => setLayoutMode("tree")}
                      className={`p-1 md:p-1.5 rounded-md transition-all ${
                        layoutMode === "tree"
                          ? `${theme.card} ${theme.accent}`
                          : theme.textMuted
                      }`}
                      title={content.ui.layout.tree}
                    >
                      <Cpu size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => setCompactMode(!compactMode)}
                      className={`p-1 md:p-1.5 rounded-md transition-all ${
                        compactMode
                          ? `${theme.card} ${theme.accent}`
                          : theme.textMuted
                      }`}
                      title={content.ui.layout.compact}
                    >
                      <Code size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCode(
                      language === "js"
                        ? sampleJavaScriptCode
                        : sampleCSharpCode
                    )
                  }
                  className={`p-1.5 md:p-2 rounded-lg border ${theme.border} ${theme.card} ${theme.text} text-xs md:text-sm`}
                  title={content.ui.actions.loadExample}
                >
                  {content.ui.actions.loadExample}
                </button>

                <button
                  onClick={processGraph}
                  disabled={isProcessing}
                  className={`p-1.5 md:p-2 rounded-lg ${theme.primary} flex items-center gap-1 md:gap-2 disabled:opacity-50 text-xs md:text-sm`}
                  title={content.ui.actions.refresh}
                >
                  <RefreshCw
                    size={14}
                    className={`md:w-4 md:h-4 ${
                      isProcessing ? "animate-spin" : ""
                    }`}
                  />
                  {!fullscreen && !isMobile && (
                    <span>{content.ui.actions.refresh}</span>
                  )}
                </button>

                <button
                  onClick={handleFullscreen}
                  className={`p-1.5 md:p-2 rounded-lg border ${theme.border} ${theme.card} ${theme.text}`}
                  title={
                    fullscreen
                      ? content.ui.actions.exitFullscreen
                      : content.ui.actions.fullscreen
                  }
                >
                  {fullscreen ? (
                    <Minimize2 size={14} className="md:w-4 md:h-4" />
                  ) : (
                    <Maximize2 size={14} className="md:w-4 md:h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={`mt-3 md:mt-4 grid ${
            isMobile ? "grid-cols-2" : "grid-cols-4"
          } gap-2`}
        >
          <div
            className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}
          >
            <div className={`text-xs ${theme.textMuted}`}>
              {content.ui.stats.nodes}
            </div>
            <div className={`font-bold ${theme.text} text-sm md:text-base`}>
              {stats.nodes}
            </div>
          </div>
          <div
            className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}
          >
            <div className={`text-xs ${theme.textMuted}`}>
              {content.ui.stats.edges}
            </div>
            <div className={`font-bold ${theme.text} text-sm md:text-base`}>
              {stats.edges}
            </div>
          </div>
          {!isMobile && (
            <>
              <div
                className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}
              >
                <div className={`text-xs ${theme.textMuted}`}>
                  {content.ui.stats.depth}
                </div>
                <div className={`font-bold ${theme.text}`}>{stats.depth}</div>
              </div>
              <div
                className={`text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}
              >
                <div className={`text-xs ${theme.textMuted}`}>
                  {content.ui.stats.status}
                </div>
                <div
                  className={`font-bold ${
                    stats.nodes > 0 ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {statusLabelDesktop}
                </div>
              </div>
            </>
          )}
          {isMobile && (
            <div
              className={`col-span-2 text-center p-2 rounded-lg ${theme.bg} bg-opacity-50`}
            >
              <div className={`text-xs ${theme.textMuted}`}>
                {content.ui.stats.status}
              </div>
              <div
                className={`font-bold text-sm ${
                  stats.nodes > 0 ? "text-green-600" : "text-gray-500"
                }`}
              >
                {statusLabelMobile}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col lg:flex-row gap-3 md:gap-4 flex-1 ${
          fullscreen ? "" : "min-h-[500px] md:min-h-[600px]"
        }`}
      >
        {/* Code Editor */}
        {(showEditor || !isMobile) && (
          <div
            className={`${
              isMobile ? "w-full" : fullscreen ? "lg:w-1/3" : "lg:w-1/3"
            } ${
              !showEditor && isMobile ? "hidden" : ""
            } rounded-xl border flex flex-col ${theme.card} ${theme.border}`}
          >
            <div
              className={`p-2 md:p-3 border-b flex justify-between items-center ${theme.border}`}
            >
              <h3 className={`font-bold ${theme.text} text-sm md:text-base`}>
                <Code size={14} className="inline mr-1 md:mr-2" />{" "}
                {content.ui.editor.title}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded ${theme.secondary}`}
                >
                  {language === "js"
                    ? content.ui.editor.modeBadgeJs
                    : content.ui.editor.modeBadgeCsharp}
                </div>
                <div className="text-xs text-gray-500">
                  {code.split("\n").length} {content.ui.editor.linesSuffix}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2 md:p-3 border-b bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <div className="text-red-600 dark:text-red-400 text-xs">
                    ⚠
                  </div>
                  <div className="text-xs md:text-sm text-red-700 dark:text-red-300 line-clamp-2">
                    {error.length > 80 ? `${error.substring(0, 77)}...` : error}
                  </div>
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
                className={`w-full h-full p-3 md:p-4 font-mono text-xs md:text-sm resize-none outline-none bg-transparent ${theme.text} leading-relaxed`}
                spellCheck={false}
                placeholder={
                  language === "js"
                    ? content.ui.editor.placeholderJs
                    : content.ui.editor.placeholderCsharp
                }
                rows={isMobile ? 10 : undefined}
              />

              <div
                className={`absolute left-0 top-0 bottom-0 w-8 md:w-10 border-r ${theme.border} ${theme.bg} bg-opacity-50 overflow-hidden`}
              >
                {code.split("\n").map((_, i) => (
                  <div
                    key={i}
                    className={`text-right pr-2 md:pr-3 text-xs ${theme.textMuted} leading-6 md:leading-7`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-2 md:p-3 border-t ${theme.border} ${theme.bg} bg-opacity-50`}
            >
              <div className="text-xs flex items-center justify-between">
                <div className={theme.textMuted}>
                  <span className="font-medium">
                    {content.ui.editor.hintTitle}
                  </span>{" "}
                  {language === "js"
                    ? content.ui.editor.hintJs
                    : content.ui.editor.hintCsharp}
                </div>
                <div className={theme.textMuted}>
                  {isMobile
                    ? content.ui.editor.debounceMobile
                    : content.ui.editor.debounceDesktop}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graph Visualization */}
        {(showGraph || !isMobile) && (
          <div
            className={`${
              isMobile ? "w-full" : fullscreen ? "lg:w-2/3" : "lg:w-2/3"
            } ${
              !showGraph && isMobile ? "hidden" : ""
            } rounded-xl border overflow-hidden relative ${theme.bg} ${
              theme.border
            }`}
          >
            {isProcessing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 md:h-12 w-8 md:w-12 border-b-2 border-blue-600 mx-auto" />
                  <p
                    className={`mt-2 md:mt-4 ${theme.text} text-sm md:text-base`}
                  >
                    {content.ui.graph.building}
                  </p>
                </div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="text-3xl md:text-4xl mb-2 md:mb-4 opacity-50">
                    📊
                  </div>
                  <h3
                    className={`text-lg md:text-xl font-bold mb-2 ${theme.text}`}
                  >
                    {isMobile
                      ? content.ui.graph.emptyTitleMobile
                      : content.ui.graph.emptyTitleDesktop}
                  </h3>
                  <p className={`${theme.textMuted} text-sm max-w-md`}>
                    {error || content.ui.graph.emptyDescription}
                  </p>
                  {isMobile && !showEditor && (
                    <button
                      onClick={() => {
                        setShowEditor(true);
                        setShowGraph(false);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg ${theme.primary} text-sm`}
                    >
                      {content.ui.graph.backToEditorMobile}
                    </button>
                  )}
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
                padding: compactMode || isMobile ? 0.05 : 0.2,
                duration: 300,
              }}
              attributionPosition="bottom-left"
              minZoom={isMobile ? 0.3 : compactMode ? 0.2 : 0.1}
              maxZoom={isMobile ? 1.5 : 2}
              defaultEdgeOptions={{
                type: "smoothstep",
                animated: true,
                style: {
                  stroke: theme.accent,
                  strokeWidth: compactMode || isMobile ? 1 : 2,
                },
              }}
            >
              <Background
                color={theme.name.includes("تاریک") ? "#4a5568" : "#e5e7eb"}
                gap={compactMode || isMobile ? 12 : 24}
                size={0.5}
                variant={BackgroundVariant.Dots}
              />
              <Controls
                className={`${theme.card} backdrop-blur-md border ${theme.border} shadow-lg`}
                position={isMobile ? "bottom-right" : "top-right"}
                showInteractive={false}
              />
            </ReactFlow>

            {/* Graph Status */}
            <div
              className={`absolute ${
                isMobile ? "top-2 left-2" : "bottom-3 left-3"
              } px-2 md:px-3 py-1 md:py-2 rounded-lg backdrop-blur-sm ${
                theme.card
              } border ${theme.border} shadow-sm`}
            >
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <div
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                    nodes.length > 0 ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span className={theme.text}>
                  {nodes.length > 0
                    ? `${content.ui.graph.statusWithNodesPrefix}${nodes.length} ${content.ui.graph.statusNodesSuffix}`
                    : content.ui.graph.statusEmpty}
                </span>
                {!isMobile && nodes.length > 0 && (
                  <span
                    className={`text-xs ${theme.textMuted} hidden md:inline`}
                  >
                    {content.ui.graph.dragHint}
                  </span>
                )}
              </div>
            </div>

            {/* View Toggle Button برای موبایل */}
            {isMobile && showGraph && (
              <button
                onClick={() => {
                  setShowEditor(true);
                  setShowGraph(false);
                }}
                className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-sm ${theme.card} border ${theme.border} shadow-sm`}
              >
                <Smartphone size={14} />
              </button>
            )}
          </div>
        )}

        {/* Mobile View Toggle Bar */}
        {isMobile && showEditor && showGraph && (
          <div className="md:hidden flex justify-center gap-4">
            <button
              onClick={() => {
                setShowEditor(true);
                setShowGraph(false);
              }}
              className={`px-4 py-2 rounded-lg ${
                showEditor && !showGraph ? theme.primary : theme.secondary
              }`}
            >
              {content.ui.mobile.toggleEditor}
            </button>
            <button
              onClick={() => {
                setShowEditor(false);
                setShowGraph(true);
              }}
              className={`px-4 py-2 rounded-lg ${
                !showEditor && showGraph ? theme.primary : theme.secondary
              }`}
            >
              {content.ui.mobile.toggleGraph}
            </button>
          </div>
        )}
      </div>

      {/* Tips Section - دسکتاپ */}
      {!fullscreen && !isMobile && (
        <div className={`p-4 rounded-xl border ${theme.card} ${theme.border}`}>
          <h4
            className={`font-bold mb-3 ${theme.text} flex items-center gap-2`}
          >
            {content.ui.tips.title}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {content.ui.tips.items.map((tip, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${theme.bg}`}>
                <div className={`text-xs ${theme.textMuted}`}>{tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isMobile && !fullscreen && (
        <div
          className={`md:hidden p-3 rounded-xl border ${theme.card} ${theme.border} text-center`}
        >
          <p className={`text-xs ${theme.textMuted}`}>
            {content.ui.mobile.betterOnDesktop}
          </p>
        </div>
      )}
    </div>
  );
}
