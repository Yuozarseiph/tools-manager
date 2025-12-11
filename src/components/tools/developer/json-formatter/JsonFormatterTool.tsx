"use client";

import { useState, ChangeEvent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Trash2,
  Network,
  Code,
  UploadCloud,
  Download,
  Minimize,
  AlignLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomJsonNode from "./CustomJsonNode";
import { getLayoutedElements } from "@/utils/json-to-graph";

import {
  useJsonFormatterContent,
  type JsonFormatterToolContent,
} from "./json-formatter.content";

const nodeTypes = { customJsonNode: CustomJsonNode };

export default function JsonFormatterTool() {
  const theme = useThemeColors();
  const content: JsonFormatterToolContent = useJsonFormatterContent();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"code" | "graph">("code");
  const [copied, setCopied] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const processJson = (
    jsonString: string,
    mode: "prettify" | "minify" = "prettify"
  ) => {
    if (!jsonString.trim()) {
      setOutput("");
      setError(null);
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      setError(null);

      if (mode === "prettify") {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(parsed);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err: any) {
      setError(err.message);
      // خروجی را نگه می‌داریم تا کاربر بتواند اصلاح کند
      setNodes([]);
      setEdges([]);
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    processJson(val);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contentStr = event.target?.result as string;
      setInput(contentStr);
      processJson(contentStr);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setNodes([]);
    setEdges([]);
  };

  const getSize = (str: string) => {
    const bytes = new TextEncoder().encode(str).length;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[700px]">
      {/* ستون چپ: ورودی */}
      <div
        className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm ${theme.card} ${theme.border}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${theme.border} bg-gray-50/50 dark:bg-white/5`}
        >
          <div className="flex items-center gap-2">
            <label
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors bg-blue-600 text-white hover:bg-blue-700`}
            >
              <UploadCloud size={14} />
              <span>{content.ui.upload.button}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <span
              className={`text-[10px] font-mono opacity-60 px-2 ${theme.textMuted}`}
            >
              {input ? getSize(input) : ""}
            </span>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => processJson(input, "minify")}
              className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1 ${theme.textMuted}`}
              title={content.ui.toolbar.minify}
            >
              <Minimize size={14} />
            </button>
            <button
              onClick={() => processJson(input, "prettify")}
              className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1 ${theme.textMuted}`}
              title={content.ui.toolbar.prettify}
            >
              <AlignLeft size={14} />
            </button>
            <div className="w-px h-4 mx-1 bg-gray-300 dark:bg-gray-700 self-center" />
            <button
              onClick={handleClear}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
              title={content.ui.toolbar.clear}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={content.ui.input.placeholder}
          className={`flex-1 w-full p-4 resize-none focus:outline-none font-mono text-xs sm:text-sm bg-transparent ${theme.text}`}
          spellCheck={false}
        />

        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span className="truncate">
              {content.ui.error.prefix}
              {error}
            </span>
          </div>
        )}
      </div>

      {/* ستون راست: خروجی */}
      <div
        className={`flex flex-col rounded-2xl border overflow-hidden shadow-sm relative ${theme.card} ${theme.border}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${theme.border} ${theme.bg}`}
        >
          <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
              ${
                viewMode === "code"
                  ? "bg-white dark:bg-black shadow-sm text-blue-600"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Code size={14} /> {content.ui.tabs.code}
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
              ${
                viewMode === "graph"
                  ? "bg-white dark:bg-black shadow-sm text-purple-600"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Network size={14} /> {content.ui.tabs.graph}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono opacity-60 hidden sm:inline-block ${theme.textMuted}`}
            >
              {output ? getSize(output) : ""}
            </span>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg border transition-colors ${
                copied
                  ? "bg-green-50 text-green-600 border-green-200"
                  : `hover:bg-gray-100 dark:hover:bg-white/10 ${theme.border}`
              }`}
              title={content.ui.output.copyTitle}
            >
              {copied ? (
                <Check size={16} />
              ) : (
                <Copy size={16} className={theme.textMuted} />
              )}
            </button>
            <button
              onClick={handleDownload}
              className={`p-2 rounded-lg border hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors ${theme.border}`}
              title={content.ui.output.downloadTitle}
            >
              <Download size={16} className={theme.textMuted} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative" dir="ltr">
          {viewMode === "code" ? (
            <SyntaxHighlighter
              language="json"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                height: "100%",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
              wrapLines
              showLineNumbers
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                color: "#6e7681",
                textAlign: "right",
              }}
            >
              {output || content.ui.codeView.placeholder}
            </SyntaxHighlighter>
          ) : (
            <div className="h-full w-full bg-zinc-900">
              {nodes.length > 0 ? (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Background color="#444" gap={20} />
                  <Controls className="bg-white text-black border-none shadow-lg" />
                </ReactFlow>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                  <Network size={40} opacity={0.5} />
                  <p className="text-sm">{content.ui.graphView.emptyText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
