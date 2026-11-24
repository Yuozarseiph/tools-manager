import { Node, Edge } from "@xyflow/react";

export type Direction = "LR" | "RL" | "TB" | "BT";

interface LayoutOptions {
  direction?: Direction;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  theme?: "light" | "dark";
  compactMode?: boolean;
}

interface TreeNodeData {
  depth?: number;
  [key: string]: any;
}

const defaultOptions: Required<LayoutOptions> = {
  direction: "TB",
  horizontalSpacing: 250,
  verticalSpacing: 150,
  theme: "light",
  compactMode: false,
};

export const getLayoutedElements = (
  nodes: Node<TreeNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node<TreeNodeData>[]; edges: Edge[] } => {
  const { direction, horizontalSpacing, verticalSpacing, theme, compactMode } =
    {
      ...defaultOptions,
      ...options,
    };

  // ایجاد کپی عمیق برای جلوگیری از تغییرات جانبی
  const layoutedNodes: Node<TreeNodeData>[] = nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
  }));

  const layoutedEdges: Edge[] = edges.map((edge) => ({ ...edge }));

  const adjustedHorizontalSpacing = compactMode
    ? horizontalSpacing * 0.7
    : horizontalSpacing;
  const adjustedVerticalSpacing = compactMode
    ? verticalSpacing * 0.7
    : verticalSpacing;

  const themeSpacing = theme === "dark" ? 30 : 20;
  const nodesByDepth: { [key: number]: Node<TreeNodeData>[] } = {};
  let maxDepth = 0;

  // گروه‌بندی نودها بر اساس عمق
  layoutedNodes.forEach((node) => {
    const depth = typeof node.data?.depth === "number" ? node.data.depth : 0;
    maxDepth = Math.max(maxDepth, depth);

    if (!nodesByDepth[depth]) {
      nodesByDepth[depth] = [];
    }
    nodesByDepth[depth].push(node);
  });

  // اعمال layout بر اساس جهت
  switch (direction) {
    case "LR": // چپ به راست
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const totalHeight = Math.max(
          nodesAtDepth.length * adjustedVerticalSpacing,
          adjustedVerticalSpacing
        );

        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x: depth * (adjustedHorizontalSpacing + themeSpacing),
            y:
              ((index - (nodesAtDepth.length - 1) / 2) * totalHeight) /
              Math.max(nodesAtDepth.length, 1),
          };
        });
      }
      break;

    case "RL": // راست به چپ
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const totalHeight = Math.max(
          nodesAtDepth.length * adjustedVerticalSpacing,
          adjustedVerticalSpacing
        );

        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x: (maxDepth - depth) * (adjustedHorizontalSpacing + themeSpacing),
            y:
              ((index - (nodesAtDepth.length - 1) / 2) * totalHeight) /
              Math.max(nodesAtDepth.length, 1),
          };
        });
      }
      break;

    case "BT": // پایین به بالا
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const totalWidth = Math.max(
          nodesAtDepth.length * adjustedHorizontalSpacing,
          adjustedHorizontalSpacing
        );

        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x:
              ((index - (nodesAtDepth.length - 1) / 2) * totalWidth) /
              Math.max(nodesAtDepth.length, 1),
            y: (maxDepth - depth) * (adjustedVerticalSpacing + themeSpacing),
          };
        });
      }
      break;

    case "TB": // بالا به پایین (پیش‌فرض)
    default:
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const nodeCount = nodesAtDepth.length;

        // محاسبه فاصله افقی
        const horizontalSpacingForLevel = Math.max(
          adjustedHorizontalSpacing,
          nodeCount * 20
        );

        nodesAtDepth.forEach((node, index) => {
          const horizontalOffset = depth * themeSpacing * 0.3;

          node.position = {
            x:
              (index - (nodeCount - 1) / 2) *
              (horizontalSpacingForLevel + horizontalOffset),
            y: depth * adjustedVerticalSpacing,
          };
        });
      }

      // جلوگیری از همپوشانی نودها (فقط برای TB)
      const minDistance = compactMode ? 100 : 120;

      for (let i = 0; i < layoutedNodes.length; i++) {
        for (let j = i + 1; j < layoutedNodes.length; j++) {
          const nodeA = layoutedNodes[i];
          const nodeB = layoutedNodes[j];

          const dx = Math.abs(nodeA.position.x - nodeB.position.x);
          const dy = Math.abs(nodeA.position.y - nodeB.position.y);

          // اگر نودها خیلی نزدیک باشند، آنها را از هم دور می‌کنیم
          if (dx < minDistance && dy < minDistance) {
            const separation = (minDistance - Math.min(dx, dy)) * 0.5;

            if (nodeA.position.x < nodeB.position.x) {
              nodeA.position.x -= separation;
              nodeB.position.x += separation;
            } else {
              nodeA.position.x += separation;
              nodeB.position.x -= separation;
            }

            if (nodeA.position.y < nodeB.position.y) {
              nodeA.position.y -= separation;
              nodeB.position.y += separation;
            } else {
              nodeA.position.y += separation;
              nodeB.position.y -= separation;
            }
          }
        }
      }

      // تنظیم موقعیت نودها بر اساس لبه‌های ورودی
      layoutedNodes.forEach((node) => {
        const incomingEdges = layoutedEdges.filter(
          (edge) => edge.target === node.id
        );

        if (incomingEdges.length > 0) {
          const sourceNodes = incomingEdges
            .map((edge) => layoutedNodes.find((n) => n.id === edge.source))
            .filter((n): n is Node<TreeNodeData> => n !== undefined);

          if (sourceNodes.length > 0) {
            const avgSourceY =
              sourceNodes.reduce((sum, n) => sum + n.position.y, 0) /
              sourceNodes.length;

            // اگر تفاوت موقعیت Y بیشتر از آستانه باشد، تنظیم می‌کنیم
            const threshold = adjustedVerticalSpacing * 0.5;
            if (Math.abs(node.position.y - avgSourceY) > threshold) {
              // میانگین وزنی برای حرکت نرم‌تر
              node.position.y = node.position.y * 0.7 + avgSourceY * 0.3;
            }
          }
        }
      });
      break;
  }

  // مرکز کردن و اضافه کردن padding
  const padding = compactMode ? 60 : 100;
  const nodesWithPositions = layoutedNodes.filter(
    (n) => n.position.x !== undefined && n.position.y !== undefined
  );

  if (nodesWithPositions.length > 0) {
    const allX = nodesWithPositions.map((node) => node.position.x);
    const allY = nodesWithPositions.map((node) => node.position.y);

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const width = maxX - minX;
    const height = maxY - minY;

    // محاسبه مرکز
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    // انتقال به مرکز و اضافه کردن padding
    layoutedNodes.forEach((node) => {
      node.position.x = node.position.x - centerX + padding;
      node.position.y = node.position.y - centerY + padding;
    });
  }

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export const getTreeLayout = (
  nodes: Node<TreeNodeData>[],
  edges: Edge[],
  rootNodeId?: string,
  theme: "light" | "dark" = "light",
  compactMode: boolean = false
): { nodes: Node<TreeNodeData>[]; edges: Edge[] } => {
  // ایجاد کپی
  const layoutedNodes: Node<TreeNodeData>[] = nodes.map((node) => ({
    ...node,
    data: { ...node.data },
    position: { ...node.position },
  }));

  const layoutedEdges: Edge[] = edges.map((edge) => ({ ...edge }));

  // پیدا کردن ریشه
  let rootNode = layoutedNodes[0];

  if (rootNodeId) {
    rootNode = layoutedNodes.find((node) => node.id === rootNodeId) || rootNode;
  } else {
    // اگر rootNodeId مشخص نشده، نود با کمترین عمق را پیدا می‌کنیم
    layoutedNodes.forEach((node) => {
      const currentDepth = node.data?.depth || 0;
      const rootDepth = rootNode.data?.depth || 0;

      if (currentDepth < rootDepth) {
        rootNode = node;
      }
    });
  }

  // ساختن ساختار درخت
  const children: { [key: string]: string[] } = {};
  const parents: { [key: string]: string } = {};
  const nodeLevels: { [key: string]: number } = {};

  // پر کردن روابط والد-فرزند
  layoutedEdges.forEach((edge) => {
    if (!children[edge.source]) {
      children[edge.source] = [];
    }
    children[edge.source].push(edge.target);
    parents[edge.target] = edge.source;
  });

  // محاسبه سطح هر نود با BFS
  const calculateLevels = (startNodeId: string, startLevel: number) => {
    const queue: Array<[string, number]> = [[startNodeId, startLevel]];

    while (queue.length > 0) {
      const [currentId, currentLevel] = queue.shift()!;
      nodeLevels[currentId] = currentLevel;

      // اضافه کردن فرزندان به صف
      (children[currentId] || []).forEach((childId) => {
        if (nodeLevels[childId] === undefined) {
          queue.push([childId, currentLevel + 1]);
        }
      });
    }
  };

  // محاسبه سطح برای تمام کامپوننت‌های متصل
  const visited = new Set<string>();

  const bfsFromNode = (startNodeId: string) => {
    if (visited.has(startNodeId)) return;

    const startLevel =
      layoutedNodes.find((n) => n.id === startNodeId)?.data?.depth || 0;
    calculateLevels(startNodeId, startLevel);

    // علامت‌گذاری نودهای بازدید شده
    Object.keys(nodeLevels).forEach((id) => visited.add(id));
  };

  // شروع از ریشه اصلی
  bfsFromNode(rootNode.id);

  // برای نودهای جدا شده (اگر وجود داشته باشند)
  layoutedNodes.forEach((node) => {
    if (!visited.has(node.id)) {
      bfsFromNode(node.id);
    }
  });

  // گروه‌بندی نودها بر اساس سطح
  const nodesByLevel: { [key: number]: Node<TreeNodeData>[] } = {};

  layoutedNodes.forEach((node) => {
    const level = nodeLevels[node.id] || 0;

    if (!nodesByLevel[level]) {
      nodesByLevel[level] = [];
    }
    nodesByLevel[level].push(node);
  });

  const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number), 0);

  // تنظیم فاصله‌ها
  const levelSpacing = compactMode ? 180 : 220;
  const nodeSpacing = compactMode ? 160 : 200;

  // محاسبه موقعیت هر نود
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = nodesByLevel[level] || [];

    // محاسبه عرض مورد نیاز برای این سطح
    const requiredWidth = nodesAtLevel.length * nodeSpacing;

    nodesAtLevel.forEach((node, index) => {
      const x = (index - (nodesAtLevel.length - 1) / 2) * nodeSpacing;
      const y = level * levelSpacing;
      const naturalOffset = compactMode
        ? 0
        : Math.sin(node.id.charCodeAt(0) + level) * 8;

      node.position = {
        x: x + naturalOffset,
        y: y + naturalOffset * 0.5,
      };
    });
  }
  const padding = compactMode ? 80 : 120;
  const allX = layoutedNodes.map((node) => node.position.x);
  const allY = layoutedNodes.map((node) => node.position.y);

  if (allX.length > 0 && allY.length > 0) {
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    layoutedNodes.forEach((node) => {
      node.position.x = node.position.x - centerX + padding;
      node.position.y = node.position.y - centerY + padding;
    });
  }

  return { nodes: layoutedNodes, edges: layoutedEdges };
};
