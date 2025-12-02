import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;

  const indentPerLevel = 40;

  dagreGraph.setGraph({
    rankdir: "TB",
    align: "UL",
    nodesep: 80,
    ranksep: 60,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const lines =
      typeof node.data.label === "string"
        ? node.data.label.split("\n").length
        : 1;
    const height = 60 + lines * 16;
    dagreGraph.setNode(node.id, { width: nodeWidth, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // FIX: Casting depth to number explicitly
    const depth = (node.data.depth as number) || 0;

    const xShift = depth * indentPerLevel;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2 + xShift,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
