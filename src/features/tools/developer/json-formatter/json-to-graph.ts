// utils/json-to-graph.ts
import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

const nodeWidth = 250;
const nodeHeight = 100; // ارتفاع تقریبی هر نود

/**
 * تبدیل JSON تو در تو به نودها و یال‌های React Flow
 */
export const getLayoutedElements = (json: any) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  // تابع بازگشتی برای پیمایش JSON
  const traverse = (data: any, parentId: string | null = null, label: string = 'Root') => {
    const currentId = `${idCounter++}`;
    
    // ساخت محتوای نود (نمایش کلید: مقدار برای تایپ‌های ساده)
    let content = '';
    let isComplex = false; // آیا فرزندان پیچیده (آبجکت/آرایه) دارد؟

    if (typeof data === 'object' && data !== null) {
      // اگر آبجکت یا آرایه است
      const keys = Object.keys(data);
      // نمایش حداکثر 5 ویژگی اول برای جلوگیری از شلوغی
      const preview = keys.slice(0, 5).map(k => {
        const val = data[k];
        if (typeof val === 'object' && val !== null) return null; // فرزندان پیچیده را اینجا نمایش نمیدهیم
        return `${k}: ${JSON.stringify(val)}`;
      }).filter(Boolean).join('\n');
      
      content = preview || (Array.isArray(data) ? `Array [${data.length}]` : 'Object {}');
      isComplex = true;
    } else {
      content = String(data);
    }

    // اضافه کردن نود فعلی
    nodes.push({
      id: currentId,
      data: { label: label, content: content }, // دیتای سفارشی که تو نود نمایش میدیم
      position: { x: 0, y: 0 }, // موقعیت موقت (dagre درستش میکنه)
      type: 'customJsonNode', // نوع نود سفارشی که میسازیم
    });

    // اتصال به پدر
    if (parentId !== null) {
      edges.push({
        id: `e${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep', // خطوط نرم و 직각
        animated: true, // خط چین متحرک (خیلی جذاب میشه)
        style: { stroke: '#2563eb', strokeWidth: 2 },
      });
    }

    // ادامه پیمایش فرزندان
    if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // فقط برای فرزندان آبجکت/آرایه نود جدید میسازیم
          traverse(value, currentId, key);
        }
      });
    }
  };

  traverse(json);

  // --- چیدمان خودکار با Dagre ---
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'LR' }); // چیدمان چپ به راست (Left to Right)

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;

    // انتقال مختصات محاسبه شده به نود
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};
