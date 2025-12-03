import { Node, Edge } from '@xyflow/react';

export type Direction = 'LR' | 'RL' | 'TB' | 'BT';

interface LayoutOptions {
  direction?: Direction;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  theme?: 'light' | 'dark';
  compactMode?: boolean;
}

const defaultOptions: Required<LayoutOptions> = {
  direction: 'TB',
  horizontalSpacing: 250,
  verticalSpacing: 150,
  theme: 'light',
  compactMode: false,
};

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } => {
  const { direction, horizontalSpacing, verticalSpacing, theme, compactMode } = {
    ...defaultOptions,
    ...options,
  };

  const layoutedNodes = nodes.map((node) => ({ ...node }));
  const layoutedEdges = edges.map((edge) => ({ ...edge }));

  // Adjust spacing based on theme and mode
  const adjustedHorizontalSpacing = compactMode ? horizontalSpacing * 0.7 : horizontalSpacing;
  const adjustedVerticalSpacing = compactMode ? verticalSpacing * 0.7 : verticalSpacing;
  const themeSpacing = theme === 'dark' ? 30 : 20;

  // Group by depth with proper spacing
  const nodesByDepth: { [key: number]: Node[] } = {};
  let maxDepth = 0;

  layoutedNodes.forEach((node) => {
    const depth = node.data?.depth || 0;
    maxDepth = Math.max(maxDepth, depth);
    
    if (!nodesByDepth[depth]) {
      nodesByDepth[depth] = [];
    }
    nodesByDepth[depth].push(node);
  });

  // Apply layout
  switch (direction) {
    case 'LR': // Left to Right
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const spacing = Math.max(adjustedVerticalSpacing, nodesAtDepth.length * 15);
        
        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x: depth * (adjustedHorizontalSpacing + themeSpacing),
            y: (index - (nodesAtDepth.length - 1) / 2) * spacing,
          };
        });
      }
      break;

    case 'RL': // Right to Left
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const spacing = Math.max(adjustedVerticalSpacing, nodesAtDepth.length * 15);
        
        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x: (maxDepth - depth) * (adjustedHorizontalSpacing + themeSpacing),
            y: (index - (nodesAtDepth.length - 1) / 2) * spacing,
          };
        });
      }
      break;

    case 'BT': // Bottom to Top
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        const spacing = Math.max(adjustedHorizontalSpacing, nodesAtDepth.length * 15);
        
        nodesAtDepth.forEach((node, index) => {
          node.position = {
            x: (index - (nodesAtDepth.length - 1) / 2) * spacing,
            y: (maxDepth - depth) * (adjustedVerticalSpacing + themeSpacing),
          };
        });
      }
      break;

    case 'TB': // Top to Bottom (default)
    default:
      for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth[depth] || [];
        
        // Calculate spacing for this depth level
        const nodeCount = nodesAtDepth.length;
        const spacing = Math.max(adjustedVerticalSpacing, nodeCount * 20);
        
        // Apply positions
        nodesAtDepth.forEach((node, index) => {
          const horizontalOffset = depth * themeSpacing * 0.3;
          
          node.position = {
            x: (index - (nodeCount - 1) / 2) * (adjustedHorizontalSpacing + horizontalOffset),
            y: depth * adjustedVerticalSpacing,
          };
        });
      }

      // Adjust overlapping nodes
      for (let i = 0; i < layoutedNodes.length; i++) {
        for (let j = i + 1; j < layoutedNodes.length; j++) {
          const nodeA = layoutedNodes[i];
          const nodeB = layoutedNodes[j];
          
          const dx = Math.abs(nodeA.position.x - nodeB.position.x);
          const dy = Math.abs(nodeA.position.y - nodeB.position.y);
          
          // Minimum distance between nodes
          const minDistance = compactMode ? 100 : 120;
          
          if (dx < minDistance && dy < minDistance) {
            if (nodeA.position.x < nodeB.position.x) {
              nodeA.position.x -= 20;
              nodeB.position.x += 20;
            } else {
              nodeA.position.x += 20;
              nodeB.position.x -= 20;
            }
          }
        }
      }

      // Align connected nodes vertically
      layoutedNodes.forEach((node) => {
        const incomingEdges = layoutedEdges.filter(edge => edge.target === node.id);
        
        if (incomingEdges.length > 0) {
          const sourceNodes = incomingEdges
            .map(edge => layoutedNodes.find(n => n.id === edge.source))
            .filter(Boolean) as Node[];
          
          if (sourceNodes.length > 0) {
            const avgSourceY = sourceNodes.reduce((sum, n) => sum + n.position.y, 0) / sourceNodes.length;
            
            // Only adjust if significantly misaligned
            if (Math.abs(node.position.y - avgSourceY) > adjustedVerticalSpacing * 0.5) {
              node.position.y = avgSourceY;
            }
          }
        }
      });
      break;
  }

  // Center the graph with proper padding
  const padding = compactMode ? 60 : 100;
  const nodesWithPositions = layoutedNodes.filter(n => n.position.x !== undefined && n.position.y !== undefined);
  
  if (nodesWithPositions.length > 0) {
    const allX = nodesWithPositions.map(node => node.position.x);
    const allY = nodesWithPositions.map(node => node.position.y);
    
    const centerX = (Math.min(...allX) + Math.max(...allX)) / 2;
    const centerY = (Math.min(...allY) + Math.max(...allY)) / 2;
    
    layoutedNodes.forEach(node => {
      if (node.position.x !== undefined && node.position.y !== undefined) {
        node.position.x = node.position.x - centerX + padding;
        node.position.y = node.position.y - centerY + padding;
      }
    });
  }

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export const getTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  rootNodeId?: string,
  theme: 'light' | 'dark' = 'light',
  compactMode: boolean = false
): { nodes: Node[]; edges: Edge[] } => {
  const layoutedNodes = nodes.map((node) => ({ ...node }));
  const layoutedEdges = edges.map((edge) => ({ ...edge }));

  // Find root node
  let rootNode = layoutedNodes[0];
  if (rootNodeId) {
    rootNode = layoutedNodes.find(node => node.id === rootNodeId) || layoutedNodes[0];
  }

  // Build tree structure
  const children: { [key: string]: string[] } = {};
  const parents: { [key: string]: string } = {};
  const nodeLevels: { [key: string]: number } = {};
  
  layoutedEdges.forEach(edge => {
    if (!children[edge.source]) children[edge.source] = [];
    children[edge.source].push(edge.target);
    parents[edge.target] = edge.source;
  });

  // Calculate levels (depth)
  const calculateLevels = (nodeId: string, level: number) => {
    nodeLevels[nodeId] = level;
    
    (children[nodeId] || []).forEach(childId => {
      calculateLevels(childId, level + 1);
    });
  };

  calculateLevels(rootNode.id, 0);

  // Group nodes by level
  const nodesByLevel: { [key: number]: Node[] } = {};
  layoutedNodes.forEach(node => {
    const level = nodeLevels[node.id] || 0;
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(node);
  });

  // Calculate positions with proper spacing
  const levelSpacing = compactMode ? 180 : 220;
  const nodeSpacing = compactMode ? 160 : 200;
  const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number));
  
  // Assign positions
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = nodesByLevel[level] || [];
    
    nodesAtLevel.forEach((node, index) => {
      const x = (index - (nodesAtLevel.length - 1) / 2) * nodeSpacing;
      const y = level * levelSpacing;
      
      // Add slight random offset for natural look (optional)
      const randomOffset = compactMode ? 0 : (Math.random() - 0.5) * 10;
      
      node.position = {
        x: x + randomOffset,
        y: y + randomOffset,
      };
    });
  }

  return { nodes: layoutedNodes, edges: layoutedEdges };
};