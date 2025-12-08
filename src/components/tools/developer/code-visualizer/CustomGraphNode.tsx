'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
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
  Braces,
  Database,
  Cpu,
  Zap,
  Hash,
  Lock,
  Key,
  Cloud,
  Settings,
  Package,
  Type,
  FileText,
  Terminal,
  GitBranch,
  GitMerge,
  GitPullRequest,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Folder,
  Award,
  Sparkles,
  CloudLightning,
  EyeOff
} from 'lucide-react';

interface CustomNodeData extends Record<string, unknown> {
  label: string;
  nodeType: string;
  depth?: number;
  modifiers?: string[];
  returnType?: string;
  parameters?: string[];
  accessLevel?: string;
  isStatic?: boolean;
  isAsync?: boolean;
  isAbstract?: boolean;
  isVirtual?: boolean;
  isOverride?: boolean;
  isSealed?: boolean;
  isPartial?: boolean;
  isProperty?: boolean;
  isConstructor?: boolean;
  isField?: boolean;
  isEvent?: boolean;
  isDelegate?: boolean;
  isGeneric?: boolean;
  lineNumber?: number;
}

type CustomNodeProps = NodeProps<Node<CustomNodeData>>;

const getIconForType = (type: string, data: CustomNodeData) => {
  if (type === 'namespace') return Box;
  if (type === 'class') return Braces;
  if (type === 'interface') return Layers;
  if (type === 'struct') return Package;
  if (type === 'enum') return Hash;
  if (type === 'delegate') return GitBranch;
  if (type === 'event') return Zap;
  if (type === 'property' || data.isProperty) return Key;
  if (type === 'field' || data.isField) return Database;
  if (type === 'constructor' || data.isConstructor) return Settings;
  if (type === 'using') return Cloud;
  if (type === 'lock') return Lock;
  if (type === 'unsafe') return ShieldAlert;
  if (type === 'checked' || type === 'unchecked') return CheckCircle;
  if (type === 'fixed') return Cpu;
  if (type === 'region') return Folder;
  if (type === 'attribute') return Award;
  if (type === 'generic') return Type;
  
  if (type === 'function' || type === 'method') {
    if (data.isAsync) return Clock;
    if (data.isVirtual) return GitMerge;
    if (data.isOverride) return GitPullRequest;
    if (data.isAbstract) return EyeOff;
    return PlayCircle;
  }
  
  if (type === 'return') return ArrowRightFromLine;
  if (type === 'if' || type === 'else' || type === 'elseif' || type === 'switch') return Split;
  if (type === 'case') return ChevronRight;
  if (type === 'loop') return RefreshCcw;
  if (type === 'var' || type === 'variable') return Variable;
  if (type === 'async') return Clock;
  if (type === 'await') return CloudLightning;
  if (type === 'yield') return Sparkles;
  if (type === 'try' || type === 'catch' || type === 'finally' || type === 'error') return ShieldAlert;
  if (type === 'throw') return AlertCircle;
  if (type === 'comment') return FileText;
  if (type === 'expression') return Terminal;
  if (type === 'code-block') return FileCode;
  
  return GitGraph;
};

const getNodeStyle = (type: string, data: CustomNodeData, theme: any) => {
  const isDark = theme.name.includes('تاریک');
  
  // Border styles
  const getBorder = () => {
    const baseBorders: Record<string, string> = {
      'namespace': isDark ? 'border-slate-700' : 'border-slate-300',
      'class': isDark ? 'border-blue-600' : 'border-blue-400',
      'interface': isDark ? 'border-teal-600' : 'border-teal-400',
      'struct': isDark ? 'border-cyan-600' : 'border-cyan-400',
      'enum': isDark ? 'border-emerald-600' : 'border-emerald-400',
      'delegate': isDark ? 'border-violet-600' : 'border-violet-400',
      'event': isDark ? 'border-pink-600' : 'border-pink-400',
      'property': isDark ? 'border-amber-600' : 'border-amber-400',
      'field': isDark ? 'border-blue-500' : 'border-blue-300',
      'constructor': isDark ? 'border-orange-600' : 'border-orange-400',
      'method': isDark ? 'border-blue-500' : 'border-blue-400',
      'function': isDark ? 'border-blue-500' : 'border-blue-400',
      'return': isDark ? 'border-rose-600' : 'border-rose-400',
      'if': isDark ? 'border-amber-600' : 'border-amber-400',
      'else': isDark ? 'border-amber-500' : 'border-amber-300',
      'elseif': isDark ? 'border-amber-500' : 'border-amber-300',
      'switch': isDark ? 'border-orange-600' : 'border-orange-400',
      'case': isDark ? 'border-yellow-600' : 'border-yellow-400',
      'loop': isDark ? 'border-purple-600' : 'border-purple-400',
      'try': isDark ? 'border-red-600' : 'border-red-400',
      'catch': isDark ? 'border-red-500' : 'border-red-300',
      'finally': isDark ? 'border-red-500' : 'border-red-300',
      'throw': isDark ? 'border-red-700' : 'border-red-500',
      'await': isDark ? 'border-indigo-600' : 'border-indigo-400',
      'yield': isDark ? 'border-pink-600' : 'border-pink-400',
      'code-block': isDark ? 'border-gray-700' : 'border-gray-300',
    };
    
    let border = baseBorders[type] || (isDark ? 'border-gray-700' : 'border-gray-300');
    
    // Add modifiers
    if (data.isAbstract) border += ' border-dashed';
    if (data.isVirtual) border += ' border-dotted';
    
    return border;
  };

  // Background styles
  const getBackground = () => {
    const baseBackgrounds: Record<string, string> = {
      'namespace': isDark ? 'bg-slate-900/30' : 'bg-slate-50',
      'class': isDark ? 'bg-blue-900/20' : 'bg-blue-50/70',
      'interface': isDark ? 'bg-teal-900/20' : 'bg-teal-50/70',
      'struct': isDark ? 'bg-cyan-900/20' : 'bg-cyan-50/70',
      'enum': isDark ? 'bg-emerald-900/20' : 'bg-emerald-50/70',
      'method': isDark ? 'bg-blue-900/20' : 'bg-blue-50/70',
      'function': isDark ? 'bg-blue-900/20' : 'bg-blue-50/70',
      'return': isDark ? 'bg-rose-900/20' : 'bg-rose-50/70',
      'if': isDark ? 'bg-amber-900/20' : 'bg-amber-50/70',
      'switch': isDark ? 'bg-orange-900/20' : 'bg-orange-50/70',
      'loop': isDark ? 'bg-purple-900/20' : 'bg-purple-50/70',
      'try': isDark ? 'bg-red-900/20' : 'bg-red-50/70',
      'catch': isDark ? 'bg-red-900/20' : 'bg-red-50/70',
      'finally': isDark ? 'bg-red-900/20' : 'bg-red-50/70',
      'code-block': isDark ? 'bg-gray-900/30' : 'bg-gray-50',
    };
    
    return baseBackgrounds[type] || (isDark ? 'bg-gray-900/20' : 'bg-white/80');
  };

  // Icon color
  const getIconColor = () => {
    const iconColors: Record<string, string> = {
      'namespace': isDark ? 'text-slate-400' : 'text-slate-600',
      'class': isDark ? 'text-blue-400' : 'text-blue-600',
      'interface': isDark ? 'text-teal-400' : 'text-teal-600',
      'struct': isDark ? 'text-cyan-400' : 'text-cyan-600',
      'enum': isDark ? 'text-emerald-400' : 'text-emerald-600',
      'method': isDark ? 'text-blue-400' : 'text-blue-600',
      'function': isDark ? 'text-blue-400' : 'text-blue-600',
      'return': isDark ? 'text-rose-400' : 'text-rose-600',
      'if': isDark ? 'text-amber-400' : 'text-amber-600',
      'loop': isDark ? 'text-purple-400' : 'text-purple-600',
    };
    
    return iconColors[type] || (isDark ? 'text-gray-400' : 'text-gray-600');
  };

  return {
    border: getBorder(),
    bg: getBackground(),
    icon: getIconColor(),
  };
};

const CustomGraphNode = ({ data, selected }: CustomNodeProps) => {
  const theme = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { 
    label, 
    nodeType, 
    depth = 0, 
    returnType, 
    parameters = [],
    accessLevel,
    lineNumber 
  } = data as CustomNodeData;
  
  const type = nodeType;
  const styles = getNodeStyle(type, data, theme);
  const Icon = getIconForType(type, data);
  
  const isDark = theme.name.includes('تاریک');
  const isExpandable = ['class', 'interface', 'struct', 'namespace', 'method', 'function'].includes(type);
  
  const handleClasses = `
    !w-3 !h-3 !bg-white dark:!bg-gray-800 
    !border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}
    transition-all duration-200
    hover:!scale-125 hover:!border-blue-400
    ${selected ? '!border-blue-500 !bg-blue-50 dark:!bg-blue-900/30' : ''}
  `;

  return (
    <div 
      className={`
        min-w-[240px] max-w-[400px] rounded-lg border-2 px-4 py-3 
        shadow-sm transition-all duration-300 relative
        ${theme.text} ${styles.border} ${styles.bg}
        hover:shadow-md hover:border-opacity-80 group
        ${selected ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1' : ''}
        ${data.isAbstract ? 'opacity-90' : ''}
      `}
      style={{
        marginLeft: `${depth * 25}px`,
        marginTop: `${depth * 5}px`,
        minHeight: 'fit-content',
      }}
    >
      {/* Handles with better spacing */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className={handleClasses}
        style={{ top: -6 }}
      />
      
      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div className={`mt-0.5 p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/5'} ${styles.icon}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        
        {/* Content Container */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                isDark ? 'bg-white/10 text-white/80' : 'bg-black/5 text-gray-700'
              }`}>
                {type}
              </span>
              
              {/* Access Level Badge */}
              {accessLevel && (
                <span className={`text-xs px-2 py-1 rounded ${
                  isDark ? `bg-${accessLevel === 'public' ? 'green' : accessLevel === 'private' ? 'red' : 'blue'}-900/40 text-${accessLevel === 'public' ? 'green' : accessLevel === 'private' ? 'red' : 'blue'}-300` 
                  : `bg-${accessLevel === 'public' ? 'green' : accessLevel === 'private' ? 'red' : 'blue'}-100 text-${accessLevel === 'public' ? 'green' : accessLevel === 'private' ? 'red' : 'blue'}-800`
                }`}>
                  {accessLevel}
                </span>
              )}
              
              {/* Return Type */}
              {returnType && (
                <span className={`text-xs font-mono ${theme.textMuted} hidden sm:inline`}>
                  → {returnType}
                </span>
              )}
            </div>
            
            {/* Info Badges */}
            <div className="flex items-center gap-1">
              {depth > 0 && (
                <span className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 opacity-60">
                  L{depth}
                </span>
              )}
              {lineNumber && (
                <span className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 opacity-60">
                  #{lineNumber}
                </span>
              )}
            </div>
          </div>
          
          {/* Main Label */}
          <div className="mb-2">
            <span 
              className={`
                font-mono break-words leading-relaxed font-semibold
                ${type === 'code-block' ? 'text-sm' : 'text-base'}
                max-h-32 overflow-y-auto
              `}
              title={label}
            >
              {label.length > 150 ? `${label.substring(0, 147)}...` : label}
            </span>
          </div>
          
          {/* Parameters */}
          {parameters.length > 0 && (
            <div className="mt-2 mb-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${theme.textMuted}`}>Params:</span>
                <span className="text-xs text-gray-500">({parameters.length})</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {parameters.slice(0, 4).map((param, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded ${
                      isDark ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-600'
                    } font-mono`}
                  >
                    {param}
                  </span>
                ))}
                {parameters.length > 4 && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDark ? 'bg-white/10 text-gray-400' : 'bg-black/5 text-gray-500'
                  }`}>
                    +{parameters.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Expand/Collapse Button */}
        {isExpandable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`ml-2 p-1 rounded ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            } transition-colors`}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronRight 
              size={16} 
              className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
      </div>
      
      {/* Bottom Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={handleClasses}
        style={{ bottom: -6 }}
      />
      
      {/* Side Handles */}
      <Handle 
        type="source" 
        position={Position.Left} 
        className={`${handleClasses} opacity-0 group-hover:opacity-100`}
        style={{ left: -6 }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        className={`${handleClasses} opacity-0 group-hover:opacity-100`}
        style={{ right: -6 }}
      />
      
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
};

export default memo(CustomGraphNode);