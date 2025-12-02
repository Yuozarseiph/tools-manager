'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react'; // Node رو ایمپورت کن
import { useThemeColors } from '@/hooks/useThemeColors';
import { 
  GitGraph, 
  ArrowRightFromLine, 
  Split, 
  RefreshCcw, 
  Variable, 
  PlayCircle,
  Clock,
  ShieldAlert,
  Box, 
  FileCode,
  Layers, 
  List,   
  Braces  
} from 'lucide-react';

// تعریف اینترفیس دیتای نود ما
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string;
  depth?: number;
}

// اکستند کردن NodeProps برای دیتای خاص ما
type CustomNodeProps = NodeProps<Node<CustomNodeData>>;

const CustomGraphNode = ({ data }: CustomNodeProps) => {
  const theme = useThemeColors();
  
  // کست کردن دیتا به اینترفیس خودمون
  const { label, nodeType, depth = 0 } = data as CustomNodeData;
  const type = nodeType;

  let borderColor = theme.border;
  let bgColor = theme.card;
  let textColor = theme.text;
  let Icon = Box;
  let iconColor = 'text-gray-500';

  // --- Logic for Styling based on Node Type ---
  switch (type) {
    case 'function':
    case 'method':
      borderColor = 'border-blue-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-blue-950/40' : 'bg-blue-50';
      Icon = PlayCircle;
      iconColor = 'text-blue-500';
      break;

    case 'class':
      borderColor = 'border-indigo-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-indigo-950/40' : 'bg-indigo-50';
      Icon = Braces;
      iconColor = 'text-indigo-500';
      break;

    case 'namespace':
      borderColor = 'border-slate-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-slate-900/80' : 'bg-slate-100';
      Icon = Box;
      iconColor = 'text-slate-500';
      break;

    case 'interface':
      borderColor = 'border-teal-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-teal-950/40' : 'bg-teal-50';
      Icon = Layers;
      iconColor = 'text-teal-500';
      break;

    case 'enum':
    case 'struct':
      borderColor = 'border-cyan-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-cyan-950/40' : 'bg-cyan-50';
      Icon = List;
      iconColor = 'text-cyan-500';
      break;

    case 'return':
      borderColor = 'border-rose-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-rose-950/40' : 'bg-rose-50';
      Icon = ArrowRightFromLine;
      iconColor = 'text-rose-500';
      break;

    case 'if':
    case 'switch':
      borderColor = 'border-amber-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-amber-950/40' : 'bg-amber-50';
      Icon = Split;
      iconColor = 'text-amber-500';
      break;

    case 'loop':
      borderColor = 'border-purple-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-purple-950/40' : 'bg-purple-50';
      Icon = RefreshCcw;
      iconColor = 'text-purple-500';
      break;

    case 'var':
      borderColor = 'border-emerald-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-emerald-950/40' : 'bg-emerald-50';
      Icon = Variable;
      iconColor = 'text-emerald-500';
      break;

    case 'async':
      borderColor = 'border-violet-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-violet-950/40' : 'bg-violet-50';
      Icon = Clock;
      iconColor = 'text-violet-500';
      break;
    
    case 'error': // Try/Catch
      borderColor = 'border-orange-500';
      bgColor = theme.name.includes('تاریک') ? 'bg-orange-950/40' : 'bg-orange-50';
      Icon = ShieldAlert;
      iconColor = 'text-orange-500';
      break;

    case 'code-block':
      borderColor = theme.border; 
      bgColor = theme.card;       
      Icon = FileCode;
      iconColor = theme.textMuted.split(' ')[0];
      break;
      
    default:
      borderColor = theme.border;
      bgColor = theme.card;
      Icon = GitGraph;
      iconColor = theme.textMuted.split(' ')[0];
      break;
  }

  const isCode = type === 'code-block';

  return (
    <div 
      className={`
        min-w-[200px] max-w-[350px] rounded-xl border-2 px-3 py-2.5 shadow-sm transition-all duration-300
        ${textColor} ${borderColor} ${bgColor}
        hover:shadow-md hover:scale-[1.01] group relative
      `}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`!w-2.5 !h-2.5 !bg-gray-400/40 !border-0 transition-all group-hover:!bg-gray-500`} 
      />
      
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-1.5 rounded-lg bg-black/5 dark:bg-white/10 flex-shrink-0 ${iconColor}`}>
          <Icon size={16} strokeWidth={2} />
        </div>
        
        <div className="flex flex-col overflow-hidden min-w-0 w-full">
          {!isCode && (
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 truncate">
                {type}
              </span>
              {depth > 0 && (
                <span className="text-[8px] px-1 py-px rounded bg-black/5 dark:bg-white/10 opacity-40">
                  L{depth}
                </span>
              )}
            </div>
          )}
          
          <span 
            className={`
              font-mono text-xs break-words leading-relaxed
              ${isCode ? 'whitespace-pre-wrap text-left opacity-80' : 'font-bold text-sm'}
            `}
            title={label}
          >
            {label}
          </span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`!w-2.5 !h-2.5 !bg-gray-400/40 !border-0 transition-all group-hover:!bg-gray-500`} 
      />
    </div>
  );
};

export default memo(CustomGraphNode);
