// components/tools/CustomJsonNode.tsx
import { Handle, Position } from "reactflow";

export default function CustomJsonNode({ data }: any) {
  return (
    <div className="bg-slate-900 text-slate-100 border-2 border-blue-500 rounded-xl p-3 shadow-xl min-w-[200px] max-w-[300px] text-xs font-mono">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />

      <div className="bg-blue-600 text-white px-2 py-1 -mx-3 -mt-3 mb-2 rounded-t-lg font-bold truncate">
        {data.label}
      </div>

      <div className="whitespace-pre-wrap opacity-90 leading-relaxed">
        {data.content}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}
